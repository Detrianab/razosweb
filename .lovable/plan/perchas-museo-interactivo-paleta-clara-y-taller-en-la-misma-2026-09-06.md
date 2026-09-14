# Perchas — Museo interactivo, paleta clara y taller en la misma página

Rehacemos la experiencia en una sola página continua: fondo claro, paleta de marca definida, museo interactivo de obras, y el personalizador 3D integrado sin necesidad de pulsar ningún botón para llegar a él.

## Paleta y estilo

Nueva paleta única en todo el sitio: blanco/beige de fondo, negro para textos, azul marino y marrón como acentos.

- Fondo claro (blanco hueso / beige), tipografía negra.
- Azul marino como acento principal (enlaces, detalles, líneas), marrón para acentos cálidos.
- Se eliminan el fondo negro y el dorado actuales.
- Los colores de tela del taller pasan a ser: blanco, negro, azul marino, marrón, beige.

## Experiencia (lo que verá el visitante)

1. **Apertura**: el video que avanza con el scroll se mantiene, y encima se añade una segunda animación: los retratos/obras aparecen y desaparecen creciendo desde cero mientras se baja, con el título de Perchas en el centro que se invierte sobre lo que pasa por detrás.
2. **Museo interactivo**: sala de obras donde cada pieza se descubre al desplazarse (imagen que se revela de un lado a otro, texto que entra con parallax, alternando lado izquierdo/derecho). Al pasar el cursor o tocar una obra se amplía con su ficha (lugar, título, descripción) y se puede abrir a pantalla completa para apreciarla en detalle.
3. **Taller en la misma página**: justo debajo del museo, sin salir ni pulsar "entrar al taller". Al seleccionar una obra en el museo, la página desplaza suavemente al taller y la camisa 3D ya muestra esa obra. Ahí se gira/acerca la prenda, se cambia obra, color de tela, talla y tamaño/posición del arte, y se envía el pedido por WhatsApp. La ruta `/taller` se conserva como enlace directo, pero deja de ser el camino principal.
4. **Más video de desplazamiento**: se añaden dos clips nuevos generados con IA (tela de lujo en movimiento y detalle de taller) como capítulos scroll-driven entre secciones.
5. **Cierre — el proceso de serigrafía**: sección final con un video de lujo, hiperrealista, que muestra paso a paso el proceso (preparación de la malla, mezcla de tintas, pase de rasqueta, curado y control de calidad), acompañado de textos cortos por paso que aparecen a medida que avanza el video con el scroll.

Todo en español, sin cuentas ni pagos.

## Contenido nuevo que voy a crear

- 1 video hiperrealista de lujo del proceso de serigrafía (varios clips generados y unidos en secuencia).
- 1–2 clips adicionales de textura/tela de lujo para los capítulos de desplazamiento.
- Recortes verticales de las tres obras para el muro de retratos de la apertura.

## Detalles técnicos

- Dependencias nuevas: `gsap`, `@gsap/react`, `framer-motion`. `lucide-react` ya está.
- `src/components/ui/scroll-portrait-wall.tsx`: se copia el componente indicado, adaptado a TypeScript estricto (tipar refs y `gsap.utils.toArray<HTMLElement>`), sin `"use client"`, con las imágenes de las obras Perchas en vez del CDN de avatares, y clases con tokens semánticos (nada de `bg-black`/`text-white`).
- `src/components/ui/parallax-scroll-feature-section.tsx`: se copia adaptado a un componente con props (`sections` recibidas desde `ARTWORKS`) para evitar hooks dentro de `.map` con longitud variable — cada obra se renderiza en un subcomponente propio con sus `useScroll`/`useTransform`. Es la base del museo interactivo.
- Ambos se montan en `src/routes/index.tsx`. `framer-motion`/GSAP con `ScrollTrigger` solo en cliente: los bloques con `window`/`matchMedia` se ejecutan dentro de `useGSAP`/`useEffect`, sin romper SSR.
- El taller se extrae de `src/routes/taller.tsx` a `src/components/AtelierPanel.tsx` (estado: obra, color, talla, escala, posición) y se reutiliza en la portada dentro de `<ClientOnly>` con el `Canvas` de React Three Fiber cargado con `React.lazy`, para que nunca se renderice en servidor. `/taller` renderiza el mismo componente.
- La selección de obra en el museo actualiza el estado del taller y hace `scrollIntoView({ behavior: "smooth" })` sobre la sección del taller.
- `src/styles.css`: se reescriben los tokens `:root` a la paleta clara (background beige/blanco, foreground negro, accent azul marino, secondary marrón); se ajustan bordes, `card` y `muted` para contraste correcto. `FABRIC_COLORS` en `src/lib/perchas.ts` pasa a los cinco colores nuevos.
- Videos: se generan con la herramienta de video, se optimizan con ffmpeg (`crf` moderado, `-g` corto y `+faststart` para que el seek por scroll sea fluido) y se suben como punteros `.asset.json`; se reproducen con el `ScrollVideo` existente.
- Metadatos propios por ruta ya existentes; se actualizan descripciones al nuevo enfoque.
- Verificación con capturas del navegador: apertura con muro de retratos, museo, taller 3D en la misma página con cambio de obra y color, y sección de serigrafía.

## Lo que necesito de ti

Sigo con datos de ejemplo para WhatsApp, correo e Instagram hasta que me des los reales.
