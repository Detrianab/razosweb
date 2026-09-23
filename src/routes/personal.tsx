import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminCollections,
  adminDeleteCollection,
  adminDeleteDesign,
  adminDeleteProduct,
  adminDeleteVariant,
  adminInventory,
  adminOrders,
  adminOrdersCsv,
  adminOverview,
  adminSaveCollection,
  adminSaveDesign,
  adminSaveProduct,
  adminSaveText,
  adminSaveVariant,
  adminSetOrderStatus,
  adminTexts,
  staffLogin,
  staffLogout,
  staffStatus,
} from "@/lib/admin.functions";
import { PLACEMENTS, SIZES } from "@/lib/trazos";
import { STAFF_TOKEN_KEY } from "@/lib/staff-token";

export const Route = createFileRoute("/personal")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel del personal — Trazos" },
      { name: "description", content: "Acceso interno de Trazos para inventario y pedidos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Panel del personal — Trazos" },
      { property: "og:description", content: "Acceso interno de Trazos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffPanel,
});

const TABS = [
  "Resumen",
  "Pedidos",
  "Inventario",
  "Colecciones",
  "Textos",
  "Contabilidad",
] as const;

const STATUS_LABELS: Record<string, string> = {
  transaccion: "En transacción",
  pagado: "Pagado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full border border-border bg-background px-3 py-2 font-sans text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full border border-border bg-background px-3 py-2 font-sans text-sm"
        />
      )}
    </label>
  );
}

