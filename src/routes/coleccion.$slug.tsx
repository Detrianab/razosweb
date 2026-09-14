import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Rotate3d } from "lucide-react";
import { COLLECTIONS } from "@/lib/trazos";

function collectionBySlug(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export const Route = createFileRoute("/coleccion/$slug")({
  loader: ({ params }) => {
    const collection = collectionBySlug(params.slug);
    if (!collection) throw notFound();
    return { slug: collection.slug };
  },
  head: ({ params }) => {
    const c = collectionBySlug(params.slug);
    if (!c) {
      return {
        meta: [{ title: "Colección no encontrada — Trazos" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Colección ${c.name} — Trazos`;
    const description = `${c.blurb} Conoce la historia de ${c.name} (${c.state}) y personaliza tu franela: color, talla y posición del estampado.`;
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
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const collection = collectionBySlug(slug)!;

  return (
    <main className="bg-background text-foreground">
      {/* Portada del paisaje */}
      <section className="relative h-[62svh] min-h-[380px] w-full overflow-hidden">
        <img
          src={collection.cover}
          alt={`${collection.name} — ${collection.state}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-black/85" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 pb-14">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-white/80 drop-shadow">
            Colección · {collection.state}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-white drop-shadow-md sm:text-6xl">
            {collection.name}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20">
        <Link
          to="/"
          hash="colecciones"
          className="inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Todas las colecciones
        </Link>

        {/* Historia */}
        <div className="mt-14 grid gap-14 md:grid-cols-2">
          <div>
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
              La historia
            </p>
            <h2 className="mt-5 font-serif text-3xl leading-tight">{collection.storyTitle}</h2>
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
              {collection.designNotes}
            </p>
          </div>
        </div>

        {/* Diseños */}
        <div className="mt-24">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
            Los diseños de esta colección
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collection.designs.map((d) => (
              <figure key={d.id} className="border border-border">
                <img
                  src={d.image}
                  alt={d.title}
                  loading="lazy"
                  className="h-64 w-full object-cover"
                />
                <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <span className="font-serif text-lg">{d.title}</span>
                  <Link
                    to="/taller"
                    search={{ coleccion: collection.slug, diseno: d.id }}
                    className="font-sans text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Ver en 3D
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Acción única y protagonista */}
        <div className="mt-20 border-t border-border pt-12">
          <Link
            to="/taller"
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
