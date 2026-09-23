
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  state text NOT NULL DEFAULT '',
  name text NOT NULL,
  blurb text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  story_title text NOT NULL DEFAULT '',
  story text NOT NULL DEFAULT '',
  design_notes text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_public_read" ON public.collections FOR SELECT TO anon, authenticated USING (active);

CREATE TABLE public.designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  placements text[] NOT NULL DEFAULT ARRAY['frente','espalda','pecho-izquierdo','pecho-espalda'],
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.designs TO anon, authenticated;
GRANT ALL ON public.designs TO service_role;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "designs_public_read" ON public.designs FOR SELECT TO anon, authenticated USING (active);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'franela' CHECK (category IN ('franela','chemise','hoodie')),
  description text NOT NULL DEFAULT '',
  care text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 20,
  front_image_url text NOT NULL DEFAULT '',
  back_image_url text NOT NULL DEFAULT '',
  limited boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (active);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text NOT NULL DEFAULT '#f4f1ea',
  size text NOT NULL,
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_name, size)
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_texts (
  key text PRIMARY KEY,
  label text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_texts TO anon, authenticated;
GRANT ALL ON public.site_texts TO service_role;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_texts_public_read" ON public.site_texts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  customer_name text NOT NULL DEFAULT '',
  customer_whatsapp text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'transaccion' CHECK (status IN ('transaccion','pagado','entregado','cancelado')),
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'personalizada' CHECK (kind IN ('personalizada','coleccion')),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  collection_name text NOT NULL DEFAULT '',
  color_name text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  placement_id text NOT NULL DEFAULT '',
  qty int NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price numeric(10,2) NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.place_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order public.orders;
  item jsonb;
  v_variant public.product_variants;
  v_total numeric(10,2) := 0;
  v_code text;
BEGIN
  v_code := 'TZ-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

  INSERT INTO public.orders (code, customer_name, customer_whatsapp, notes)
  VALUES (
    v_code,
    coalesce(payload->>'customer_name', ''),
    coalesce(payload->>'customer_whatsapp', ''),
    coalesce(payload->>'notes', '')
  )
  RETURNING * INTO new_order;

  FOR item IN SELECT * FROM jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  LOOP
    IF (item->>'variant_id') IS NOT NULL THEN
      SELECT * INTO v_variant FROM public.product_variants
        WHERE id = (item->>'variant_id')::uuid FOR UPDATE;
      IF v_variant IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada';
      END IF;
      IF v_variant.stock < (item->>'qty')::int THEN
        RAISE EXCEPTION 'Sin existencias suficientes para %', coalesce(item->>'title', 'la prenda');
      END IF;
      UPDATE public.product_variants
        SET stock = stock - (item->>'qty')::int
        WHERE id = v_variant.id;
    END IF;

    INSERT INTO public.order_items (
      order_id, kind, product_id, variant_id, design_id, title, collection_name,
      color_name, size, placement_id, qty, unit_price
    ) VALUES (
      new_order.id,
      coalesce(item->>'kind', 'personalizada'),
      nullif(item->>'product_id', '')::uuid,
      nullif(item->>'variant_id', '')::uuid,
      nullif(item->>'design_id', '')::uuid,
      coalesce(item->>'title', ''),
      coalesce(item->>'collection_name', ''),
      coalesce(item->>'color_name', ''),
      coalesce(item->>'size', ''),
      coalesce(item->>'placement_id', ''),
      coalesce((item->>'qty')::int, 1),
      coalesce((item->>'unit_price')::numeric, 20)
    );

    v_total := v_total + coalesce((item->>'qty')::int, 1) * coalesce((item->>'unit_price')::numeric, 20);
  END LOOP;

  UPDATE public.orders SET total = v_total, updated_at = now() WHERE id = new_order.id;

  RETURN jsonb_build_object('id', new_order.id, 'code', new_order.code, 'total', v_total);
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.set_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev text;
  it public.order_items;
BEGIN
  SELECT status INTO prev FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF prev IS NULL THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  IF prev <> 'cancelado' AND p_status = 'cancelado' THEN
    FOR it IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      IF it.variant_id IS NOT NULL THEN
        UPDATE public.product_variants SET stock = stock + it.qty WHERE id = it.variant_id;
      END IF;
    END LOOP;
  ELSIF prev = 'cancelado' AND p_status <> 'cancelado' THEN
    FOR it IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      IF it.variant_id IS NOT NULL THEN
        UPDATE public.product_variants SET stock = greatest(stock - it.qty, 0) WHERE id = it.variant_id;
      END IF;
    END LOOP;
  END IF;

  UPDATE public.orders SET status = p_status, updated_at = now() WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_order_status(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_order_status(uuid, text) TO service_role;
