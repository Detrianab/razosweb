# La prenda 3D solo gira con el ratón

Ahora la franela en 3D gira sola. Cambio: se queda quieta y solo se mueve cuando la persona la arrastra con el ratón (o con el dedo en el móvil).

## Qué cambia

- La prenda aparece de frente, completamente quieta.
- Al arrastrar, gira siguiendo el movimiento; al soltar, se detiene suavemente sin volver a girar por sí sola.
- Se aplica en la portada (segundo scroll) y en la página de personalizar.
- Se añade una indicación discreta tipo "Arrastra para girar" para que se entienda que se puede mover.

## Detalle técnico

- `src/components/ShirtViewer.tsx`: `autoRotate` pasa a `false` por defecto y el bloque de rotación automática en el `useFrame` del `Rig` se elimina, conservando el arrastre con inercia amortiguada.
- Se quita el paso de `autoRotate` desde `src/routes/index.tsx` y `src/components/AtelierPanel.tsx`.
- Sin cambios de datos ni de base de datos.
