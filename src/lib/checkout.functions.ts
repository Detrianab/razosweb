import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  kind: z.enum(["personalizada", "coleccion"]).default("personalizada"),
  product_id: z.string().uuid().nullable().optional(),
  variant_id: z.string().uuid().nullable().optional(),
  design_id: z.string().uuid().nullable().optional(),
  title: z.string().default(""),
  collection_name: z.string().default(""),
  color_name: z.string().default(""),
  size: z.string().default(""),
  placement_id: z.string().default(""),
  qty: z.number().int().min(1),
  unit_price: z.number().min(0).default(20),
});

const payloadSchema = z.object({
  customer_name: z.string().default(""),
  customer_whatsapp: z.string().default(""),
  notes: z.string().default(""),
  items: z.array(itemSchema).min(1),
});

/** Registra el pedido en estado "en transacción" y reserva las existencias. */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => payloadSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("place_order", {
      payload: data as never,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, order: result as { id: string; code: string; total: number } };
  });
