import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Rotate3d } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TrazosMark } from "@/components/TrazosMark";
import { CollectionsSection } from "@/components/CollectionsSection";
import { collectionsQuery, productsQuery, productStock, textsQuery } from "@/lib/catalog";
import { BRAND_TAGLINE, FABRIC_COLORS, WHATSAPP_DISPLAY } from "@/lib/trazos";
import heroRoques from "@/assets/hero-image.png.asset.json";
import heroCanaima from "@/assets/hero-image-2.png.asset.json";
import heroMerida from "@/assets/hero-image-3.png.asset.json";
import heroZulia from "@/assets/hero-image-4.png.asset.json";
import heroFalcon from "@/assets/hero-image-5.png.asset.json";

const MorphSlider = lazy(() => import("@/components/ui/MorphSlider"));
const ShirtViewer = lazy(() =>
  import("@/components/ShirtViewer").then((m) => ({ default: m.ShirtViewer })),
);

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(collectionsQuery),
      context.queryClient.ensureQueryData(textsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Trazos — Coordenadas Artísticas de Venezuela" },
      {
        name: "description",
        content:
          "Prendas de autor con las coordenadas de Los Roques, Canaima, Mérida, Zulia y los Médanos de Coro. Compra de colección o personaliza tu prenda en 3D.",
      },
      { property: "og:title", content: "Trazos — Coordenadas Artísticas de Venezuela" },
      {
        property: "og:description",
        content:
          "Tienda de colección en edición limitada y personalización en 3D: color, talla y posición del estampado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">
        No pudimos cargar la tienda. Recarga la página en un momento.
      </p>
    </main>
  ),
});

const HERO_SLIDES = [
  { image: heroRoques.url, caption: "Los Roques" },
  { image: heroCanaima.url, caption: "Canaima" },
  { image: heroMerida.url, caption: "Sierra Nevada, Mérida" },
  { image: heroZulia.url, caption: "Salinas del Zulia" },
  { image: heroFalcon.url, caption: "Médanos de Coro" },
];

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: collections } = useSuspenseQuery(collectionsQuery);
  const { data: texts } = useSuspenseQuery(textsQuery);
  const t = (key: string, fallback: string) => texts[key] ?? fallback;

  const shopRef = useRef<HTMLElement>(null);
  const customRef = useRef<HTMLElement>(null);
  const collectionsRef = useRef<HTMLElement>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const color = FABRIC_COLORS[colorIndex]!;
  const showcase = collections[0]?.designs[0];

  // La portada siempre se ve completa al abrir el sitio.
  useEffect(() => {
    if (window.location.hash) return;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const scrollTo = useCallback(
    (ref: React.RefObject<HTMLElement | null>) =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    [],
  );

  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
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
          <TrazosMark tone="light" className="h-32 animate-fade-in sm:h-52" />
          <div
            aria-hidden
            className="mt-8 h-px w-24 bg-white/60"
            style={{ boxShadow: "0 0 14px rgba(0,0,0,0.5)" }}
          />
          <p
            className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.62em] text-white sm:text-[0.72rem]"
            style={{ textShadow: "0 1px 14px rgba(0,0,0,0.6)" }}
          >
            {t("home_tagline", BRAND_TAGLINE)}
          </p>
          <div className="mt-12">
            <button
              type="button"
              onClick={() => scrollTo(shopRef)}
              className="inline-flex items-center justify-center gap-3 bg-white px-10 py-4 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-black transition-opacity hover:opacity-85"
            >
              Entrar a la tienda
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Segundo scroll: tienda de colección */}
      <section ref={shopRef} id="coleccion" className="scroll-mt-20 border-b border-border py-24">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <Reveal>
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.5em] text-accent">
              {t("home_collection_eyebrow", "La tienda")}
            </p>
            <h2 className="mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
              {t("home_collection_title", "Nuevos lanzamientos, edición limitada")}
            </h2>
            <p className="mt-6 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
              {t(
                "home_collection_text",
                "Piezas numeradas de nuestras colecciones por estado. Desliza de lado para verlas todas.",
              )}
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const stock = productStock(p);
              return (
                <Link
                  key={p.id}
                  to="/tienda/$productSlug"
                  params={{ productSlug: p.slug }}
                  className="group"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-card">
                    <img
                      src={p.front_image_url}
                      alt={p.name}
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-xl">{p.name}</h3>
                    <span className="font-sans text-sm">${Number(p.price).toFixed(0)}</span>
                  </div>
                  <p className="mt-2 font-sans text-[0.58rem] uppercase tracking-[0.35em] text-muted-foreground">
                    {stock > 0 ? `${stock} disponibles` : "Agotado"}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-12">
            <Link
              to="/tienda"
              className="inline-flex items-center gap-3 border border-foreground px-10 py-5 font-sans text-[0.64rem] uppercase tracking-[0.4em] transition-colors hover:bg-foreground hover:text-background"
            >
              Ver toda la tienda
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tercer scroll: personalización en 3D */}
      <section ref={customRef} id="personalizar" className="scroll-mt-20 border-b border-border bg-card/40">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pt-24 text-center">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.5em] text-accent">
            {t("home_custom_eyebrow", "Personaliza")}
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-6xl">
            {t("home_custom_title", "Diseña tu prenda y míralas en 3D")}
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            {t(
              "home_custom_text",
              "Elige el tipo de prenda, el color, la talla y dónde va el estampado. Todo se ve en 3D antes de comprar.",
            )}
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-[56svh] max-w-4xl sm:h-[62svh]">
          <ClientOnly fallback={<div className="h-full w-full bg-card" />}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
                  Cargando el 3D
                </div>
              }
            >
              {showcase ? (
                <ShirtViewer
                  color={color.hex}
                  artUrl={showcase.image_url}
                  placement={{ front: "big", back: false }}
                />
              ) : null}
            </Suspense>
          </ClientOnly>
        </div>

        <p className="pb-6 text-center font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground">
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

        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pt-10 pb-24 text-center">
          <button
            type="button"
            onClick={() => scrollTo(collectionsRef)}
            className="group inline-flex w-full items-center justify-center gap-4 bg-foreground px-10 py-7 font-sans text-[0.7rem] leading-relaxed uppercase tracking-[0.35em] text-background transition-opacity hover:opacity-85 sm:text-[0.78rem]"
          >
            <Rotate3d className="h-4 w-4" aria-hidden="true" />
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
        className="scroll-mt-20 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 py-24 sm:py-32"
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
          {collections.length} colecciones · nuevas coordenadas cada temporada
        </p>
      </section>

      <footer className="border-t border-border px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <TrazosMark className="h-16" />
          <div className="font-sans text-xs leading-relaxed tracking-[0.2em] text-muted-foreground">
            <p>{t("footer_note", "Caracas · Venezuela")}</p>
            <p className="mt-2">WhatsApp {WHATSAPP_DISPLAY} · @trazos</p>
            <Link
              to="/personalizar"
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
