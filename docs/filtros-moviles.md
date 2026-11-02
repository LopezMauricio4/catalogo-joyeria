# Filtros móviles del catálogo

Se implementaron los comportamientos descritos como bottom-sheet-interaction, swipeable-pills-filter y touch-target-optimization usando taste-skill, apple-design y mobile-native como guías. Los nombres de patrones no se instalaron como habilidades independientes.

## Comportamiento

- En móvil, «Filtros» abre una hoja inferior. También se puede abrir arrastrando hacia arriba desde ese botón.
- El tirador permite cerrar hacia abajo. Un arrastre corto vuelve a la posición abierta; el resorte conserva posición y velocidad al interrumpirse.
- Solo el tirador captura el gesto vertical de cierre. El formulario mantiene su desplazamiento nativo, separado del gesto.
- El botón «Aplicar filtros» queda en una base estable fuera del área desplazable, con espacio para el indicador de inicio y adaptación a visualViewport.
- Material, categoría, presupuesto y orden se editan como borrador. «Aplicar» actualiza los parámetros de la URL; cerrar descarta los cambios pendientes.
- «Restablecer» limpia el borrador de esos filtros. La búsqueda escrita se conserva.
- El recuento muestra cuántas piezas coinciden antes de aplicar. Un rango inválido mantiene abierta la hoja, anuncia el error y enfoca el campo de máximo.
- Las categorías rápidas son pills con desplazamiento horizontal nativo. Conservan navegación por flechas de teclado.
- Los botones de selección, controles del formulario y acciones tienen al menos 48 × 48 px. Las opciones mantienen una separación de 8 px.
- La presión responde desde pointerdown, con escala 0,97. Pointercancel, blur y liberación limpian el estado para evitar botones visualmente atascados.
- Con movimiento reducido, se omite el viaje del resorte y la escala; se conserva la respuesta de opacidad.
- En escritorio, el mismo formulario se presenta como diálogo centrado. Se mantiene el menú de navegación existente; no se añadió una barra inferior nueva.

## Archivos

- `src/components/BottomSheet.jsx`: diálogo nativo, foco, Escape, fondo modal, arrastre y resorte sin dependencias nuevas.
- `src/components/CatalogFilters.jsx`: borrador, formulario, validación, recuento y aplicación.
- `src/hooks/usePressFeedback.js`: feedback delegado de presión y limpieza de cancelaciones.
- `src/styles/mobile-filters.css`: layout adaptable, objetivos táctiles y estados.
- `src/pages/Catalog.jsx`: integración con filtros existentes y parámetros de URL.
- `index.html`: viewport-fit=cover para respetar áreas seguras.

## Verificación

- Compilación de producción y ESLint aprobados; las 25 pruebas existentes pasan.
- 23 comprobaciones de navegador aprobadas con datos reales del catálogo.
- Capturas revisadas de hoja abierta a 320, 390, 768 y 1440 px; filtros rápidos a 320 y 390 px sin desbordamiento.
- Medición de todos los botones, inputs y selects visibles de la hoja: ninguno por debajo de 48 × 48 px.
- Gestos sintetizados con touchStart, touchMove, touchEnd y touchCancel de Chromium: apertura, cierre, retorno de arrastre corto, recuperación de cancelación y scroll horizontal nativo.
- Presión comprobada antes de soltar: transform matrix con escala 0,97.
- Comprobados borrador, filtro real de oro 18k, rango inválido, Escape, foco y movimiento reducido.
- Probada altura de viewport de 420 px para comprobar que «Aplicar» sigue visible. Esto aproxima una pantalla con teclado; no sustituye una prueba del teclado de iOS o Android.
- Detector de Impeccable sobre los componentes, hook y CSS nuevos: sin hallazgos.

Evidencia local en `.taste-skill/mobile-filters-checks.json`, `.taste-skill/mobile-filters-detect.json` y capturas `filter-sheet-*.jpg` / `filter-pills-*.jpg`. Esa carpeta permanece excluida de Git.

La verificación táctil se realizó en Chromium emulado, no en un teléfono físico. Falta comprobar en hardware el teclado, áreas seguras y comportamiento específico de Safari. La compilación conserva el aviso anterior de tamaño del bundle; no se incorporaron librerías de animación.
