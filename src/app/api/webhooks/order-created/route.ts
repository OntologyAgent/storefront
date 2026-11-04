import { NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/api-auth";
import { pickupCodeFor } from "@/lib/pickup-code";

/**
 * Saleor `ORDER_CREATED` webhook → merchant Telegram receipt.
 *
 * The webhook subscription query (registered in the Dashboard or via `webhookCreate`)
 * must select exactly the fields formatted below; unknown/missing fields degrade to
 * sensible fallbacks instead of failing the delivery.
 *
 * Env:
 *   SALEOR_WEBHOOK_SECRET  – the secret set on the Saleor webhook (HMAC verification)
 *   TELEGRAM_BOT_TOKEN     – @BotFather token; when missing the payload is only logged
 *   TELEGRAM_CHAT_ID       – merchant group/channel id (e.g. -1001234567890)
 */

type Money = { amount: number; currency?: string } | null | undefined;

type WebhookLine = {
	productName?: string | null;
	variantName?: string | null;
	quantity?: number | null;
	totalPrice?: { gross?: Money } | null;
};

type WebhookOrder = {
	number?: string | null;
	userEmail?: string | null;
	created?: string | null;
	collectionPointName?: string | null;
	shippingAddress?: {
		firstName?: string | null;
		lastName?: string | null;
		phone?: string | null;
		city?: string | null;
	} | null;
	total?: { gross?: Money } | null;
	shippingPrice?: { gross?: Money } | null;
	lines?: WebhookLine[] | null;
};

function escapeHtml(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(value: Money | undefined, fallbackCurrency = "AUD"): string {
	if (!value?.amount && value?.amount !== 0) return "—";
	const currency = value.currency ?? fallbackCurrency;
	try {
		return new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(value.amount);
	} catch {
		return `${currency} ${value.amount.toFixed(2)}`;
	}
}

/** Receipt text — deliberately plain so it reads well in a Telegram group. */
export function formatOrderReceipt(order: WebhookOrder): string {
	const customer = [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
		.filter(Boolean)
		.join(" ");
	const pickup = order.collectionPointName ?? "Click & collect";
	const code = pickupCodeFor(order.number);

	const lines = (order.lines ?? []).map((line) => {
		const name = line.productName ?? "Item";
		const variant = line.variantName ? ` — ${line.variantName}` : "";
		const qty = line.quantity ?? 1;
		return `• ${qty} × ${escapeHtml(name)}${escapeHtml(variant)}  ${money(line.totalPrice?.gross)}`;
	});

	return [
		`🧾 <b>New pickup order #${escapeHtml(String(order.number ?? "—"))}</b>`,
		`📍 <b>${escapeHtml(pickup)}</b>`,
		"",
		...lines,
		"",
		`Subtotal incl. delivery: <b>${money(order.total?.gross)}</b>`,
		order.shippingPrice?.gross?.amount ? `Delivery: ${money(order.shippingPrice.gross)}` : "Delivery: free (pickup)",
		"",
		`Pickup code: <b>${escapeHtml(code.display)}</b>  (order #${escapeHtml(String(order.number ?? "—"))})`,
		customer ? `Customer: ${escapeHtml(customer)}` : null,
		order.shippingAddress?.phone ? `Phone: ${escapeHtml(order.shippingAddress.phone)}` : null,
		order.userEmail ? `Email: ${escapeHtml(order.userEmail)}` : null,
	].filter((line): line is string => line !== null).join("\n");
}

async function sendTelegram(text: string): Promise<{ ok: boolean; detail?: string }> {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;
	if (!token || !chatId) {
		return { ok: false, detail: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured" };
	}

	const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			chat_id: chatId,
			text,
			parse_mode: "HTML",
			disable_web_page_preview: true,
		}),
	});

	if (!response.ok) {
		return { ok: false, detail: `${response.status} ${(await response.text()).slice(0, 200)}` };
	}
	return { ok: true };
}

export async function POST(request: NextRequest) {
	const rawBody = await request.text();
	const signature = request.headers.get("saleor-signature");

	if (!verifyWebhookSignature(rawBody, signature)) {
		console.warn("[order-created] Invalid webhook signature");
		return Response.json({ error: "Invalid signature" }, { status: 401 });
	}

	let order: WebhookOrder | undefined;
	try {
		const payload = JSON.parse(rawBody) as { order?: WebhookOrder };
		order = payload.order;
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (!order) {
		return Response.json({ ok: true, skipped: "no order in payload" });
	}

	const receipt = formatOrderReceipt(order);
	const result = await sendTelegram(receipt);

	if (result.ok) {
		console.info(`[order-created] Telegram sent for #${order.number}`);
	} else {
		// Never fail the webhook: Saleor would retry and we would spam logs. The order
		// itself is safe in the Dashboard; the merchant can re-send manually.
		console.warn(`[order-created] Telegram not sent: ${result.detail}`);
		console.info(`[order-created] receipt for #${order.number}:\n${receipt}`);
	}

	return Response.json({ ok: true, telegram: result.ok });
}
