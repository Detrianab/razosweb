import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useBag } from "@/lib/bag";
import { buildBagWhatsAppLink, findPlacement, WHATSAPP_DISPLAY } from "@/lib/trazos";

export const Route = createFileRoute("/bolsa")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tu bolsa de compras — Trazos" },
      {
        name: "description",
        content:
          "Revisa las franelas que diseñaste: diseño, color, talla y posición del estampado, y envía tu pedido a Trazos por WhatsApp.",
      },
      { property: "og:title", content: "Tu bolsa de compras — Trazos" },
      {
        property: "og:description",
        content: "Confirma tu pedido de franelas personalizadas Trazos por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BagPage,
});

function BagPage() {
  const { items, remove, setQty, clear, count } = useBag();

  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-accent">
          Bolsa de compras
        </p>
        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          {count > 0 ? `${count} pieza${count > 1 ? "s" : ""} lista${count > 1 ? "s" : ""}` : "Tu bolsa está vacía"}
        </h1>

        {items.length === 0 ? (
          <div className="mt-10">
            <p className="max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
              Diseña tu franela con una obra de los estados de Venezuela y aparecerá aquí.
            </p>
            <Link
              to="/"
              hash="personalizar"
              className="mt-8 inline-block bg-foreground px-10 py-4 font-sans text-[0.66rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85"
            >
              Empezar a diseñar
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-12 divide-y divide-border border-y border-border">
              {items.map((item) => {
                const placement = findPlacement(item.placementId);
                return (
                  <li key={item.key} className="flex flex-wrap items-center gap-6 py-7">
                    <img
                      src={item.designImage}
                      alt={item.designTitle}
                      className="h-24 w-24 border border-border object-cover"
                    />
                    <div className="min-w-[12rem] flex-1">
                      <h2 className="font-serif text-xl">{item.designTitle}</h2>
                      <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
                        Colección {item.collectionName}
                      </p>
                      <p className="mt-3 font-sans text-xs leading-relaxed text-muted-foreground">
                        {item.colorName} · Talla {item.size} · {placement.n}. {placement.label} (
                        {placement.detail})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Quitar una unidad"
                        onClick={() => setQty(item.key, item.qty - 1)}
                        className="h-9 w-9 border border-border transition-colors hover:border-foreground"
                      >
                        −
                      </button>
                      <span className="font-serif text-lg">{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Añadir una unidad"
                        onClick={() => setQty(item.key, item.qty + 1)}
                        className="h-9 w-9 border border-border transition-colors hover:border-foreground"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${item.designTitle}`}
                        onClick={() => remove(item.key)}
                        className="ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={buildBagWhatsAppLink(items)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-foreground px-12 py-5 font-sans text-[0.68rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85"
              >
                Enviar pedido por WhatsApp
              </a>
              <button
                type="button"
                onClick={clear}
                className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Vaciar la bolsa
              </button>
            </div>
            <p className="mt-6 font-sans text-[0.68rem] leading-relaxed text-muted-foreground">
              Te escribiremos por WhatsApp ({WHATSAPP_DISPLAY}) con precio, disponibilidad y envío.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
