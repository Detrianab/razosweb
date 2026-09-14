import { useNavigate } from "@tanstack/react-router";
import { CoverflowCarousel, type CarouselItem } from "@/components/ui/3-d-coverflow-carousel";
import { COLLECTIONS } from "@/lib/trazos";

export function CollectionsSection() {
  const navigate = useNavigate();

  const items: CarouselItem[] = COLLECTIONS.map((c) => ({
    id: c.slug,
    image: c.cover,
    eyebrow: c.state,
    title: c.name,
    description: c.blurb,
    ctaLabel: "Ver la historia",
    onSelect: () => void navigate({ to: "/coleccion/$slug", params: { slug: c.slug } }),
  }));

  return <CoverflowCarousel items={items} />;
}
