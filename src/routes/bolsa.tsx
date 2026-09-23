import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useBag } from "@/lib/bag";
import { placeOrder } from "@/lib/checkout.functions";
import {
  bagTotal,
  buildBagWhatsAppLink,
  findPlacement,
  UNIT_PRICE,
  WHATSAPP_DISPLAY,
} from "@/lib/trazos";

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
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  /** Registra el pedido (reserva stock) y abre WhatsApp. La bolsa no se vacía. */
  const sendOrder = async () => {
    setSending(true);
    setError("");
    const link = buildBagWhatsAppLink(items);
    try {
      const res = await placeOrder({
        data: {
          customer_name: "",
          customer_whatsapp: "",
          notes: "Pedido enviado desde la bolsa de la web",
          items: items.map((i) => ({
            kind: i.kind ?? "personalizada",
            product_id: i.productId ?? null,
            variant_id: i.variantId ?? null,
            design_id: null,
            title: i.designTitle,
            collection_name: i.collectionName,
            color_name: i.colorName,
            size: i.size,
            placement_id: i.placementId,
            qty: i.qty,
            unit_price: i.unitPrice ?? UNIT_PRICE,
          })),
        },
      });
      if (res.ok) setCode(res.order.code);
      else setError("No pudimos reservar el stock: " + res.message);
    } catch {
      setError("No pudimos registrar el pedido, pero puedes escribirnos por WhatsApp.");
    } finally {
      setSending(false);
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-screen bg-background pt-28 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 pb-24">
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

            <div className="mt-10 flex items-baseline justify-between border-b border-border pb-6">
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-3xl">${bagTotal(items).toFixed(2)}</span>
            </div>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={sending}
                onClick={() => void sendOrder()}
                className="inline-block bg-foreground px-12 py-5 font-sans text-[0.68rem] uppercase tracking-[0.4em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {sending ? "Registrando pedido…" : "Enviar pedido por WhatsApp"}
              </button>
              <button
                type="button"
                onClick={clear}
                className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Vaciar la bolsa
              </button>
            </div>
            {code ? (
              <p className="mt-6 font-sans text-[0.68rem] leading-relaxed text-accent">
                Pedido {code} registrado. Queda en transacción hasta que lo confirmemos contigo.
              </p>
            ) : null}
            {error ? (
              <p className="mt-6 font-sans text-[0.68rem] leading-relaxed text-destructive">
                {error}
              </p>
            ) : null}
            <p className="mt-6 font-sans text-[0.68rem] leading-relaxed text-muted-foreground">
              Te escribiremos por WhatsApp ({WHATSAPP_DISPLAY}) para confirmar disponibilidad y
              envío. Tu bolsa se queda guardada aquí.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
