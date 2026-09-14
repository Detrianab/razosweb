import artLosRoques from "@/assets/art-los-roques.jpg";
import artCanaima from "@/assets/art-canaima.jpg";
import artMedanos from "@/assets/art-medanos-coro.jpg";
import heroRoques from "@/assets/hero-image.png";
import heroCanaima from "@/assets/hero-image-2.webp";
import heroMerida from "@/assets/hero-image-3.png";
import heroZulia from "@/assets/hero-image-4.png";
import heroFalcon from "@/assets/hero-image-5.png";

export type Artwork = {
  slug: string;
  title: string;
  place: string;
  description: string;
  image: string;
};

export const ARTWORKS: Artwork[] = [
  {
    slug: "los-roques",
    title: "Luz de Sal",
    place: "Los Roques",
    description:
      "Bancos de arena blanca y agua turquesa pintados al óleo, con la calma del archipiélago a la hora dorada.",
    image: artLosRoques,
  },
  {
    slug: "canaima",
    title: "Cielo de Piedra",
    place: "Canaima",
    description:
      "El agua cayendo del tepuy entre la bruma: la obra más monumental de la colección.",
    image: artCanaima,
  },
  {
    slug: "medanos-coro",
    title: "Viento Dorado",
    place: "Médanos de Coro",
    description:
      "Dunas esculpidas por el viento bajo un cielo inmenso al atardecer, en capas de óleo cálido.",
    image: artMedanos,
  },
];

export function findArtwork(slug?: string): Artwork {
  return ARTWORKS.find((a) => a.slug === slug) ?? ARTWORKS[0]!;
}

/* ---------------- Colecciones por estado ---------------- */

export type Design = { id: string; title: string; image: string };

export type Collection = {
  slug: string;
  state: string;
  name: string;
  blurb: string;
  cover: string;
  /** Historia del lugar. */
  story: string;
  /** Título de la historia. */
  storyTitle: string;
  /** Cómo se diseñó la prenda. */
  designNotes: string;
  designs: Design[];
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "los-roques",
    state: "Dependencias Federales",
    name: "Los Roques",
    blurb: "Turquesa, sal y arena blanca del archipiélago.",
    cover: heroRoques,
    storyTitle: "El archipiélago que enseña a mirar el color",
    story:
      "Los Roques es un mapa de azules: el turquesa que se abre sobre el banco de arena, el cobalto del canal profundo y el blanco de la sal seca al mediodía. La colección nació de un vuelo bajo sobre Cayo de Agua, cuando el agua parecía tener bordes dibujados a mano.",
    designNotes:
      "El trazo se hizo con línea continua para imitar la corriente y se redujo a tres tintas planas: turquesa, azul profundo y blanco hueso. Recomendamos la franela en blanco hueso, con el dibujo adelante a 25 × 25 cm para que el azul respire.",
    designs: [
      { id: "roques-1", title: "Luz de Sal", image: artLosRoques },
      { id: "roques-2", title: "Cayo de Agua", image: heroRoques },
    ],
  },
  {
    slug: "canaima",
    state: "Bolívar",
    name: "Canaima",
    blurb: "Tepuyes, ríos negros y sabana infinita.",
    cover: heroCanaima,
    storyTitle: "Piedra antigua, agua que no se detiene",
    story:
      "Bolívar es la parte más vieja del país: tepuyes de mil millones de años, ríos color té y una sabana que no termina. El diseño se levantó desde el pie del salto, mirando hacia arriba, con la bruma cortando la silueta de la montaña.",
    designNotes:
      "La obra se separó en dos capas: la masa oscura del tepuy y el velo del agua. Se imprime en negro o azul marino para que la bruma en blanco hueso se sostenga; funciona espectacular con el dibujo grande en la espalda.",
    designs: [
      { id: "canaima-1", title: "Cielo de Piedra", image: artCanaima },
      { id: "canaima-2", title: "Río del Tepuy", image: heroCanaima },
    ],
  },
  {
    slug: "merida",
    state: "Mérida",
    name: "Sierra Nevada",
    blurb: "El páramo, la nieve y el teleférico más alto del mundo.",
    cover: heroMerida,
    storyTitle: "El páramo, el frío y la línea del teleférico",
    story:
      "Mérida se dibuja hacia arriba: frailejones, roca desnuda, nieve y el cable del teleférico más alto del mundo cruzando el cielo. La pieza recoge ese ascenso en una sola diagonal.",
    designNotes:
      "Se trabajó con muy pocos elementos: la diagonal del cable, la silueta del pico y el gris azulado del páramo. Es el diseño más discreto de la casa, pensado para el estampado de pecho izquierdo de 10 × 10 cm.",
    designs: [{ id: "merida-1", title: "Pico Espejo", image: heroMerida }],
  },
  {
    slug: "zulia",
    state: "Zulia",
    name: "Salinas de Zulia",
    blurb: "El rosado de las salinas contra el azul del Caribe.",
    cover: heroZulia,
    storyTitle: "El rosado que aparece cuando baja el agua",
    story:
      "En la costa zuliana las salinas se vuelven rosadas y el Caribe queda azul al lado, sin transición. Esa frontera de color fue todo el punto de partida del diseño.",
    designNotes:
      "El estampado se resolvió como un bloque de color con el borde irregular de las pozas, sin línea negra. Va mejor sobre beige o blanco hueso, con la combinación pecho izquierdo más espalda.",
    designs: [{ id: "zulia-1", title: "Salinas Rosadas", image: heroZulia }],
  },
  {
    slug: "falcon",
    state: "Falcón",
    name: "Médanos de Coro",
    blurb: "Dunas de arena naranja moldeadas por el viento.",
    cover: heroFalcon,
    storyTitle: "Dunas que cambian de forma cada tarde",
    story:
      "Los Médanos de Coro se mueven: el mismo lugar no se repite dos días seguidos. La colección captura la hora en que la arena pasa de amarillo a naranja quemado y la sombra se alarga.",
    designNotes:
      "Se usó una trama de líneas paralelas para dar el viento y solo dos tintas cálidas sobre marrón o beige. Lucen mejor grandes, adelante a 25 × 25 cm.",
    designs: [
      { id: "falcon-1", title: "Viento Dorado", image: artMedanos },
      { id: "falcon-2", title: "Médanos", image: heroFalcon },
    ],
  },
];

