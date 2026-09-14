# Trazos — portada de lujo, colecciones en carrusel 3D y personalizador solo en 3D

## 1. Portada (hero)

- El logo aparece sin ningún fondo ni caja: solo el trazo sobre las fotos, con un velo suave y muy amplio para que se lea perfecto.
- Debajo del logo: **Coordenadas Artísticas** (se elimina "Tienda de franelas").
- El botón principal pasa a decir **Diseñar mi prenda**; el segundo sigue llevando a las colecciones.
- Entrada de lujo: el logo aparece con un fundido y una subida lenta, el texto revela letra por letra con las letras separándose, una línea fina se dibuja de centro a los lados y los botones aparecen al final. Movimiento lento y elegante, nada rebotado.
- Las 5 fotos de Venezuela y el efecto de mezcla se mantienen, un poco más suaves y con un grano ligero para dar sensación premium.

## 2. Segundo scroll: el visualizador 3D

- Se elimina el personalizador plano de la portada. En el segundo scroll aparece directamente la **franela en 3D**, grande y centrada, girando despacio, con el primer diseño cargado y el color de tela cambiable.
- Debajo, un CTA grande: **Ver colecciones por estado para personalizar tu camisa**, con una frase corta que explica el camino (elige el estado, lee su historia, personaliza en 3D).


## 3. Colecciones en carrusel 3D (coverflow)

- Las colecciones pasan de cuadrícula a un carrusel **coverflow 3D**: la tarjeta central grande y de frente, las laterales inclinadas y en profundidad, con reflejo, sombra profunda y transiciones lentas.
- Cada tarjeta: nombre del estado, nombre de la colección, una línea de su historia y el botón **Ver la historia**.
- Se puede arrastrar, usar los puntos y el teclado; sin flechas duras (versión de lujo, botones discretos).
- Paleta del carrusel adaptada a Trazos (fondo profundo, acento dorado suave), no la del ejemplo de restaurante.

## 4. Página de la colección

- Se mantiene la portada del paisaje, la historia y "cómo se diseñó la prenda".
- La galería de diseños ya no ofrece varias vistas: cada diseño lleva directo al visor 3D.
- Un único botón grande y protagonista: **Personalizar esta prenda** (lleva al personalizador 3D con ese diseño cargado). Se elimina el segundo botón duplicado.

## 5. Personalizar = solo 3D

- Desaparece por completo la vista plana de la franela y el cambio "vista plana / vista 3D": la única manera de ver la prenda es en 3D.
- El personalizador 3D reúne todo en una pantalla: diseño de la colección, color de la tela, talla, las 4 posiciones del estampado (adelante 25×25, espalda 25×25, pecho izquierdo 10×10, pecho + espalda), cantidad y **Agregar a la bolsa**.
- La franela 3D gira sola despacio y se puede girar con el dedo o el ratón; el diseño y el color cambian en vivo.
- El pedido sigue saliendo por WhatsApp al +58 424-1335096 desde la bolsa.

## 6. Detalles de lujo en toda la página

- Títulos que se revelan al entrar en pantalla (fundido + subida corta, en cascada), líneas finas que se dibujan y botones con relleno que barre al pasar el ratón.
- Espacios más generosos, tipografía serif más grande en los títulos y textos en mayúsculas muy espaciadas para los rótulos.

## Detalles técnicos

- `src/components/ui/3-d-coverflow-carousel.tsx`: nuevo componente (React + Tailwind, sin dependencias nuevas; iconos de `lucide-react`), reescrito con tokens semánticos de `src/styles.css` en lugar de colores fijos. Lo consume `CollectionsSection.tsx` mapeando `COLLECTIONS` a `CarouselItem` y navegando a `/coleccion/$slug`.
- `src/routes/index.tsx`: hero sin la caja `bg-background/85` del logo, copy "Coordenadas Artísticas", botón "Diseñar mi prenda" que baja al visor 3D; se elimina la sección `#personalizar` con `Customizer` y se añade una sección con `ShirtViewer` (lazy + `ClientOnly`, `autoRotate`) más el CTA a colecciones. `MorphSlider` con `duration` algo mayor y `intensity` más baja.
- Animaciones: componente `Reveal` existente + nuevos helpers (`SplitText` para el revelado por letras) con `gsap`, ya instalado; respetan `prefers-reduced-motion`.
- `src/components/ShirtStatic.tsx` y `src/components/Customizer.tsx` se eliminan; `AtelierPanel.tsx` se amplía con talla, posición (`PLACEMENTS`), cantidad y `useBag`, y `ShirtViewer.tsx` recibe `placement` para colocar el estampado (frente/espalda/pecho).
- `src/routes/taller.tsx` queda como el único personalizador (`?coleccion=&diseno=&color=`); `coleccion.$slug.tsx` enlaza allí con un solo botón grande. Los enlaces a `/#personalizar` en cabecera y colección se cambian a `/taller` o a `#colecciones`.
- `head()` de cada ruta se actualiza (título y descripción sin "tienda de franelas"). Sin cambios de base de datos.

## Pendiente de tu parte

- Las fotos reales de los estampados por estado y las historias definitivas de cada colección.
