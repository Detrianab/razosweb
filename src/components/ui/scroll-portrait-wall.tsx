import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type WallPortrait = { src: string; alt: string };

type Props = {
  portraits: WallPortrait[];
  /** Rendered centered above the wall (logo, claim…). */
  children?: ReactNode;
  className?: string;
  /** Scroll length of the stage in viewport heights. */
  vh?: number;
};

/** Deterministic scattered positions so server and client render alike. */
const SPOTS = [
  { left: "8%", top: "12%", w: 190, r: -6 },
  { left: "70%", top: "8%", w: 220, r: 5 },
  { left: "26%", top: "58%", w: 170, r: 4 },
  { left: "78%", top: "56%", w: 200, r: -5 },
  { left: "44%", top: "4%", w: 150, r: 3 },
  { left: "4%", top: "62%", w: 160, r: 7 },
  { left: "56%", top: "70%", w: 180, r: -4 },
  { left: "34%", top: "30%", w: 140, r: -8 },
  { left: "88%", top: "30%", w: 150, r: 6 },
];

export function ScrollPortraitWall({ portraits, children, className = "", vh = 3 }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>(".pw-card");
      gsap.set(cards, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      cards.forEach((card, i) => {
        tl.to(card, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, i * 0.35)
          .to(card, { y: -40, duration: 1.2, ease: "none" }, i * 0.35)
          .to(card, { scale: 0, opacity: 0, duration: 0.5, ease: "power2.in" }, i * 0.35 + 1.1);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`relative ${className}`} style={{ height: `${vh * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {portraits.map((p, i) => {
            const spot = SPOTS[i % SPOTS.length]!;
            return (
              <figure
                key={`${p.src}-${i}`}
                className="pw-card absolute overflow-hidden bg-card shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]"
                style={{
                  left: spot.left,
                  top: spot.top,
                  width: spot.w,
                  transform: `rotate(${spot.r}deg)`,
                }}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              </figure>
            );
          })}
        </div>
        {children ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
