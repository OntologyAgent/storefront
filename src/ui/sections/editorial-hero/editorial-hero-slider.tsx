"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { NavHrefLink } from "@/ui/atoms/nav-href-link";
import { buttonClassName } from "@/ui/components/ui/button";

import type { HeroSlide } from "@/config/merchandising";

export interface EditorialHeroSliderProps {
	eyebrow?: string;
	heading: string;
	subheading?: string;
	primaryCta?: { label: string; href: string };
	slides: readonly HeroSlide[];
	/** Autoplay interval in ms. `0` disables autoplay entirely. */
	intervalMs?: number;
	id?: string;
	className?: string;
}

/**
 * Editorial hero with a rotating image panel. The copy column stays static so the
 * headline never reflows; only the right-hand panel cross-fades.
 *
 * Autoplay notes:
 * - Advances on a timer and restarts the countdown whenever the visitor navigates.
 * - Only keyboard focus pauses it temporarily (a mouse resting on the hero used to
 *   stop it, which read as "the slider is broken"); the play→pause button pauses it
 *   explicitly for everyone (WCAG 2.2.2 — auto-updating content must be pausable).
 * - `prefers-reduced-motion` no longer disables rotation; it drops the cross-fade
 *   so the swap is instant. Killed autoplay used to look like a broken slider.
 *
 * Client component by necessity (timer + interaction). It renders the first slide
 * on the server, so the hero is never blank before hydration and the LCP image is
 * already in the initial HTML.
 */
export function EditorialHeroSlider({
	eyebrow,
	heading,
	subheading,
	primaryCta,
	slides,
	intervalMs = 5500,
	id = "homepage-hero-heading",
	className,
}: EditorialHeroSliderProps) {
	const [index, setIndex] = useState(0);
	const [focusPaused, setFocusPaused] = useState(false);
	const [userPaused, setUserPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const regionRef = useRef<HTMLDivElement>(null);

	const count = slides.length;
	const go = useCallback(
		(next: number) => {
			if (count === 0) return;
			setIndex(((next % count) + count) % count);
		},
		[count],
	);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setReducedMotion(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);

	const autoplay = intervalMs > 0 && count > 1 && !focusPaused && !userPaused;

	useEffect(() => {
		if (!autoplay) return;
		const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), intervalMs);
		return () => window.clearInterval(timer);
		// `index` is in the deps on purpose: a manual jump restarts the countdown
		// instead of advancing again one tick later.
	}, [autoplay, intervalMs, count, index]);

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			go(index + 1);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			go(index - 1);
		}
	};

	return (
		<section className={cn("border-b border-border bg-background", className)} aria-labelledby={id}>
			<div className="grid items-stretch lg:grid-cols-2">
				<div className="order-2 flex flex-col justify-center px-4 py-section-md sm:px-6 lg:order-1 lg:py-section-lg lg:pl-8 lg:pr-12 xl:pl-16">
					<div className="mx-auto w-full max-w-xl lg:mx-0">
						{eyebrow ? <p className="text-eyebrow uppercase text-muted-foreground">{eyebrow}</p> : null}
						<h1 id={id} className={cn("text-balance text-display text-foreground", eyebrow && "mt-4")}>
							{heading}
						</h1>
						{subheading ? (
							<p className="mt-6 max-w-prose text-pretty text-lead text-muted-foreground">{subheading}</p>
						) : null}
						{primaryCta ? (
							<div className="mt-9 flex flex-wrap gap-3">
								<NavHrefLink
									href={primaryCta.href}
									className={buttonClassName({ asLink: true, size: "lg", variant: "default" })}
								>
									{primaryCta.label}
								</NavHrefLink>
							</div>
						) : null}

						{count > 1 ? (
							<div className="mt-10 flex items-center gap-2">
								{slides.map((slide, i) => (
									<button
										key={slide.src}
										type="button"
										onClick={() => go(i)}
										aria-label={`Show slide ${i + 1}: ${slide.hrefLabel}`}
										aria-current={i === index ? "true" : undefined}
										className={cn(
											"h-1 overflow-hidden rounded-full bg-border transition-all duration-500",
											i === index ? "w-12 bg-border" : "w-4",
										)}
									>
										{i === index ? (
											<span
												className="block h-full w-full origin-left bg-foreground"
												style={{
													animation: autoplay ? `hero-progress ${intervalMs}ms linear forwards` : undefined,
												}}
												key={`${index}-${autoplay}`}
											/>
										) : null}
									</button>
								))}
							</div>
						) : null}
					</div>
				</div>

				<div
					ref={regionRef}
					className="group relative order-1 min-h-[52vh] overflow-hidden bg-secondary lg:order-2 lg:min-h-[80vh]"
					role={count > 1 ? "group" : undefined}
					aria-roledescription={count > 1 ? "carousel" : undefined}
					aria-label={count > 1 ? "Store mood" : undefined}
					tabIndex={count > 1 ? 0 : undefined}
					onKeyDown={count > 1 ? onKeyDown : undefined}
					onFocus={() => setFocusPaused(true)}
					onBlur={() => setFocusPaused(false)}
				>
					{slides.map((slide, i) => (
						<div
							key={slide.src}
							className={cn(
								"absolute inset-0",
								reducedMotion ? "" : "transition-opacity duration-700 ease-out",
								i === index ? "opacity-100" : "pointer-events-none opacity-0",
							)}
							aria-hidden={i === index ? undefined : true}
						>
							<LinkWithChannel
								href={slide.href}
								aria-label={slide.hrefLabel}
								aria-hidden={i === index ? undefined : true}
								tabIndex={i === index ? undefined : -1}
								className="group/slide block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={slide.src}
									alt={slide.alt}
									className="h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none lg:group-hover/slide:scale-[1.02]"
									style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
									loading={i === 0 ? "eager" : "lazy"}
									fetchPriority={i === 0 ? "high" : "auto"}
									decoding="async"
								/>
								<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 sm:p-8">
									<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{slide.kicker}</p>
									{slide.caption ? (
										<p className="mt-1 max-w-xs text-balance text-sm font-medium leading-snug text-white">
											{slide.caption}
										</p>
									) : null}
									<span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors group-hover/slide:bg-white/30">
										{slide.hrefLabel}
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</div>
							</LinkWithChannel>
						</div>
					))}

					{count > 1 ? (
						<>
							<div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
								<button
									type="button"
									onClick={() => setUserPaused((value) => !value)}
									aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
									className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
								>
									{userPaused ? (
										<Play className="h-3.5 w-3.5" aria-hidden="true" />
									) : (
										<Pause className="h-3.5 w-3.5" aria-hidden="true" />
									)}
								</button>
								<button
									type="button"
									onClick={() => go(index - 1)}
									aria-label="Previous slide"
									className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
								>
									<ChevronLeft className="h-4 w-4" aria-hidden="true" />
								</button>
								<button
									type="button"
									onClick={() => go(index + 1)}
									aria-label="Next slide"
									className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
								>
									<ChevronRight className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
							<p className="pointer-events-none absolute right-4 top-16 z-20 text-[11px] font-medium tabular-nums tracking-[0.14em] text-white/70">
								{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
							</p>
						</>
					) : null}
				</div>
			</div>
		</section>
	);
}
