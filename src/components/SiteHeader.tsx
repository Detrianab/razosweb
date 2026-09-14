import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { TrazosMark } from "@/components/TrazosMark";
import { useBag } from "@/lib/bag";

const LINKS = [
  { label: "Ver en 3D", to: "/", hash: "visor" },
  { label: "Colecciones", to: "/", hash: "colecciones" },
] as const;

export function SiteHeader() {
  const { count } = useBag();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-500 ${
        solid ? "border-b border-border bg-background/95" : "border-b border-border/40 bg-background/75"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" aria-label="Trazos — inicio" className="transition-opacity hover:opacity-70">
          <TrazosMark className="h-9 sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Navegación principal">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={l.hash}
              className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/taller"
            className="hidden bg-foreground px-6 py-3 font-sans text-[0.58rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85 sm:inline-block"
          >
            Diseñar mi prenda
          </Link>
          <Link
            to="/bolsa"
            aria-label={`Bolsa de compras (${count})`}
            className="relative flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center bg-accent px-1 font-sans text-[0.55rem] text-accent-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
