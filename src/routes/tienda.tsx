import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CATEGORY_LABELS, productsQuery, productStock, type DbProduct } from "@/lib/catalog";

export const Route = createFileRoute("/tienda")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Tienda de colección — Trazos" },
      {
        name: "description",
        content:
          "Franelas, chemises y hoodies de edición limitada con arte de los estados de Venezuela. Stock real, talla, color y cuidados de lavado.",
      },
      { property: "og:title", content: "Tienda de colección — Trazos" },
      {
        property: "og:description",
        content: "Nuevos lanzamientos de edición limitada de Trazos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">
        No pudimos cargar la tienda. Recarga la página en un momento.
      </p>
    </main>
  ),
});

const CATEGORIES: DbProduct["category"][] = ["franela", "chemise", "hoodie"];

function Shop() {
  const { data: products } = useSuspenseQuery(productsQuery);

  return (
    <main className="min-h-screen bg-background pt-28 pb-28 sm:pt-32 sm:pb-32 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-accent">
          Nuevos lanzamientos
        </p>
        <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
          Tienda de colección
        </h1>
        <p className="mt-5 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">
          Piezas numeradas y en edición limitada. Cada prenda muestra las existencias reales.
        </p>

        {CATEGORIES.map((category) => {
          const list = products.filter((p) => p.category === category);
          if (list.length === 0) return null;
          return (
            <section key={category} className="mt-20">
              <h2 className="font-sans text-[0.62rem] uppercase tracking-[0.5em] text-muted-foreground">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => {
                  const stock = productStock(p);
                  return (
                    <Link
                      key={p.id}
                      to="/tienda/$productSlug"
                      params={{ productSlug: p.slug }}
                      className="group block"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-card">
                        <img
                          src={p.front_image_url}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      <div className="mt-5 flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-xl">{p.name}</h3>
                        <span className="font-sans text-sm">${Number(p.price).toFixed(0)}</span>
                      </div>
                      <p className="mt-2 font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
                        {stock > 0 ? `${stock} disponibles` : "Agotado"}
                        {p.limited ? " · Edición limitada" : ""}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
