import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { useBag } from "@/lib/bag";
import { collectionsQuery, designPlacements, GARMENTS } from "@/lib/catalog";
import {
  FABRIC_COLORS,
  PLACEMENTS,
  SIZES,
  UNIT_PRICE,
  findPlacement,
  type PlacementId,
  type Size,
} from "@/lib/trazos";

const ShirtViewer = lazy(() =>
  import("@/components/ShirtViewer").then((m) => ({ default: m.ShirtViewer })),
);

const searchSchema = z.object({
  coleccion: z.string().optional(),
  diseno: z.string().optional(),
  color: z.string().optional(),
  prenda: z.enum(["franela", "chemise", "hoodie"]).optional(),
});

export const Route = createFileRoute("/personalizar")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionsQuery),
  head: () => ({
    meta: [
      { title: "Personaliza tu prenda en 3D — Trazos" },
      {
        name: "description",
        content:
          "Elige franela, chemise o hoodie, el color, la talla y dónde va el estampado. Todo se ve en 3D antes de comprar.",
      },
      { property: "og:title", content: "Personaliza tu prenda en 3D — Trazos" },
      {
        property: "og:description",
        content: "Diseña tu prenda con arte de los estados de Venezuela y míralas en 3D.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Customizer,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">
        No pudimos cargar los diseños. Recarga la página en un momento.
      </p>
    </main>
  ),
});

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent text-[0.6rem] tracking-normal text-accent">
        {n}
      </span>
      {children}
    </p>
  );
}

function Customizer() {
  const search = Route.useSearch();
  const { data: collections } = useSuspenseQuery(collectionsQuery);
  const navigate = useNavigate();
  const { add } = useBag();

  const [garment, setGarment] = useState(search.prenda ?? "franela");
  const [slug, setSlug] = useState(
    collections.find((c) => c.slug === search.coleccion)?.slug ?? collections[0]?.slug ?? "",
  );
  const collection = collections.find((c) => c.slug === slug) ?? collections[0];
  const designs = collection?.designs ?? [];
  const [designId, setDesignId] = useState(
    designs.find((d) => d.id === search.diseno)?.id ?? designs[0]?.id ?? "",
  );
  const design = designs.find((d) => d.id === designId) ?? designs[0];

  const allowed = useMemo(() => designPlacements(design), [design]);
  const [colorIndex, setColorIndex] = useState(() => {
    const i = FABRIC_COLORS.findIndex((c) => c.name === search.color);
    return i >= 0 ? i : 0;
  });
  const [size, setSize] = useState<Size>("M");
  const [placementId, setPlacementId] = useState<PlacementId>(allowed[0] ?? "frente");
  const [qty, setQty] = useState(1);

  const color = FABRIC_COLORS[colorIndex]!;
  const placement = findPlacement(allowed.includes(placementId) ? placementId : allowed[0]!);
  const garmentLabel = GARMENTS.find((g) => g.id === garment)?.label ?? "Franela";

  if (!collection || !design) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
        <p className="font-sans text-sm text-muted-foreground">
          Todavía no hay diseños cargados. Vuelve pronto.
        </p>
      </main>
    );
  }

  const addToBag = () => {
    add({
      kind: "personalizada",
      garment: garmentLabel,
      unitPrice: UNIT_PRICE,
      designId: design.id,
      designTitle: design.title,
      designImage: design.image_url,
      collectionName: collection.name,
      colorName: color.name,
      colorHex: color.hex,
      size,
      placementId: placement.id,
      qty,
    });
    void navigate({ to: "/bolsa" });
  };

  return (
    <main className="min-h-screen bg-background pt-16 text-foreground">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="sticky top-16 z-10 h-[46vh] bg-card sm:h-[54vh] lg:top-0 lg:h-[100svh]">
          <ClientOnly
            fallback={
              <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
                Preparando la prenda
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
                  Cargando el 3D
                </div>
              }
            >
              <ShirtViewer
                color={color.hex}
                artUrl={design.image_url}
                placement={{ front: placement.front, back: placement.back }}
              />
            </Suspense>
          </ClientOnly>
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.5rem] uppercase tracking-[0.35em] text-muted-foreground sm:text-[0.55rem]">
            Arrastra para girar · rueda o pinza para acercar
          </p>
        </div>

        <aside className="space-y-11 px-6 py-12 lg:px-12">
          <div>
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
              {garmentLabel} · Colección {collection.name}
            </p>
            <h1 className="mt-4 font-serif text-3xl leading-tight">{design.title}</h1>
            <p className="mt-3 font-sans text-sm text-muted-foreground">
              ${UNIT_PRICE.toFixed(0)} · {collection.blurb}
            </p>
          </div>

          <div>
            <Step n={1}>Tipo de prenda</Step>
            <div className="mt-4 flex flex-wrap gap-3">
              {GARMENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGarment(g.id)}
                  className={`border px-5 py-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] transition-colors ${
                    garment === g.id ? "border-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Step n={2}>Color</Step>
            <div className="mt-4 flex flex-wrap gap-3">
              {FABRIC_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColorIndex(i)}
                  className={`h-10 w-10 rounded-full border transition-transform ${
                    colorIndex === i ? "scale-110 border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <Step n={3}>Talla</Step>
            <div className="mt-4 flex flex-wrap gap-3">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`border px-5 py-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] transition-colors ${
                    size === s ? "border-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Step n={4}>Estado y diseño</Step>
            <div className="mt-4 flex flex-wrap gap-3">
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSlug(c.slug);
                    setDesignId(c.designs[0]?.id ?? "");
                  }}
                  className={`border px-5 py-3 font-sans text-[0.58rem] uppercase tracking-[0.3em] transition-colors ${
                    slug === c.slug ? "border-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              {designs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDesignId(d.id)}
                  className={`w-24 border p-1 transition-colors ${
                    designId === d.id ? "border-foreground" : "border-border"
                  }`}
                >
                  <img src={d.image_url} alt={d.title} className="h-20 w-full object-cover" />
                  <span className="mt-1 block font-sans text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {d.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Step n={5}>Posición del estampado</Step>
            <div className="mt-4 space-y-3">
              {PLACEMENTS.filter((p) => allowed.includes(p.id)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlacementId(p.id)}
                  className={`flex w-full items-center gap-4 border px-5 py-4 text-left transition-colors ${
                    placement.id === p.id ? "border-foreground" : "border-border"
                  }`}
                >
                  <span className="font-sans text-[0.6rem] text-accent">{p.n}</span>
                  <span>
                    <span className="block font-sans text-[0.62rem] uppercase tracking-[0.3em]">
                      {p.label}
                    </span>
                    <span className="mt-1 block font-sans text-[0.62rem] text-muted-foreground">
                      {p.detail}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Step n={6}>Cantidad</Step>
            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center border border-border"
                aria-label="Menos"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center font-sans text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="flex h-11 w-11 items-center justify-center border border-border"
                aria-label="Más"
              >
                <Plus className="h-3 w-3" />
              </button>
              <span className="ml-auto font-sans text-sm">
                ${(UNIT_PRICE * qty).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={addToBag}
            className="flex w-full items-center justify-center gap-3 bg-foreground px-10 py-5 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Agregar a la bolsa
          </button>
        </aside>
      </div>
    </main>
  );
}