function Btn({
  children,
  onClick,
  tone = "solid",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "solid" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const cls =
    tone === "solid"
      ? "bg-foreground text-background"
      : tone === "danger"
        ? "border border-destructive text-destructive"
        : "border border-border text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 font-sans text-[0.55rem] uppercase tracking-[0.35em] transition-opacity hover:opacity-80 disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

function StaffPanel() {
  const status = useQuery({ queryKey: ["staff"], queryFn: () => staffStatus() });
  const login = useServerFn(staffLogin);
  const logout = useServerFn(staffLogout);
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");

  if (status.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
        Verificando acceso
      </main>
    );
  }

  if (!status.data?.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
            Solo para el personal
          </p>
          <h1 className="mt-5 font-serif text-3xl">Panel Trazos</h1>
          <p className="mt-3 font-sans text-sm text-muted-foreground">
            Introduce el código del personal para entrar.
          </p>
          <input
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código"
            className="mt-7 w-full border border-border bg-background px-4 py-4 text-center font-sans text-lg tracking-[0.5em]"
          />
          {error ? <p className="mt-3 font-sans text-xs text-destructive">{error}</p> : null}
          <button
            type="button"
            onClick={async () => {
              setError("");
              const res = await login({ data: { code } });
              if (res.ok) {
                if (res.token) localStorage.setItem(STAFF_TOKEN_KEY, res.token);
                await qc.invalidateQueries();
                void status.refetch();
              } else {
                setError("Código incorrecto.");
              }
            }}
            className="mt-6 w-full bg-foreground px-8 py-4 font-sans text-[0.62rem] uppercase tracking-[0.4em] text-background"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-24 sm:pt-32 sm:pb-32 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.5em] text-accent">
              Personal Trazos
            </p>
            <h1 className="mt-4 font-serif text-4xl">Panel administrativo</h1>
          </div>
          <Btn
            tone="ghost"
            onClick={async () => {
              localStorage.removeItem(STAFF_TOKEN_KEY);
              await logout();
              await qc.invalidateQueries();
              await status.refetch();
            }}
          >
            Salir
          </Btn>
        </div>

        <nav className="mt-10 flex flex-wrap gap-3 border-b border-border pb-4">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-sans text-[0.58rem] uppercase tracking-[0.35em] transition-colors ${
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="mt-12">
          {tab === "Resumen" ? <Overview /> : null}
          {tab === "Pedidos" ? <Orders /> : null}
          {tab === "Inventario" ? <Inventory /> : null}
          {tab === "Colecciones" ? <Collections /> : null}
          {tab === "Textos" ? <Texts /> : null}
          {tab === "Contabilidad" ? <Accounting /> : null}
        </div>
      </div>
    </main>
  );
}

/* ---------------- Resumen ---------------- */

function Overview() {
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminOverview() });
  if (!data) return <Loading />;
  const cards = [
    { label: "Pedidos totales", value: data.orders },
    { label: "En transacción", value: data.inTransaction },
    { label: "Pagados", value: data.paid },
    { label: "Entregados", value: data.delivered },
    { label: "Ingresos confirmados", value: `$${data.revenue.toFixed(2)}` },
    { label: "Por confirmar", value: `$${data.pendingRevenue.toFixed(2)}` },
    { label: "Unidades en stock", value: data.stock },
    { label: "Tallas con stock bajo", value: data.lowStock },
    { label: "Diseños", value: data.designs },
    { label: "Colecciones", value: data.collections },
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="border border-border p-7">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
            {c.label}
          </p>
          <p className="mt-4 font-serif text-3xl">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function Loading() {
  return (
    <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
      Cargando…
    </p>
  );
}

/* ---------------- Pedidos ---------------- */

function Orders() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "orders"], queryFn: () => adminOrders() });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => adminSetOrderStatus({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  if (!data) return <Loading />;
  if (data.length === 0)
    return (
      <p className="font-sans text-sm text-muted-foreground">Todavía no hay pedidos registrados.</p>
    );

  return (
    <div className="space-y-6">
      {data.map((o) => (
        <div key={o.id} className="border border-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-serif text-xl">{o.code}</p>
              <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                {new Date(o.created_at).toLocaleString("es-VE")} · ${Number(o.total).toFixed(2)}
              </p>
              {o.customer_name || o.customer_whatsapp ? (
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  {o.customer_name} {o.customer_whatsapp}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus.mutate({ id: o.id, status: key })}
                  className={`px-4 py-2 font-sans text-[0.52rem] uppercase tracking-[0.3em] transition-colors ${
                    o.status === key
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-5 space-y-2 border-t border-border pt-4">
            {o.items.map((i) => (
              <li key={i.id} className="font-sans text-xs text-muted-foreground">
                {i.qty} × {i.title} — {i.collection_name} · {i.color_name} · talla {i.size} ·{" "}
                {i.placement_id} · ${Number(i.unit_price).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Inventario ---------------- */

function Inventory() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "inventory"], queryFn: () => adminInventory() });
  const saveVariant = useMutation({
    mutationFn: (v: unknown) => adminSaveVariant({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const delVariant = useMutation({
    mutationFn: (id: string) => adminDeleteVariant({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const saveProduct = useMutation({
    mutationFn: (v: unknown) => adminSaveProduct({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const delProduct = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const [nuevo, setNuevo] = useState({
    slug: "",
    name: "",
    category: "franela" as "franela" | "chemise" | "hoodie",
    description: "",
    care: "",
    price: 20,
    front_image_url: "",
    back_image_url: "",
  });

  if (!data) return <Loading />;

  return (
    <div className="space-y-12">
      {data.map((p) => (
        <div key={p.id} className="border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-serif text-2xl">{p.name}</p>
              <p className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
                {p.category} · ${Number(p.price).toFixed(2)} · {p.active ? "visible" : "oculto"}
              </p>
            </div>
            <div className="flex gap-2">
              <Btn
                tone="ghost"
                onClick={() =>
                  saveProduct.mutate({
                    ...p,
                    price: Number(p.price),
                    active: !p.active,
                  } as never)
                }
              >
                {p.active ? "Ocultar" : "Mostrar"}
              </Btn>
              <Btn tone="danger" onClick={() => delProduct.mutate(p.id)}>
                Eliminar
              </Btn>
            </div>
          </div>

          <table className="mt-6 w-full border-collapse font-sans text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Color</th>
                <th className="py-2">Talla</th>
                <th className="py-2">Existencias</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {p.variants.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="py-3">{v.color_name}</td>
                  <td className="py-3">{v.size}</td>
                  <td className="py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      onBlur={(e) =>
                        saveVariant.mutate({
                          id: v.id,
                          product_id: p.id,
                          color_name: v.color_name,
                          color_hex: v.color_hex,
                          size: v.size,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-20 border border-border bg-background px-2 py-1"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => delVariant.mutate(v.id)}
                      className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-destructive"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <NewVariant
            productId={p.id}
            onSave={(v) => saveVariant.mutate(v)}
          />
        </div>
      ))}

      <div className="border border-dashed border-border p-6">
        <p className="font-serif text-2xl">Nueva prenda</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" value={nuevo.name} onChange={(v) => setNuevo({ ...nuevo, name: v })} />
          <Field
            label="Enlace corto (slug)"
            value={nuevo.slug}
            onChange={(v) => setNuevo({ ...nuevo, slug: v })}
          />
          <label className="block">
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
              Categoría
            </span>
            <select
              value={nuevo.category}
              onChange={(e) =>
                setNuevo({ ...nuevo, category: e.target.value as typeof nuevo.category })
              }
              className="mt-2 w-full border border-border bg-background px-3 py-2 font-sans text-sm"
            >
              <option value="franela">Franela</option>
              <option value="chemise">Chemise</option>
              <option value="hoodie">Hoodie</option>
            </select>
          </label>
          <Field
            label="Precio (USD)"
            type="number"
            value={String(nuevo.price)}
            onChange={(v) => setNuevo({ ...nuevo, price: Number(v) })}
          />
          <Field
            label="Foto frontal (enlace)"
            value={nuevo.front_image_url}
            onChange={(v) => setNuevo({ ...nuevo, front_image_url: v })}
          />
          <Field
            label="Foto posterior (enlace)"
            value={nuevo.back_image_url}
            onChange={(v) => setNuevo({ ...nuevo, back_image_url: v })}
          />
          <Field
            label="Descripción"
            textarea
            value={nuevo.description}
            onChange={(v) => setNuevo({ ...nuevo, description: v })}
          />
          <Field
            label="Cuidado y lavado"
            textarea
            value={nuevo.care}
            onChange={(v) => setNuevo({ ...nuevo, care: v })}
          />
        </div>
        <div className="mt-6">
          <Btn
            disabled={!nuevo.name || !nuevo.slug}
            onClick={() =>
              saveProduct.mutate({
                ...nuevo,
                limited: true,
                active: true,
                sort_order: data.length + 1,
              } as never)
            }
          >
            Crear prenda
          </Btn>
        </div>
      </div>
    </div>
  );
}

function NewVariant({
  productId,
  onSave,
}: {
  productId: string;
  onSave: (v: {
    product_id: string;
    color_name: string;
    color_hex: string;
    size: string;
    stock: number;
  }) => void;
}) {
  const [v, setV] = useState({ color_name: "", color_hex: "#f4f1ea", size: "M", stock: 0 });
  return (
    <div className="mt-6 flex flex-wrap items-end gap-4">
      <Field label="Color" value={v.color_name} onChange={(x) => setV({ ...v, color_name: x })} />
      <Field label="Tono" type="color" value={v.color_hex} onChange={(x) => setV({ ...v, color_hex: x })} />
      <label className="block">
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
          Talla
        </span>
        <select
          value={v.size}
          onChange={(e) => setV({ ...v, size: e.target.value })}
          className="mt-2 border border-border bg-background px-3 py-2 font-sans text-sm"
        >
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Existencias"
        type="number"
        value={String(v.stock)}
        onChange={(x) => setV({ ...v, stock: Number(x) })}
      />
      <Btn
        tone="ghost"
        disabled={!v.color_name}
        onClick={() => {
          onSave({ product_id: productId, ...v });
          setV({ color_name: "", color_hex: "#f4f1ea", size: "M", stock: 0 });
        }}
      >
        Añadir color/talla
      </Btn>
    </div>
  );
}

/* ---------------- Colecciones y diseños ---------------- */

function Collections() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: () => adminCollections(),
  });
  const saveCollection = useMutation({
    mutationFn: (v: unknown) => adminSaveCollection({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const delCollection = useMutation({
    mutationFn: (id: string) => adminDeleteCollection({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const saveDesign = useMutation({
    mutationFn: (v: unknown) => adminSaveDesign({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const delDesign = useMutation({
    mutationFn: (id: string) => adminDeleteDesign({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const [nueva, setNueva] = useState({
    slug: "",
    name: "",
    state: "",
    blurb: "",
    cover_url: "",
    story_title: "",
    story: "",
    design_notes: "",
  });

  if (!data) return <Loading />;

  return (
    <div className="space-y-12">
      {data.map((c) => (
        <div key={c.id} className="border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-serif text-2xl">{c.name}</p>
              <p className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
                {c.state} · /{c.slug} · {c.active ? "visible" : "oculta"}
              </p>
            </div>
            <div className="flex gap-2">
              <Btn tone="ghost" onClick={() => saveCollection.mutate({ ...c, active: !c.active } as never)}>
                {c.active ? "Ocultar" : "Mostrar"}
              </Btn>
              <Btn tone="danger" onClick={() => delCollection.mutate(c.id)}>
                Eliminar
              </Btn>
            </div>
          </div>

          <CollectionEditor collection={c} onSave={(v) => saveCollection.mutate(v as never)} />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.designs.map((d) => (
              <div key={d.id} className="border border-border p-4">
                <img src={d.image_url} alt={d.title} className="h-32 w-full object-cover" />
                <p className="mt-3 font-serif text-lg">{d.title}</p>
                <div className="mt-3 space-y-2">
                  {PLACEMENTS.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 font-sans text-[0.62rem]">
                      <input
                        type="checkbox"
                        checked={d.placements.includes(p.id)}
                        onChange={(e) =>
                          saveDesign.mutate({
                            ...d,
                            placements: e.target.checked
                              ? [...d.placements, p.id]
                              : d.placements.filter((x) => x !== p.id),
                          } as never)
                        }
                      />
                      {p.n}. {p.label}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => delDesign.mutate(d.id)}
                  className="mt-4 font-sans text-[0.55rem] uppercase tracking-[0.3em] text-destructive"
                >
                  Eliminar diseño
                </button>
              </div>
            ))}
            <NewDesign collectionId={c.id} onSave={(v) => saveDesign.mutate(v as never)} />
          </div>
        </div>
      ))}

      <div className="border border-dashed border-border p-6">
        <p className="font-serif text-2xl">Nueva colección</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" value={nueva.name} onChange={(v) => setNueva({ ...nueva, name: v })} />
          <Field label="Estado" value={nueva.state} onChange={(v) => setNueva({ ...nueva, state: v })} />
          <Field label="Enlace corto (slug)" value={nueva.slug} onChange={(v) => setNueva({ ...nueva, slug: v })} />
          <Field label="Foto de portada (enlace)" value={nueva.cover_url} onChange={(v) => setNueva({ ...nueva, cover_url: v })} />
          <Field label="Frase corta" value={nueva.blurb} onChange={(v) => setNueva({ ...nueva, blurb: v })} />
          <Field label="Título de la historia" value={nueva.story_title} onChange={(v) => setNueva({ ...nueva, story_title: v })} />
          <Field label="Historia" textarea value={nueva.story} onChange={(v) => setNueva({ ...nueva, story: v })} />
          <Field label="Cómo se diseñó" textarea value={nueva.design_notes} onChange={(v) => setNueva({ ...nueva, design_notes: v })} />
        </div>
        <div className="mt-6">
          <Btn
            disabled={!nueva.name || !nueva.slug}
            onClick={() =>
              saveCollection.mutate({
                ...nueva,
                sort_order: data.length + 1,
                active: true,
              } as never)
            }
          >
            Crear colección
          </Btn>
        </div>
      </div>
    </div>
  );
}

function CollectionEditor({
  collection,
  onSave,
}: {
  collection: {
    id: string;
    slug: string;
    name: string;
    state: string;
    blurb: string;
    cover_url: string;
    story_title: string;
    story: string;
    design_notes: string;
    sort_order: number;
    active: boolean;
  };
  onSave: (v: unknown) => void;
}) {
  const [v, setV] = useState(collection);
  return (
    <div className="mt-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" value={v.name} onChange={(x) => setV({ ...v, name: x })} />
        <Field label="Estado" value={v.state} onChange={(x) => setV({ ...v, state: x })} />
        <Field label="Foto de portada" value={v.cover_url} onChange={(x) => setV({ ...v, cover_url: x })} />
        <Field label="Frase corta" value={v.blurb} onChange={(x) => setV({ ...v, blurb: x })} />
        <Field label="Título de la historia" value={v.story_title} onChange={(x) => setV({ ...v, story_title: x })} />
        <Field label="Historia" textarea value={v.story} onChange={(x) => setV({ ...v, story: x })} />
        <Field label="Cómo se diseñó" textarea value={v.design_notes} onChange={(x) => setV({ ...v, design_notes: x })} />
      </div>
      <div className="mt-5">
        <Btn onClick={() => onSave(v)}>Guardar cambios</Btn>
      </div>
    </div>
  );
}

function NewDesign({
  collectionId,
  onSave,
}: {
  collectionId: string;
  onSave: (v: unknown) => void;
}) {
  const [v, setV] = useState({ title: "", image_url: "", placements: PLACEMENTS.map((p) => p.id) });
  return (
    <div className="border border-dashed border-border p-4">
      <p className="font-serif text-lg">Nuevo diseño</p>
      <div className="mt-4 space-y-4">
        <Field label="Título" value={v.title} onChange={(x) => setV({ ...v, title: x })} />
        <Field label="Imagen (enlace)" value={v.image_url} onChange={(x) => setV({ ...v, image_url: x })} />
        <div className="space-y-2">
          {PLACEMENTS.map((p) => (
            <label key={p.id} className="flex items-center gap-2 font-sans text-[0.62rem]">
              <input
                type="checkbox"
                checked={v.placements.includes(p.id)}
                onChange={(e) =>
                  setV({
                    ...v,
                    placements: e.target.checked
                      ? [...v.placements, p.id]
                      : v.placements.filter((x) => x !== p.id),
                  })
                }
              />
              {p.n}. {p.label}
            </label>
          ))}
        </div>
        <Btn
          tone="ghost"
          disabled={!v.title || !v.image_url}
          onClick={() => {
            onSave({ collection_id: collectionId, ...v, sort_order: 99, active: true });
            setV({ title: "", image_url: "", placements: PLACEMENTS.map((p) => p.id) });
          }}
        >
          Añadir diseño
        </Btn>
      </div>
    </div>
  );
}

/* ---------------- Textos ---------------- */

function Texts() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "texts"], queryFn: () => adminTexts() });
  const save = useMutation({
    mutationFn: (v: { key: string; label: string; value: string }) =>
      adminSaveText({ data: v as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  if (!data) return <Loading />;
  return (
    <div className="space-y-8">
      {data.map((t) => (
        <TextRow key={t.key} row={t} onSave={(value) => save.mutate({ key: t.key, label: t.label, value })} />
      ))}
    </div>
  );
}

function TextRow({
  row,
  onSave,
}: {
  row: { key: string; label: string; value: string };
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(row.value);
  return (
    <div className="border border-border p-6">
      <Field label={row.label || row.key} textarea value={value} onChange={setValue} />
      <div className="mt-4">
        <Btn onClick={() => onSave(value)}>Guardar</Btn>
      </div>
    </div>
  );
}

/* ---------------- Contabilidad ---------------- */

function Accounting() {
  const { data } = useQuery({ queryKey: ["admin", "orders"], queryFn: () => adminOrders() });
  const csv = useServerFn(adminOrdersCsv);

  const download = async () => {
    const text = await csv();
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `trazos-contabilidad-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return <Loading />;

  const byMonth = new Map<string, { units: number; total: number }>();
  for (const o of data) {
    if (o.status === "cancelado") continue;
    const month = new Date(o.created_at).toISOString().slice(0, 7);
    const entry = byMonth.get(month) ?? { units: 0, total: 0 };
    entry.total += Number(o.total);
    entry.units += o.items.reduce((n, i) => n + i.qty, 0);
    byMonth.set(month, entry);
  }

  return (
    <div className="space-y-8">
      <Btn onClick={() => void download()}>Descargar CSV</Btn>
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="text-left font-sans text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground">
            <th className="py-3">Mes</th>
            <th className="py-3">Prendas</th>
            <th className="py-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {[...byMonth.entries()].map(([month, v]) => (
            <tr key={month} className="border-t border-border">
              <td className="py-3">{month}</td>
              <td className="py-3">{v.units}</td>
              <td className="py-3">${v.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
