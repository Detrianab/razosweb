import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { collectionsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/galeria")({
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionsQuery),
  head: () => ({
    meta: [
      { title: "Galería de diseños por estado — Trazos" },
      {
        name: "description",
        content:
          "Recorre los diseños de Trazos estado por estado: Los Roques, Canaima, Mérida, Zulia y Falcón. Elige uno y personalízalo en 3D.",
      },
      { property: "og:title", content: "Galería de diseños por estado — Trazos" },
      {
        property: "og:description",
        content: "Los diseños de Trazos, organizados por región de Venezuela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">No pudimos cargar la galería.</p>
    </main>
  ),
});

function Gallery() {
  const { data: collections } = useSuspenseQuery(collectionsQuery);

  return (
    <main className="min-h-screen bg-background pt-28 pb-28 sm:pt-32 sm:pb-32 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-accent">
          Coordenadas artísticas
        </p>
        <h1 className="mt-6 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
          Galería de diseños por estado
        </h1>
        <p className="mt-5 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">
          Baja recorriendo las regiones. Toca un diseño y pasa directo a personalizarlo en 3D.
        </p>
      </div>

      {collections.map((c) => (
        <section key={c.id} className="mt-24 border-t border-border">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pt-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-muted-foreground">
                  {c.state}
                </p>
                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">{c.name}</h2>
                <p className="mt-3 max-w-lg font-sans text-sm text-muted-foreground">{c.blurb}</p>
              </div>
              <Link
                to="/coleccion/$slug"
                params={{ slug: c.slug }}
                className="font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Leer su historia
              </Link>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {c.designs.map((d) => (
                <Link
                  key={d.id}
                  to="/personalizar"
                  search={{ coleccion: c.slug, diseno: d.id }}
                  className="group block"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-card">
                    <img
                      src={d.image_url}
                      alt={d.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <h3 className="font-serif text-xl">{d.title}</h3>
                    <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Personalizar
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
