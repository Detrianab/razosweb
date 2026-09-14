import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Maximize2 } from "lucide-react";

export type MuseumPiece = {
  slug: string;
  title: string;
  place: string;
  description: string;
  image: string;
};

type RowProps = {
  piece: MuseumPiece;
  index: number;
  onSelect: (slug: string) => void;
  onZoom: (slug: string) => void;
};

function MuseumRow({ piece, index, onSelect, onZoom }: RowProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const flipped = index % 2 === 1;
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.06]);
  const clip = useTransform(
    scrollYProgress,
    [0.05, 0.42],
    flipped
      ? ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"]
      : ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
  );
  const opacity = useTransform(scrollYProgress, [0.05, 0.3, 0.85, 1], [0, 1, 1, 0.35]);

  return (
    <section
      ref={ref}
      className="grid items-center gap-10 py-20 sm:py-32 lg:grid-cols-2 lg:gap-20"
    >
      <motion.figure
        style={{ y, clipPath: clip }}
        className={`group relative overflow-hidden bg-card ${flipped ? "lg:order-2" : ""}`}
      >
        <motion.img
          src={piece.image}
          alt={`${piece.title} — óleo inspirado en ${piece.place}, Venezuela`}
          loading="lazy"
          width={1024}
          height={1024}
          style={{ scale }}
          className="aspect-[4/5] w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onZoom(piece.slug)}
          className="absolute right-5 bottom-5 flex items-center gap-3 bg-background/85 px-5 py-3 font-sans text-[0.6rem] uppercase tracking-[0.35em] text-foreground opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Ver en detalle
        </button>
      </motion.figure>

      <motion.div style={{ y: textY, opacity }} className={flipped ? "lg:order-1" : ""}>
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-accent">
          Sala {String(index + 1).padStart(2, "0")} · {piece.place}
        </p>
        <h3 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">{piece.title}</h3>
        <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
          {piece.description}
        </p>
        <button
          type="button"
          onClick={() => onSelect(piece.slug)}
          className="mt-10 border-b border-accent pb-1 font-sans text-[0.68rem] uppercase tracking-[0.35em] text-foreground transition-colors hover:text-accent"
        >
          Llevar esta obra a la prenda
        </button>
      </motion.div>
    </section>
  );
}

type Props = {
  pieces: MuseumPiece[];
  onSelect: (slug: string) => void;
  onZoom: (slug: string) => void;
};

export function ParallaxMuseum({ pieces, onSelect, onZoom }: Props) {
  return (
    <div>
      {pieces.map((piece, i) => (
        <MuseumRow
          key={piece.slug}
          piece={piece}
          index={i}
          onSelect={onSelect}
          onZoom={onZoom}
        />
      ))}
    </div>
  );
}
