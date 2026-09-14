import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { ArrowRight, Rotate3d } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TrazosMark } from "@/components/TrazosMark";
import { CollectionsSection } from "@/components/CollectionsSection";
import {
  BRAND_TAGLINE,
  COLLECTIONS,
  FABRIC_COLORS,
  WHATSAPP_DISPLAY,
} from "@/lib/trazos";
import heroRoques from "@/assets/hero-image.png";
import heroCanaima from "@/assets/hero-image-2.webp";
import heroMerida from "@/assets/hero-image-3.png";
import heroZulia from "@/assets/hero-image-4.png";
import heroFalcon from "@/assets/hero-image-5.png";

const MorphSlider = lazy(() => import("@/components/ui/MorphSlider"));
const ShirtViewer = lazy(() =>
  import("@/components/ShirtViewer").then((m) => ({ default: m.ShirtViewer })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trazos — Coordenadas Artísticas de Venezuela" },
      {
        name: "description",
        content:
          "Prendas de autor con las coordenadas de Los Roques, Canaima, Mérida, Zulia y los Médanos de Coro. Visualiza tu prenda en 3D y encarga por WhatsApp.",
      },
      { property: "og:title", content: "Trazos — Coordenadas Artísticas de Venezuela" },
      {
        property: "og:description",
        content:
          "Colecciones por estado, visor 3D en vivo, color de tela, talla y posición del estampado. Pedido directo por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const HERO_SLIDES = [
  { image: heroRoques, caption: "Los Roques" },
  { image: heroCanaima, caption: "Canaima" },
  { image: heroMerida, caption: "Sierra Nevada, Mérida" },
  { image: heroZulia, caption: "Salinas del Zulia" },
  { image: heroFalcon, caption: "Médanos de Coro" },
];

const SHOWCASE = COLLECTIONS[0]!.designs[0]!;

function Home() {
  const viewerRef = useRef<HTMLElement>(null);
  const collectionsRef = useRef<HTMLElement>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const color = FABRIC_COLORS[colorIndex]!;

  const scrollTo = useCallback(
    (ref: React.RefObject<HTMLElement | null>) =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    [],
  );

  return (
    <main className="bg-background text-foreground">
      {/* Hero: carrusel de paisajes venezolanos */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <ClientOnly fallback={<div className="absolute inset-0 bg-card" />}>
          <MorphSlider
            items={HERO_SLIDES}
            transition="melt"
            autoplay
            autoplayDelay={2.4}
            duration={1.05}
            intensity={0.42}
            radius={0}
            showCaptions
            showControls={false}
            showIndicators
            className="absolute inset-0 h-full w-full"
          />
        </ClientOnly>

        {/* Velo para que el texto se lea sobre cualquier foto */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 78% 52% at 50% 50%, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.34) 58%, rgba(0,0,0,0.14) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <TrazosMark tone="light" className="h-36 animate-fade-in sm:h-52" />
          <div
            aria-hidden
            className="mt-8 h-px w-24 bg-white/60"
            style={{ boxShadow: "0 0 14px rgba(0,0,0,0.5)" }}
          />
          <p
            className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.62em] text-white sm:text-[0.72rem]"
            style={{ textShadow: "0 1px 14px rgba(0,0,0,0.6)" }}
          >
            {BRAND_TAGLINE}
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollTo(viewerRef)}
              className="inline-flex items-center justify-center gap-3 bg-white px-10 py-4 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-black transition-opacity hover:opacity-85"
            >
              <Rotate3d className="h-4 w-4" aria-hidden="true" />
              Diseñar mi prenda
            </button>
            <button
              type="button"
              onClick={() => scrollTo(collectionsRef)}
              className="inline-flex items-center justify-center gap-3 border border-white/80 px-10 py-4 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
            >
              Ver colecciones
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Segundo scroll: el visualizador 3D */}
      <section
        ref={viewerRef}
        id="visor"
        className="scroll-mt-20 border-b border-border bg-card/40"
      >
        <div className="mx-auto max-w-6xl px-6 pt-24 text-center">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.5em] text-accent">
            La prenda en 3D
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-6xl">
            Gírala, míralas de cerca, elige su tela
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            Todas nuestras prendas se ven en 3D. Arrástrala con el dedo o el ratón y cambia el color
            de la tela en vivo.
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-[62svh] max-w-4xl">
          <ClientOnly fallback={<div className="h-full w-full bg-card" />}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
                  Cargando el 3D
                </div>
              }
            >
              <ShirtViewer
                color={color.hex}
                artUrl={SHOWCASE.image}
                placement={{ front: "big", back: false }}
              />
            </Suspense>
          </ClientOnly>
        </div>

        <p className="pb-6 text-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
          Arrastra para girar · rueda o pinza para acercar
        </p>

        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 px-6 pb-4">
          {FABRIC_COLORS.map((c, i) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColorIndex(i)}
              aria-label={c.name}
              aria-pressed={i === colorIndex}
              className={`h-9 w-9 rounded-full border transition-transform ${
                i === colorIndex ? "scale-110 border-accent" : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* CTA grande hacia las colecciones */}
        <div className="mx-auto max-w-4xl px-6 pt-10 pb-24 text-center">
          <button
            type="button"
            onClick={() => scrollTo(collectionsRef)}
            className="group inline-flex w-full items-center justify-center gap-4 bg-foreground px-10 py-7 font-sans text-[0.7rem] leading-relaxed uppercase tracking-[0.35em] text-background transition-opacity hover:opacity-85 sm:text-[0.78rem]"
          >
            Ver colecciones por estado para personalizar tu camisa
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
          <p className="mt-5 font-sans text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground">
            Elige el estado · lee su historia · personaliza en 3D
          </p>
        </div>
      </section>

      {/* Colecciones por estado */}
      <section
        ref={collectionsRef}
        id="colecciones"
        className="scroll-mt-20 mx-auto max-w-6xl px-6 py-24 sm:py-32"
      >
        <Reveal className="text-center">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.5em] text-accent">
            Las colecciones
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
            Un estado de Venezuela por colección
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            Entra en una colección para leer su historia, ver cómo se diseñó la prenda y
            personalizarla en 3D.
          </p>
        </Reveal>

        <div className="mt-16">
          <CollectionsSection />
        </div>

        <p className="mt-12 text-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
          {COLLECTIONS.length} colecciones · nuevas coordenadas cada temporada
        </p>
      </section>

      <footer className="border-t border-border px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <TrazosMark className="h-16" />
          <div className="font-sans text-xs leading-relaxed tracking-[0.2em] text-muted-foreground">
            <p>Caracas · Venezuela</p>
            <p className="mt-2">WhatsApp {WHATSAPP_DISPLAY} · @trazos</p>
            <Link
              to="/taller"
              className="mt-3 inline-block underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Personalizar en 3D
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}