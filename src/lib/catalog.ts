import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PlacementId } from "@/lib/trazos";

export type DbCollection = {
  id: string;
  slug: string;
  state: string;
  name: string;
  blurb: string;
  cover_url: string;
  story_title: string;
  story: string;
  design_notes: string;
  sort_order: number;
  active: boolean;
};

export type DbDesign = {
  id: string;
  collection_id: string;
  title: string;
  image_url: string;
  placements: string[];
  sort_order: number;
  active: boolean;
};

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: "franela" | "chemise" | "hoodie";
  description: string;
  care: string;
  price: number;
  front_image_url: string;
  back_image_url: string;
  limited: boolean;
  sort_order: number;
  active: boolean;
};

export type DbVariant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock: number;
};

export type CollectionWithDesigns = DbCollection & { designs: DbDesign[] };
export type ProductWithVariants = DbProduct & { variants: DbVariant[] };

export const CATEGORY_LABELS: Record<DbProduct["category"], string> = {
  franela: "Franelas",
  chemise: "Chemises",
  hoodie: "Hoodies",
};

export const GARMENTS: { id: DbProduct["category"]; label: string }[] = [
  { id: "franela", label: "Franela" },
  { id: "chemise", label: "Chemise" },
  { id: "hoodie", label: "Hoodie" },
];

async function fetchCollections(): Promise<CollectionWithDesigns[]> {
  const [{ data: collections, error: e1 }, { data: designs, error: e2 }] = await Promise.all([
    supabase.from("collections").select("*").eq("active", true).order("sort_order"),
    supabase.from("designs").select("*").eq("active", true).order("sort_order"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return (collections ?? []).map((c) => ({
    ...(c as DbCollection),
    designs: ((designs ?? []) as DbDesign[]).filter((d) => d.collection_id === c.id),
  }));
}

async function fetchProducts(): Promise<ProductWithVariants[]> {
  const [{ data: products, error: e1 }, { data: variants, error: e2 }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("sort_order"),
    supabase.from("product_variants").select("*").order("size"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return (products ?? []).map((p) => ({
    ...(p as DbProduct),
    variants: ((variants ?? []) as DbVariant[]).filter((v) => v.product_id === p.id),
  }));
}

async function fetchTexts(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_texts").select("key, value");
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[(row as { key: string }).key] = (row as { value: string }).value;
  return map;
}

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: fetchCollections,
  staleTime: 60_000,
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
});

export const textsQuery = queryOptions({
  queryKey: ["site_texts"],
  queryFn: fetchTexts,
  staleTime: 60_000,
});

export function designPlacements(design: DbDesign | undefined): PlacementId[] {
  const all: PlacementId[] = ["frente", "espalda", "pecho-izquierdo", "pecho-espalda"];
  if (!design || design.placements.length === 0) return all;
  return all.filter((p) => design.placements.includes(p));
}

export function productStock(product: ProductWithVariants) {
  return product.variants.reduce((n, v) => n + v.stock, 0);
}
