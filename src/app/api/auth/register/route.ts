import { NextRequest, NextResponse } from "next/server";
import { rejectIfRateLimited } from "@/lib/auth/auth-rate-limit";
import { isAllowedRedirectUrl } from "@/lib/auth/validate-redirect-url";
import { rawMutation, asValidationError, getUserMessage, mutate } from "@/lib/saleor";
import { signInWithPassword } from "@/lib/auth/bff-server";
import { AccountUpdateDocument } from "@/gql/graphql";
import { isPickupRegionSlug } from "@/checkout/lib/regions";

const REGISTER_MUTATION = `
  mutation AccountRegister($input: AccountRegisterInput!) {
    accountRegister(input: $input) {
      user {
        id
        email
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

interface RegisterRequest {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	/** Pickup region slug chosen at sign-up (see checkout/lib/regions). */
	pickupRegion?: string;
	channel: string;
	redirectUrl: string;
}

interface AccountRegisterResult {
	accountRegister?: {
		user?: { id: string; email: string };
		errors?: Array<{ field?: string | null; message: string; code?: string | null }>;
	};
}

export async function POST(request: NextRequest) {
	const rateLimited = rejectIfRateLimited(request, "register", { limit: 5, windowMs: 60 * 60 * 1000 });
	if (rateLimited) {
		return rateLimited;
	}

	let body: RegisterRequest;
	try {
		body = (await request.json()) as RegisterRequest;
	} catch {
		return NextResponse.json(
			{ errors: [{ message: "Invalid request body", code: "INVALID_JSON" }] },
			{ status: 400 },
		);
	}

	const { email, password, firstName, lastName, pickupRegion, channel, redirectUrl } = body;

	if (!email || !password) {
		return NextResponse.json(
			{ errors: [{ message: "Email and password are required", code: "REQUIRED" }] },
			{ status: 400 },
		);
	}

	// Confirmation emails embed this URL — only this deployment's surfaces are allowed.
	if (redirectUrl && !isAllowedRedirectUrl(redirectUrl)) {
		console.warn(
			"Received an invalid redirection URL for password reset. " +
				"Make sure to configure NEXT_PUBLIC_STOREFRONT_URL, " +
				"see https://github.com/saleor/saleor-docs/blob/-/docs/configuration/allowed-origins.md",
			{ redirectUrl },
		);
		return NextResponse.json(
			{
				errors: [{ message: "Invalid redirect URL. See server logs for more information.", code: "INVALID" }],
			},
			{ status: 400 },
		);
	}

	const result = await rawMutation<AccountRegisterResult>({
		query: REGISTER_MUTATION,
		variables: {
			input: {
				email,
				password,
				firstName: firstName || "",
				lastName: lastName || "",
				channel,
				redirectUrl,
			},
		},
	});

	// Network or GraphQL error
	if (!result.ok) {
		console.error("Registration error:", result.error.type);
		return NextResponse.json(
			{ errors: [{ message: getUserMessage(result.error), code: result.error.type.toUpperCase() }] },
			{ status: result.error.type === "network" ? 503 : 400 },
		);
	}

	const accountRegister = result.data.accountRegister;

	// Saleor validation errors
	if (accountRegister?.errors?.length) {
		const validationResult = asValidationError(accountRegister.errors);
		return NextResponse.json({ errors: validationResult.error.validationErrors }, { status: 400 });
	}

	// Persist the pickup region on the new customer. This needs a session, so sign in
	// once and write the metadata — otherwise the customer has to set it by hand later.
	const region = isPickupRegionSlug(pickupRegion) ? pickupRegion : null;
	if (region) {
		try {
			const signIn = await signInWithPassword(email, password);
			if (signIn.ok) {
				await mutate(AccountUpdateDocument, {
					variables: { input: { metadata: [{ key: "pickup_region", value: region }] } },
				});
			}
		} catch (error) {
			// Registration already succeeded; a missing region only means the customer
			// picks it later from account settings.
			console.warn("Failed to store pickup region:", error);
		}
	}

	// Success
	return NextResponse.json({
		user: accountRegister?.user,
		message: "Account created successfully. Please check your email to verify your account.",
	});
}
