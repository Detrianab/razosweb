import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useBag } from "@/lib/bag";
import { productsQuery, type DbVariant } from "@/lib/catalog";
import type { Size } from "@/lib/trazos";

export const Route = createFileRoute("/tienda/$productSlug")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(productsQuery);
    const product = products.find((p) => p.slug === params.productSlug);
    if (!product) throw notFound();
    return { name: product.name, description: product.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Prenda"} — Trazos` },
      { name: "description", content: loaderData?.description ?? "Prenda de edición limitada." },
      { property: "og:title", content: `${loaderData?.name ?? "Prenda"} — Trazos` },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">No pudimos cargar esta prenda.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">Esta prenda ya no está disponible.</p>
    </main>
  ),
});

function ProductPage() {
  const { productSlug } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery);
  const product = products.find((p) => p.slug === productSlug)!;
  const navigate = useNavigate();
  const { add } = useBag();

  const colors = [...new Set(product.variants.map((v) => v.color_name))];
  const [colorName, setColorName] = useState(colors[0] ?? "");
  const sizes = product.variants.filter((v) => v.color_name === colorName);
  const [size, setSize] = useState(sizes[0]?.size ?? "M");
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<"front" | "back">("front");

  const variant: DbVariant | undefined = product.variants.find(
    (v) => v.color_name === colorName && v.size === size,
  );
  const stock = variant?.stock ?? 0;

  const addToBag = () => {
    if (!variant || stock < 1) return;
    add({
      kind: "coleccion",
      garment: product.name,
      productId: product.id,
      variantId: variant.id,
      unitPrice: Number(product.price),
      designId: product.slug,
      designTitle: product.name,
      designImage: product.front_image_url,
      collectionName: "Tienda de colección",
      colorName: variant.color_name,
      colorHex: variant.color_hex,
      size: variant.size as Size,
      placementId: "frente",
      qty: Math.min(qty, stock),
    });
    void navigate({ to: "/bolsa" });
  };

  return (
    <main className="min-h-screen bg-background pt-28 pb-24 sm:pt-32 sm:pb-32 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Volver a la tienda
        </Link>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="aspect-[4/5] overflow-hidden bg-card">
              <img
                src={view === "front" ? product.front_image_url : product.back_image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex gap-3">
              {(["front", "back"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`border px-5 py-2 font-sans text-[0.55rem] uppercase tracking-[0.35em] transition-colors ${
                    view === v ? "border-foreground text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {v === "front" ? "Frente" : "Espalda"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
                {product.limited ? "Edición limitada" : "Colección"}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight">{product.name}</h1>
              <p className="mt-4 font-sans text-2xl">${Number(product.price).toFixed(0)}</p>
              <p className="mt-5 font-sans text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div>
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.45em] text-muted-foreground">
                Color
              </p>
              <div className="mt-4 flex gap-3">
                {colors.map((c) => {
                  const hex = product.variants.find((v) => v.color_name === c)?.color_hex ?? "#fff";
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      onClick={() => setColorName(c)}
                      className={`h-10 w-10 rounded-full border transition-transform ${
                        colorName === c ? "scale-110 border-foreground" : "border-border"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.45em] text-muted-foreground">
                Talla
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {sizes.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock < 1}
                    onClick={() => setSize(v.size)}
                    className={`border px-5 py-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] transition-colors disabled:opacity-30 ${
                      size === v.size ? "border-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                {stock > 0 ? `${stock} disponibles en esta talla` : "Agotado en esta talla"}
              </p>
            </div>

            <div className="flex items-center gap-4">
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
                onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
                className="flex h-11 w-11 items-center justify-center border border-border"
                aria-label="Más"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={addToBag}
              disabled={stock < 1}
              className="flex w-full items-center justify-center gap-3 bg-foreground px-10 py-5 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {stock < 1 ? "Agotado" : "Agregar a la bolsa"}
            </button>

            <div className="border-t border-border pt-8">
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.45em] text-muted-foreground">
                Cuidado y lavado
              </p>
              <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
                {product.care}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
