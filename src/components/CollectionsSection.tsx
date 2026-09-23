import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CoverflowCarousel, type CarouselItem } from "@/components/ui/3-d-coverflow-carousel";
import { collectionsQuery } from "@/lib/catalog";

export function CollectionsSection() {
  const navigate = useNavigate();
  const { data: collections } = useSuspenseQuery(collectionsQuery);

  const items: CarouselItem[] = collections.map((c) => ({
    id: c.slug,
    image: c.cover_url,
    eyebrow: c.state,
    title: c.name,
    description: c.blurb,
    ctaLabel: "Ver la historia",
    onSelect: () => void navigate({ to: "/coleccion/$slug", params: { slug: c.slug } }),
  }));

  return <CoverflowCarousel items={items} />;
}
