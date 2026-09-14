import { lazy, Suspense, useState, type ReactNode } from "react";
import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useBag } from "@/lib/bag";
import {
  COLLECTIONS,
  FABRIC_COLORS,
  PLACEMENTS,
  SIZES,
  findCollection,
  findDesign,
  findPlacement,
  type PlacementId,
  type Size,
} from "@/lib/trazos";

const ShirtViewer = lazy(() =>
  import("@/components/ShirtViewer").then((m) => ({ default: m.ShirtViewer })),
);

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

type Props = {
  collectionSlug?: string | undefined;
  designId?: string | undefined;
  colorName?: string | undefined;
};

export function AtelierPanel({ collectionSlug, designId, colorName }: Props) {
  const navigate = useNavigate();
  const { add } = useBag();

  const [slug, setSlug] = useState(findCollection(collectionSlug).slug);
  const collection = findCollection(slug);

  const [currentDesignId, setCurrentDesignId] = useState(findDesign(collection, designId).id);
  const design = findDesign(collection, currentDesignId);

  const [colorIndex, setColorIndex] = useState(() => {
    const i = FABRIC_COLORS.findIndex((c) => c.name === colorName);
    return i >= 0 ? i : 0;
  });
  const [size, setSize] = useState<Size>("M");
  const [placementId, setPlacementId] = useState<PlacementId>("frente");
  const [qty, setQty] = useState(1);

  const color = FABRIC_COLORS[colorIndex]!;
  const placement = findPlacement(placementId);

  const selectCollection = (next: string) => {
    setSlug(next);
    setCurrentDesignId(findCollection(next).designs[0]!.id);
  };

  const addToBag = () => {
    add({
      designId: design.id,
      designTitle: design.title,
      designImage: design.image,
      collectionName: collection.name,
      colorName: color.name,
      colorHex: color.hex,
      size,
      placementId,
      qty,
    });
    void navigate({ to: "/bolsa" });
  };

  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      <div className="relative h-[62vh] bg-card lg:sticky lg:top-0 lg:h-[100svh]">
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
              artUrl={design.image}
              placement={{ front: placement.front, back: placement.back }}
            />
          </Suspense>
        </ClientOnly>
        <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground">
          Arrastra para girar · rueda o pinza para acercar
        </p>
      </div>

      <aside className="space-y-12 px-6 py-14 lg:px-12">
        <div>
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
            Colección {collection.name} · {collection.state}
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight">{design.title}</h1>
          <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
            {collection.blurb}
          </p>
        </div>

        <div>
          <Step n={1}>Colección</Step>
          <div className="mt-5 flex flex-wrap gap-3">
            {COLLECTIONS.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCollection(c.slug)}
                aria-pressed={c.slug === collection.slug}
                className={`border px-4 py-2 font-sans text-[0.58rem] uppercase tracking-[0.3em] transition-colors ${
                  c.slug === collection.slug
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Step n={2}>Diseño</Step>
          <div className="mt-5 flex flex-wrap gap-4">
            {collection.designs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setCurrentDesignId(d.id)}
                aria-label={d.title}
                aria-pressed={d.id === design.id}
                className={`h-20 w-20 overflow-hidden border transition-colors ${
                  d.id === design.id ? "border-accent" : "border-border hover:border-accent/60"
                }`}
              >
                <img
                  src={d.image}
                  alt={d.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Step n={3}>Color de la tela — {color.name}</Step>
          <div className="mt-5 flex gap-4">
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
        </div>

        <div>
          <Step n={4}>Talla</Step>
          <div className="mt-5 flex gap-3">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={s === size}
                className={`h-11 w-11 border font-sans text-xs tracking-widest transition-colors ${
                  s === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Step n={5}>Posición del estampado</Step>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PLACEMENTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlacementId(p.id)}
                aria-pressed={p.id === placementId}
                className={`border px-4 py-3 text-left transition-colors ${
                  p.id === placementId
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/60"
                }`}
              >
                <span className="font-sans text-[0.58rem] uppercase tracking-[0.4em] text-accent">
                  {p.n}
                </span>
                <span className="mt-2 block font-serif text-base leading-tight">{p.label}</span>
                <span className="mt-1 block font-sans text-[0.66rem] text-muted-foreground">
                  {p.detail}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Step n={6}>Cantidad</Step>
          <div className="mt-5 flex items-center gap-5">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Quitar una unidad"
              className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="font-serif text-2xl">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              aria-label="Agregar una unidad"
              className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-10">
          <ul className="space-y-2 font-sans text-sm text-muted-foreground">
            <li>
              Diseño · <span className="text-foreground">{design.title}</span>
            </li>
            <li>
              Tela · <span className="text-foreground">{color.name}</span>
            </li>
            <li>
              Talla · <span className="text-foreground">{size}</span>
            </li>
            <li>
              Estampado ·{" "}
              <span className="text-foreground">
                {placement.n}. {placement.label}
              </span>
            </li>
          </ul>
          <button
            type="button"
            onClick={addToBag}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-foreground px-10 py-5 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Agregar a la bolsa
          </button>
          <p className="mt-4 font-sans text-[0.65rem] leading-relaxed text-muted-foreground">
            El pedido se confirma por WhatsApp con precio, disponibilidad y envío.
          </p>
        </div>
      </aside>
    </div>
  );
}
