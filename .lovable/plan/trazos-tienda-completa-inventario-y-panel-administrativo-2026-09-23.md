# Trazos: tienda completa, inventario y panel administrativo

Todo se construye en un solo trabajo. La tienda pasa de textos fijos en el código a contenido que tú controlas desde un panel, con inventario real y pedidos que quedan registrados para verificar y llevar la contabilidad.

## 1. Base de datos (Lovable Cloud)

Se activa la base de datos de Lovable para guardar inventario, diseños, colecciones y pedidos. Así el stock es el mismo para todos los visitantes y tú lo controlas desde el panel.

Se guardan: colecciones (estado, historia, notas de diseño, portada), diseños (imagen, título, colección), productos (tipo: franela / chemise / hoodie, color, talla, stock, precio, edición limitada), zonas de estampado permitidas por diseño, textos editables de la web y pedidos con sus líneas.

## 2. Panel administrativo (/personal, código 1010)

- En el menú aparece una opción discreta **Solo personal**. Al entrar se pide el código **1010**.
- Secciones del panel, en lenguaje sencillo y con formularios simples:
  - **Resumen**: ventas del mes, pedidos por verificar, piezas con poco stock.
  - **Pedidos**: cada pedido llega en estado *En transacción*. Tú lo marcas *Pagado*, *Entregado* o *Cancelado*. Al confirmarlo se descuenta del stock; al cancelarlo se devuelve.
  - **Inventario**: lista de prendas con stock por talla y color, edición y aviso cuando queda poco.
  - **Colecciones y diseños**: crear colección, subir diseño (imagen), escribir historia y notas, y elegir qué zonas de estampado se permiten en ese diseño (adelante 25×25, espalda 25×25, pecho izquierdo 10×10, pecho + espalda).
  - **Textos de la web**: editar títulos, frases y botones sin desconfigurar nada.
  - **Contabilidad**: total vendido, por pedido y por colección, con exportación a CSV.

## 3. Inventario y compra

- Cada prenda vale **$20 USD**; la bolsa muestra subtotal y total.
- Ediciones limitadas: se muestra el stock disponible y se agota cuando llega a cero.
- Al enviar el pedido por WhatsApp, el pedido se registra en el panel como *En transacción* y **la bolsa no se borra**.
- Se reserva el stock al crear el pedido y se libera si lo cancelas.

## 4. Inicio (Home)

Orden: primer vistazo (portada) → **Colección** → **Personalización**. Se elimina el botón "Ver colecciones" de la portada para que se navegue bajando.

## 5. Tienda de Colección

- Categorías: **Franelas, Chemises y Hoodies**, estilo sobrio tipo Cavana.
- Cada producto: vista frontal y posterior en mockup plano, talla, color, cantidad, stock restante y cuidados de lavado.
- Las prendas se recorren **deslizando de lado**, con el dedo en celular y arrastrando con el ratón o el trackpad en computadora, sin necesidad de flechas.

## 6. Tienda de Personalización

- Flujo: tipo de prenda → color → talla → diseño y zona de estampado, siempre en 3D.
- Las zonas disponibles se leen de lo que activaste en el panel para ese diseño.
- En celular la prenda queda fija arriba mientras se baja a elegir color, talla y diseño.

## 7. Galería de Diseños por estados

Página con scroll vertical continuo por estado; al tocar un estado se abren sus diseños y al tocar un diseño se va directo a personalizar con ese diseño cargado.

## 8. Prenda 3D más limpia

Se ajusta el modelo actual a un corte más ancho tipo oversize, con tela mate, luz suave y frontal, y sin sombras marcadas, para que el estampado se lea plano y nítido.

## 9. Móvil

Escalas proporcionales, sin deformaciones ni textos encogidos: tipografías y espacios con medidas relativas y el visor 3D con altura fija cómoda.

---

## Detalles técnicos

- Lovable Cloud (Supabase) con tablas `collections`, `designs`, `products`, `product_variants`, `design_placements`, `site_texts`, `orders`, `order_items`; RLS: lectura pública de catálogo, escritura solo desde funciones de servidor.
- El código 1010 se valida en una server function y abre una sesión firmada por cookie (`useSession`) para `/personal/*`; el código no vive en el cliente. Nota: es un portón compartido, no cuentas individuales.
- Creación de pedido y descuento de stock en server functions con transacción/RPC para evitar vender más de lo disponible.
- Subida de imágenes de diseño a Supabase Storage (bucket público de catálogo).
- `src/lib/trazos.ts` pasa a ser solo tipos y helpers; los datos vienen de la base y se cargan con TanStack Query en loaders.
- La bolsa mantiene `localStorage` y suma `unitPrice = 20`; el envío a WhatsApp deja de vaciarla.
- Rutas nuevas: `/tienda`, `/tienda/$productSlug`, `/personalizar`, `/galeria`, `/personal` y subpáginas del panel.
- `ShirtViewer.tsx`: escala de hombros/cuerpo más ancha, `roughness` alta sin brillo, luz difusa, `ContactShadows` muy tenue.