export function findCollection(slug?: string): Collection {
  return COLLECTIONS.find((c) => c.slug === slug) ?? COLLECTIONS[0]!;
}

/* ---------------- Opciones de la prenda ---------------- */

export type FabricColor = { name: string; hex: string };

export const FABRIC_COLORS: FabricColor[] = [
  { name: "Blanco hueso", hex: "#f4f1ea" },
  { name: "Negro", hex: "#141312" },
  { name: "Azul marino", hex: "#1e2b45" },
  { name: "Marrón", hex: "#6b4a34" },
  { name: "Beige", hex: "#d9c8ab" },
];

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

export type PlacementId = "frente" | "espalda" | "pecho-izquierdo" | "pecho-espalda";

export type Placement = {
  id: PlacementId;
  n: number;
  label: string;
  detail: string;
  front: "big" | "small" | null;
  back: boolean;
};

export const PLACEMENTS: Placement[] = [
  {
    id: "frente",
    n: 1,
    label: "Dibujo adelante",
    detail: "Estampado frontal de 25 × 25 cm",
    front: "big",
    back: false,
  },
  {
    id: "espalda",
    n: 2,
    label: "Dibujo en la espalda",
    detail: "Estampado trasero de 25 × 25 cm",
    front: null,
    back: true,
  },
  {
    id: "pecho-izquierdo",
    n: 3,
    label: "Solo pecho izquierdo",
    detail: "Estampado pequeño de 10 × 10 cm",
    front: "small",
    back: false,
  },
  {
    id: "pecho-espalda",
    n: 4,
    label: "Pecho izquierdo + espalda",
    detail: "Pecho de 10 × 10 cm y espalda de 25 × 25 cm",
    front: "small",
    back: true,
  },
];

export function findPlacement(id: PlacementId): Placement {
  return PLACEMENTS.find((p) => p.id === id) ?? PLACEMENTS[0]!;
}

export function findDesign(collection: Collection, designId?: string): Design {
  return collection.designs.find((d) => d.id === designId) ?? collection.designs[0]!;
}

export const BRAND = "Trazos";
export const BRAND_TAGLINE = "Coordenadas Artísticas";

/* ---------------- WhatsApp ---------------- */

export const WHATSAPP_NUMBER = "584241335096";
export const WHATSAPP_DISPLAY = "+58 424-1335096";

export type BagItem = {
  key: string;
  designId: string;
  designTitle: string;
  designImage: string;
  collectionName: string;
  colorName: string;
  colorHex: string;
  size: Size;
  placementId: PlacementId;
  qty: number;
};

export function bagItemLines(item: BagItem) {
  const placement = findPlacement(item.placementId);
  return [
    `• Diseño: ${item.designTitle} — Colección ${item.collectionName}`,
    `• Color de la franela: ${item.colorName}`,
    `• Talla: ${item.size}`,
    `• Estampado: ${placement.n}. ${placement.label} (${placement.detail})`,
    `• Cantidad: ${item.qty}`,
  ].join("\n");
}

export function buildBagWhatsAppLink(items: BagItem[]) {
  const text = [
    "Hola Trazos, quiero encargar esta bolsa de compras:",
    "",
    ...items.map((i, idx) => `${idx + 1})\n${bagItemLines(i)}`),
    "",
    "¿Me confirman precio, disponibilidad y envío?",
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppLink(input: {
  artwork: string;
  color: string;
  size: string;
  scale: number;
}) {
  const text = [
    "Hola Trazos, quiero encargar una pieza personalizada:",
    `• Obra: ${input.artwork}`,
    `• Color de tela: ${input.color}`,
    `• Talla: ${input.size}`,
    `• Tamaño del arte: ${Math.round(input.scale * 100)}%`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}