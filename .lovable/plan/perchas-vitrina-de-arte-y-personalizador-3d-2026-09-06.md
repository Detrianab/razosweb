# Perchas — Vitrina de arte y personalizador 3D

Web de lujo minimalista en español para la marca venezolana Perchas: una experiencia cinematográfica donde el video avanza con el scroll, se aprecia el arte inspirado en Venezuela y se personaliza una camisa en 3D.

## Experiencia (lo que verá el visitante)

1. **Apertura cinematográfica**: pantalla completa con video que no se reproduce solo — avanza cuadro a cuadro según el scroll. Sobre él aparece el logo de Perchas y una frase de marca.
2. **Historia de la marca**: mientras se sigue bajando, el video continúa y entran textos cortos con animación suave (aparecer, desplazarse, escala) sobre la esencia de la marca.
3. **Galería de arte**: tres obras de nivel museo, estilo pintura clásica al óleo, de Los Roques, Canaima y Los Médanos de Coro. Cada obra se puede ver en grande, con su nombre y una descripción breve.
4. **Personalizador**: al elegir una obra se pasa al taller. Ahí una camisa en 3D muestra el arte aplicado en el pecho y se puede:
   - girar y acercar la prenda con el mouse o el dedo
   - cambiar el color de la tela (paleta minimalista: crudo, negro, arena, oliva, azul profundo)
   - cambiar la obra sin salir del taller
   - ajustar tamaño y posición del arte sobre la prenda
   - elegir talla (S–XXL)
   - ver un resumen del diseño y enviarlo por WhatsApp para encargarlo (sin pagos)
5. **Cierre**: contacto y redes.

Todo en español. Sin cuentas ni pagos.

## Contenido que voy a crear

- **Logo Perchas**: minimalista y moderno, tipográfico, en versión clara y oscura.
- **Tres obras de arte** generadas con máximo nivel de detalle pictórico: Los Roques, Canaima (Salto Ángel / tepuyes), Médanos de Coro.
- **Clips de video** generados con IA para el fondo scroll-driven: mar y luz de Los Roques, bruma sobre el tepuy, dunas de Coro, y un plano de tela en movimiento.
- Textos de marca provisionales: los escribo yo y te aviso qué debes reemplazar con la información real (contacto, WhatsApp, precios, envíos) — no tengo esos datos.

## Detalles técnicos

- Ruta principal en `src/routes/index.tsx` (reemplaza el placeholder); taller en `/taller` con estado compartido de la selección.
- Scroll-driven video: elemento `<video>` fijo, `preload="auto"`, sin autoplay; el `currentTime` se mapea a la posición de scroll con interpolación suavizada y `requestAnimationFrame`. Fallback a póster estático si el navegador no permite seek suave o el usuario prefiere movimiento reducido (`prefers-reduced-motion`).
- Animaciones de entrada por sección con IntersectionObserver + utilidades de animación existentes; sin librerías de scroll pesadas.
- 3D con React Three Fiber: `three`, `@react-three/fiber@^9`, `@react-three/drei@^10`, `@types/three`. Se adapta el `ModelViewer` que enviaste: se conserva su lógica de rotación manual/inercia, parallax, pinch-zoom, autoframe y fade-in; se convierte a TypeScript, se le quita el botón de screenshot y el `Environment preset` (que carga HDR externo) por `Environment` con `Lightformer` local, y se añade soporte de material: color de tela sobre el mesh y el arte como textura aplicada al frente.
- Modelo de camiseta: se descarga un GLB de camiseta con licencia CC0 (Kenney/Quaternius/poly.pizza) y se valida antes de escribir el código que lo referencia; si ningún archivo válido se obtiene, se usa una prenda generada proceduralmente y te lo digo explícitamente.
- El arte se aplica como textura decal con `colorSpace = SRGBColorSpace`, offset/escala controlados por el panel del personalizador.
- Ruta del taller con `ssr: false` para que el Canvas nunca se renderice en el servidor; componentes con `useGLTF`/`useTexture` dentro de `<Suspense>` en el Canvas.
- Sistema de diseño: tokens semánticos nuevos en `src/styles.css` (negro tinta, hueso, dorado apagado como acento), tipografía editorial serif para títulos + sans geométrica para texto, cargada con `<link>` en `__root.tsx`. Nada de morado/índigo genérico.
- Metadatos propios (título, descripción, og/twitter) en cada ruta de contenido.
- Verificación con capturas del navegador: apertura, avance del video al hacer scroll, y el taller 3D con arte aplicado y cambio de color.
