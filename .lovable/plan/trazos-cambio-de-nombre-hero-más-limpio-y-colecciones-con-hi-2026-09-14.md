# Trazos — cambio de nombre, hero más limpio y colecciones con historia

## 1. Nuevo nombre y logo

- Toda la tienda pasa de "Perchas" a **Trazos · Coordenadas Artísticas**: menú, título de las páginas, bolsa, pie de página y el mensaje de WhatsApp ("Hola Trazos, quiero encargar…").
- Tu logo (mapa de Venezuela con la T y el texto TRAZOS) se sube como imagen del sitio y reemplaza el símbolo vectorial actual en el menú, el hero y el pie. También se usa como ícono de la pestaña del navegador.
- Se cuida que el logo se vea bien sobre el carrusel oscuro y sobre fondo claro.

## 2. Hero más rápido y más legible

- La transición entre las 5 fotos se acelera (cada foto ~3 s en vez de 5 y el efecto de mezcla más corto).
- Se eliminan las flechas de cambiar imagen; queda el arrastre y los puntos discretos.
- Se elimina el titular largo "Franelas de edición limitada con los paisajes de Venezuela". En su lugar: logo + una línea corta tipo "Franelas de autor · Arte venezolano" y los dos botones (Diseñar mi franela / Ver colecciones).
- Para que el texto se lea perfecto sobre cualquier foto: un velo suave y degradado detrás del bloque central y el texto en blanco cálido con sombra fina. Sin cajas duras ni bordes.

## 3. Secciones que se eliminan

- Se quita la sección de **materiales** (video de tela).
- Se quita la sección del **proceso de serigrafía** completa (los 5 pasos y su video).
- La página queda: hero → personalizador → colecciones → pie.

## 4. Colecciones con historia y camino a comprar

- Al tocar una colección se abre su propia página (por ejemplo Los Roques, Canaima, Mérida, Zulia, Falcón) con:
  - foto grande del paisaje,
  - la historia del lugar y **cómo se diseñó la prenda** (del paisaje al trazo, la paleta y el estampado elegido),
  - la galería de los diseños de esa colección,
  - dos botones claros: **Personalizar esta prenda** y **Ver en 3D**.
- Desde ahí el cliente llega al personalizador con el diseño ya cargado, o al visor 3D con ese mismo diseño.

## 5. El visor 3D se mantiene y se mejora

- Se conserva el visor 3D de la franela y se adapta a los nuevos diseños: recibe el diseño y el color elegidos, muestra el nombre de la obra, y tiene botones para color, talla y "Agregar a la bolsa" — la misma bolsa del resto de la tienda.
- El visor y el personalizador plano quedan como dos vistas de lo mismo, con un cambio de vista visible ("Vista plana / Vista 3D") para que cualquiera lo entienda.

## 6. Claridad para cualquier persona

- Pasos numerados visibles en el personalizador: 1 diseño · 2 color · 3 talla · 4 posición del estampado · 5 comprar.
- Las 4 posiciones se mantienen con su medida (adelante 25×25, espalda 25×25, pecho izquierdo 10×10, pecho + espalda).
- Botón de bolsa siempre visible con el contador.

## Detalles técnicos

- Renombrado: `src/lib/perchas.ts` → `src/lib/trazos.ts` (mismos datos y funciones; textos de WhatsApp actualizados), `PerchasMark.tsx` → `TrazosMark.tsx` usando el logo subido con `lovable-assets`, favicon en `public/`.
- `src/routes/index.tsx`: se eliminan las dos secciones `ScrollVideo` y el arreglo `PROCESS`; hero con `MorphSlider` (`autoplayDelay={3}`, `showControls={false}`), overlay con degradado radial + `text-shadow` por token en `src/styles.css`.
- Nueva ruta `src/routes/coleccion.$slug.tsx` con `head()` propio (título, descripción, og/twitter) que lee `COLLECTIONS`; se añade a cada colección `story` y `designNotes` en el archivo de datos.
- `CollectionsSection.tsx`: las tarjetas pasan a `Link` a `/coleccion/$slug`.
- `AtelierPanel.tsx` / `ShirtViewer.tsx` se conservan; el panel se conecta a `useBag` y a `Design` (en vez de `ARTWORKS` solamente); `/taller` acepta `?diseno=` y `?color=`.
- Sin cambios de base de datos; el pedido sigue por WhatsApp al +58 424-1335096.

## Pendiente de tu parte

- Las historias reales de cada colección: se escribe una versión inicial que puedes corregir.
- Las fotos de tus estampados por estado, para reemplazar las obras de ejemplo.
