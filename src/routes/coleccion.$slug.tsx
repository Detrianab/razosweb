import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Rotate3d } from "lucide-react";
import { collectionsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/coleccion/$slug")({
  loader: async ({ context, params }) => {
    const collections = await context.queryClient.ensureQueryData(collectionsQuery);
    const c = collections.find((x) => x.slug === params.slug);
    if (!c) throw notFound();
    return { name: c.name, state: c.state, blurb: c.blurb };
  },
  head: ({ loaderData }) => {
    const title = `Colección ${loaderData?.name ?? ""} — Trazos`;
    const description = `${loaderData?.blurb ?? ""} Conoce la historia de ${loaderData?.name ?? ""} (${loaderData?.state ?? ""}) y personaliza tu prenda: color, talla y posición del estampado.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">No pudimos cargar esta colección.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-8 text-center">
      <p className="font-sans text-sm text-muted-foreground">Esta colección ya no está visible.</p>
    </main>
  ),
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data: collections } = useSuspenseQuery(collectionsQuery);
  const collection = collections.find((c) => c.slug === slug)!;

  return (
    <main className="bg-background text-foreground">
      <section className="relative h-[62svh] min-h-[380px] w-full overflow-hidden">
        <img
          src={collection.cover_url}
          alt={`${collection.name} — ${collection.state}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-black/85" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pb-14">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-white/80 drop-shadow">
            Colección · {collection.state}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-white drop-shadow-md sm:text-6xl">
            {collection.name}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 py-20">
        <Link
          to="/"
          hash="colecciones"
          className="inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Todas las colecciones
        </Link>

        <div className="mt-14 grid gap-14 md:grid-cols-2">
          <div>
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
              La historia
            </p>
            <h2 className="mt-5 font-serif text-3xl leading-tight">{collection.story_title}</h2>
            <p className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground">
              {collection.story}
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
              Cómo se diseñó la prenda
            </p>
            <h2 className="mt-5 font-serif text-3xl leading-tight">Del paisaje al trazo</h2>
            <p className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground">
              {collection.design_notes}
            </p>
          </div>
        </div>

        <div className="mt-24">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
            Los diseños de esta colección
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collection.designs.map((d) => (
              <Link
                key={d.id}
                to="/personalizar"
                search={{ coleccion: collection.slug, diseno: d.id }}
                className="group border border-border"
              >
                <img
                  src={d.image_url}
                  alt={d.title}
                  loading="lazy"
                  className="h-64 w-full object-cover"
                />
                <span className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <span className="font-serif text-lg">{d.title}</span>
                  <span className="font-sans text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors group-hover:text-foreground">
                    Ver en 3D
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-12">
          <Link
            to="/personalizar"
            search={{ coleccion: collection.slug }}
            className="group flex w-full items-center justify-center gap-4 bg-foreground px-10 py-8 font-sans text-[0.72rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85 sm:text-[0.8rem]"
          >
            <Rotate3d className="h-5 w-5" aria-hidden="true" />
            Personalizar esta prenda
          </Link>
          <p className="mt-5 text-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
            Visualización siempre en 3D · color, talla y posición del estampado
          </p>
        </div>
      </div>
    </main>
  );
}
