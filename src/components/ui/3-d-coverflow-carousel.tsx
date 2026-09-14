import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselItem = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  onSelect: () => void;
};

type Props = {
  items: CarouselItem[];
  className?: string;
};

/** Carrusel coverflow 3D, sin dependencias externas. */
export function CoverflowCarousel({ items, className = "" }: Props) {
  const [active, setActive] = useState(0);
  const dragX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const activeItem = items[active]!;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="group"
      aria-label="Colecciones"
      className={`relative outline-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div
        className="relative h-[420px] select-none sm:h-[520px]"
        style={{ perspective: "1600px" }}
      >
        {items.map((item, i) => {
          const rawOffset = i - active;
          const half = Math.floor(items.length / 2);
          const offset =
            rawOffset > half
              ? rawOffset - items.length
              : rawOffset < -half
                ? rawOffset + items.length
                : rawOffset;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          const hidden = abs > 2;

          return (
            <button
              key={item.id}
              type="button"
              aria-hidden={hidden}
              tabIndex={isActive ? 0 : -1}
              onClick={() => (isActive ? item.onSelect() : setActive(i))}
              className="absolute top-1/2 left-1/2 w-[260px] cursor-pointer sm:w-[340px]"
              style={{
                transform: `translate(-50%, -50%) translateX(${offset * 235}px) translateZ(${-abs * 260}px) rotateY(${offset * -38}deg) scale(${isActive ? 1 : 0.9})`,
                opacity: hidden ? 0 : 1 - abs * 0.32,
                zIndex: 20 - abs,
                transition: "transform 900ms cubic-bezier(0.22,1,0.36,1), opacity 700ms ease",
                pointerEvents: hidden ? "none" : "auto",
                transformStyle: "preserve-3d",
              }}
            >
              <figure
                className="overflow-hidden border border-border bg-card text-left"
                style={{
                  boxShadow: isActive
                    ? "0 50px 90px -40px rgba(0,0,0,0.65)"
                    : "0 30px 60px -35px rgba(0,0,0,0.5)",
                }}
              >
                <div className="relative h-[280px] overflow-hidden sm:h-[360px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-1000"
                    style={{ transform: isActive ? "scale(1.02)" : "scale(1)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-sans text-[0.5rem] uppercase tracking-[0.45em] text-accent">
                      {item.eyebrow}
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-tight text-white">
                      {item.title}
                    </p>
                  </figcaption>
                </div>
                <div className="px-5 py-5">
                  <p className="line-clamp-2 font-sans text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-block border-b border-foreground/40 pb-1 font-sans text-[0.55rem] uppercase tracking-[0.4em]">
                    {item.ctaLabel}
                  </span>
                </div>
              </figure>
              {/* Reflejo */}
              <div
                aria-hidden
                className="mt-1 h-24 w-full overflow-hidden opacity-25"
                style={{
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
                }}
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-[280px] w-full -scale-y-100 object-cover"
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Colección anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={item.title}
              aria-current={i === active}
              className={`h-[2px] transition-all duration-500 ${
                i === active ? "w-10 bg-foreground" : "w-5 bg-border hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Siguiente colección"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-6 text-center font-sans text-[0.58rem] uppercase tracking-[0.45em] text-muted-foreground">
        {activeItem.eyebrow} · arrastra para explorar
      </p>
    </div>
  );
}

export default CoverflowCarousel;
