import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Drops an undefined id so Postgres generates one. */
function withId<T extends { id?: string | undefined }>(data: T) {
  const { id, ...rest } = data;
  return id ? { id, ...rest } : rest;
}

async function guard() {
  const { requireStaff } = await import("@/lib/admin.server");
  await requireStaff();
}

export const staffLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { adminSession, checkCode, staffToken } = await import("@/lib/admin.server");
    if (!checkCode(data.code)) return { ok: false as const, token: null };
    try {
      const session = await adminSession();
      await session.update({ staff: true });
    } catch {
      // Cookies may be blocked inside the preview iframe; the token covers it.
    }
    return { ok: true as const, token: await staffToken() };
  });

export const staffLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { adminSession } = await import("@/lib/admin.server");
  const session = await adminSession();
  await session.clear();
  return { ok: true as const };
});

export const staffStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isStaff } = await import("@/lib/admin.server");
  return { ok: await isStaff() };
});

/* ---------------- Resumen ---------------- */

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const [orders, variants, designs, collections] = await Promise.all([
    db.from("orders").select("id, status, total, created_at").order("created_at", { ascending: false }),
    db.from("product_variants").select("id, stock, size, color_name, product_id"),
    db.from("designs").select("id"),
    db.from("collections").select("id"),
  ]);
  const rows = orders.data ?? [];
  const sum = (status: string) =>
    rows.filter((o) => o.status === status).reduce((n, o) => n + Number(o.total), 0);
  return {
    orders: rows.length,
    inTransaction: rows.filter((o) => o.status === "transaccion").length,
    paid: rows.filter((o) => o.status === "pagado").length,
    delivered: rows.filter((o) => o.status === "entregado").length,
    revenue: sum("pagado") + sum("entregado"),
    pendingRevenue: sum("transaccion"),
    stock: (variants.data ?? []).reduce((n, v) => n + v.stock, 0),
    lowStock: (variants.data ?? []).filter((v) => v.stock <= 2).length,
    designs: (designs.data ?? []).length,
    collections: (collections.data ?? []).length,
  };
});

/* ---------------- Pedidos ---------------- */

export const adminOrders = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const [{ data: orders }, { data: items }] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(300),
    db.from("order_items").select("*"),
  ]);
  return (orders ?? []).map((o) => ({
    ...o,
    items: (items ?? []).filter((i) => i.order_id === o.id),
  }));
});

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["transaccion", "pagado", "entregado", "cancelado"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.rpc("set_order_status", {
      p_order_id: data.id,
      p_status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminOrdersCsv = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const [{ data: orders }, { data: items }] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }),
    db.from("order_items").select("*"),
  ]);
  const head = [
    "codigo",
    "fecha",
    "estado",
    "cliente",
    "whatsapp",
    "total",
    "prenda",
    "coleccion",
    "color",
    "talla",
    "estampado",
    "cantidad",
    "precio",
  ];
  const lines = [head.join(",")];
  for (const o of orders ?? []) {
    for (const i of (items ?? []).filter((x) => x.order_id === o.id)) {
      lines.push(
        [
          o.code,
          new Date(o.created_at).toISOString().slice(0, 10),
          o.status,
          o.customer_name,
          o.customer_whatsapp,
          o.total,
          i.title,
          i.collection_name,
          i.color_name,
          i.size,
          i.placement_id,
          i.qty,
          i.unit_price,
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      );
    }
  }
  return lines.join("\n");
});

/* ---------------- Inventario ---------------- */

export const adminInventory = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const [{ data: products }, { data: variants }] = await Promise.all([
    db.from("products").select("*").order("sort_order"),
    db.from("product_variants").select("*").order("size"),
  ]);
  return (products ?? []).map((p) => ({
    ...p,
    variants: (variants ?? []).filter((v) => v.product_id === p.id),
  }));
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  category: z.enum(["franela", "chemise", "hoodie"]),
  description: z.string().default(""),
  care: z.string().default(""),
  price: z.number().default(20),
  front_image_url: z.string().default(""),
  back_image_url: z.string().default(""),
  limited: z.boolean().default(true),
  active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => productSchema.parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("products").upsert(withId(data) as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSaveVariant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        product_id: z.string().uuid(),
        color_name: z.string().min(1),
        color_hex: z.string().min(4),
        size: z.string().min(1),
        stock: z.number().int().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db
      .from("product_variants")
      .upsert(withId(data) as never, { onConflict: "product_id,color_name,size" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteVariant = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("product_variants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ---------------- Colecciones y diseños ---------------- */

export const adminCollections = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const [{ data: collections }, { data: designs }] = await Promise.all([
    db.from("collections").select("*").order("sort_order"),
    db.from("designs").select("*").order("sort_order"),
  ]);
  return (collections ?? []).map((c) => ({
    ...c,
    designs: (designs ?? []).filter((d) => d.collection_id === c.id),
  }));
});

export const adminSaveCollection = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z.string().min(2),
        state: z.string().default(""),
        name: z.string().min(2),
        blurb: z.string().default(""),
        cover_url: z.string().default(""),
        story_title: z.string().default(""),
        story: z.string().default(""),
        design_notes: z.string().default(""),
        sort_order: z.number().default(0),
        active: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("collections").upsert(withId(data) as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteCollection = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("collections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSaveDesign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        collection_id: z.string().uuid(),
        title: z.string().min(1),
        image_url: z.string().min(4),
        placements: z.array(z.string()).default([]),
        sort_order: z.number().default(0),
        active: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("designs").upsert(withId(data) as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteDesign = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db.from("designs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ---------------- Textos ---------------- */

export const adminTexts = createServerFn({ method: "GET" }).handler(async () => {
  await guard();
  const db = await admin();
  const { data } = await db.from("site_texts").select("*").order("key");
  return data ?? [];
});

export const adminSaveText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ key: z.string().min(1), label: z.string().default(""), value: z.string() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await guard();
    const db = await admin();
    const { error } = await db
      .from("site_texts")
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
