# Perchas: tienda de ropa desde el primer segundo

Objetivo: al abrir la página se entiende de inmediato que es una tienda de franelas, con un menú de lujo siempre visible, bolsa de compras (no carrito) y un camino claro: ver → personalizar → comprar por WhatsApp.

## Lo que verá el cliente

1. **Menú fijo de lujo (siempre visible)**
   Logo Perchas, enlaces a Tienda, Colecciones, Personalizar y Contacto, botón "Diseñar mi franela" y el ícono de **bolsa de compras** con el contador de piezas. Fondo transparente arriba, se vuelve sólido al bajar.

2. **Primer pantallazo: carrusel de Venezuela**
   El hero pasa a ser el carrusel animado con las 5 fotos que enviaste (Los Roques, Canaima, Mérida, Zulia, Médanos de Falcón), con transición tipo derretido y arrastre con el dedo. Encima: logo, la frase que aclara que es una tienda de franelas de arte venezolano y dos botones: "Diseñar mi franela" y "Ver colecciones".

3. **Segundo pantallazo: la franela y su personalizador**
   Franela estática (vista frente y espalda) con todos los controles: diseño, color de tela, talla y **posición del estampado**:
   - 1 · Dibujo adelante (25×25)
   - 2 · Dibujo en la espalda (25×25)
   - 3 · Solo pecho izquierdo (10×10)
   - 4 · Pecho izquierdo + parte trasera
   Debajo, un botón que lleva a las colecciones por estado.

4. **Colecciones de los estados**
   Tarjetas por estado (Los Roques, Canaima, Mérida, Zulia, Falcón). Al elegir una, sus diseños se cargan en el personalizador y la página sube de vuelta a la franela.

5. **Bolsa de lujo y compra**
   "Comprar" agrega la pieza a la bolsa y lleva a la página de la bolsa: resumen, cantidades, eliminar y "Enviar pedido por WhatsApp" al **+58 424-1335096** con el detalle (diseño, color, talla, posición, tamaño y cantidad).

6. **Textos que se eliminan**
   Se quitan "Vestir un país", "Silencio y detalle" y "Una pieza a la vez", y el muro de retratos que sobra. Se conservan las secciones de materiales y del proceso de serigrafía, más abajo.

## Detalles técnicos

- `src/routes/index.tsx` se reescribe: `MorphSlider` (ogl + gsap, ya instalado) con `src/assets/hero-image*.png.asset.json`, luego `ShirtStatic` + `Customizer`, luego `CollectionsSection`, después las secciones de video existentes y el footer. Se elimina el arreglo `CHAPTERS` y `ScrollPortraitWall`.
- `src/routes/__root.tsx` envuelve la app en `BagProvider` (`src/lib/bag.tsx`) y renderiza `SiteHeader` fijo sobre el `<Outlet />`.
- Estado compartido en index: colección seleccionada → lista de diseños del `Customizer`; "Comprar" hace `add()` y navega a `/bolsa`.
- Datos ya existentes en `src/lib/perchas.ts`: `COLLECTIONS`, `FABRIC_COLORS`, `SIZES`, `PLACEMENTS`, `WHATSAPP_NUMBER`, `buildBagWhatsAppLink`.
- Se mantiene `/taller` con el visor 3D. `head()` de `/` se actualiza a lenguaje de tienda.
- Verificación en navegador: hero visible, personalizador con las 4 posiciones, colección cargando diseños, bolsa y enlace de WhatsApp correcto.

## Pendiente de tu parte

Las fotos de tus diseños/estampados por estado: ahora se usan las 3 obras existentes como ejemplo hasta que envíes las reales.
