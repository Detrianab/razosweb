import { useEffect, useRef, type ReactNode } from "react";

/** Fila que se recorre arrastrando con el dedo o el ratón, sin flechas. */
export function SwipeRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const onUp = () => {
      down = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}
