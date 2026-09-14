import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { AtelierPanel } from "@/components/AtelierPanel";

const searchSchema = z.object({
  coleccion: z.string().optional(),
  diseno: z.string().optional(),
  color: z.string().optional(),
});

export const Route = createFileRoute("/taller")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Taller 3D — Trazos" },
      {
        name: "description",
        content:
          "Gira la franela en 3D, cambia el color de la tela, ajusta el diseño y tu talla, y agrégala a la bolsa de compras de Trazos.",
      },
      { property: "og:title", content: "Taller 3D — Trazos" },
      {
        property: "og:description",
        content: "Visualiza tu franela Trazos en 3D antes de comprarla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Taller,
});

function Taller() {
  const { coleccion, diseno, color } = Route.useSearch();

  return (
    <main className="min-h-screen bg-background pt-20 text-foreground">
      <div className="flex justify-end border-b border-border px-6 py-4">
        <Link
          to="/"
          hash="colecciones"
          className="inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Volver a las colecciones
        </Link>
      </div>

      <AtelierPanel
        collectionSlug={coleccion}
        designId={diseno}
        {...(color ? { colorName: color } : {})}
      />
    </main>
  );
}
