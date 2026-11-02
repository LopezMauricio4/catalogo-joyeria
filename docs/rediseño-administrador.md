# Rediseño del administrador

## Resultado

El inventario utiliza filas compactas: miniatura, identidad, estado, existencias, costo y precio. Los detalles se expanden con un botón independiente y accesible; incluyen identificador, categoría, mínimo, medidas y descripción cuando existen. Las alertas de stock permanecen visibles. No se añadieron proveedores ni historiales ficticios a datos que no los ofrecen.

Productos, insumos y ventas tienen tres pestañas por tarea. Los paneles permanecen montados: cambiar de pestaña conserva borradores, archivos, imágenes y líneas de venta. La validación nativa abre la pestaña del primer campo inválido y lo enfoca.

En móvil, Productos, Inventario y Ventas forman una barra inferior fija con destinos de 56 px de alto. Los filtros usan una hoja inferior y conservan su actualización inmediata. Los movimientos de existencias y la confirmación de eliminación reutilizan la hoja, con cierre por botón, Escape o arrastre. No se pueden descartar durante el guardado. Las notificaciones aparecen encima de la navegación.

## Alcance del código

- `src/components/InventoryCard.jsx`: resumen compacto y detalles expandibles.
- `src/components/AdminFormSections.jsx`: pestañas, teclado y foco de validación.
- `src/components/AdminFilters.jsx`: filtros adaptables a escritorio/móvil.
- `src/components/AdminNavigation.jsx` y `src/styles/admin-workspace.css`: navegación y presentación administrativa.
- `src/pages/ProductEditor.jsx`, `src/pages/InventoryPage.jsx` y `src/components/SaleForm.jsx`: agrupación de campos existentes.
- `src/components/BottomSheet.jsx`: referencias estables de cierre y protección del guardado, sin reabrir el diálogo al escribir.
- `src/components/ToastProvider.jsx`: clases para posicionar y dimensionar las notificaciones administrativas mediante CSS.

Se mantienen rutas, autenticación, contratos de API, callbacks de guardado, movimientos de existencias, restricciones, procesamiento de imágenes y cálculos de costos/ganancias. Solo se añadieron estados de presentación: pestaña, expansión y apertura de filtros. Los campos obligatorios de nombre y descripción del producto reflejan las validaciones existentes.

## Dirección visual y crítica

Se aplicó taste-skill en modo app: **Achromatic ledger**, semilla **1575821822**, conservando paleta y tipografía de Alpez. Inter sigue siendo la fuente de interfaz; cifras e identificadores usan una fuente monoespaciada y números tabulares, por solicitud expresa. La firma visual es la fila de joyería con miniatura, material/medidas y tres columnas numéricas.

Preguntas de cada pantalla: «¿Qué existencias necesitan atención?» en inventario; «¿Qué datos necesito completar?» en edición; «¿Cuál es el costo y la ganancia?» en venta.

Revisión de capturas en escritorio, tablet y móvil:

1. La lista responde a la pregunta de existencias; disponible, stock bajo y cero se distinguen sin expandir.
2. Las filas comparten bordes y columnas. En móvil las cifras pasan debajo de la identidad; no se fuerza el desplazamiento horizontal de la página.
3. Se conserva el fondo marfil y el verde de Alpez. Los estados de riesgo añaden color y texto; las superficies permanecen planas.
4. Los datos ficticios de prueba suman tres artículos, dos bajo su mínimo. Una línea con costo 1.250 COP y venta de 5.000 COP muestra ganancia de 3.750 COP. Las cifras conservan decimales y unidades.
5. Cero se muestra como cero. No se añadieron indicadores ni gráficas sin datos.
6. No hay leyendas o gráficas nuevas. Los nombres largos se resumen en la fila y aparecen completos en los detalles.
7. La navegación se convierte en barra inferior; los controles de edición y expansión mantienen 48 × 48 px.

El inspector `--app` registró **cero fallos** a 1440, 768 y 390 px. Advertencias aceptadas: fondo marfil existente; fondos suaves en botones reales de editar/expandir, no iconos decorativos de indicadores; metadatos de 12 px en móvil, conforme al pedido de densidad. Las cifras importantes tienen área propia y contraste con el fondo.

## Verificación

- `npm run lint`: correcto.
- `npm run build`: correcto; Vite conserva la advertencia de bundle JavaScript superior a 500 kB (~603 kB).
- `npm test`: 27 pruebas aprobadas.
- Navegador: 24 comprobaciones administrativas aprobadas a 320, 390, 768 y 1440 px; expansión, filtros, borradores, archivo seleccionado, galería, foco de validación, payloads, cálculos, guardado, vacío, error y notificaciones.
- Regresión pública: 27 comprobaciones aprobadas de menú/cuenta, incluyendo Escape, retorno de foco, gestos, pantalla baja y movimiento reducido.

Los recorridos administrativos utilizaron componentes reales con servicios ficticios aislados bajo `.taste-skill`, carpeta ignorada por Git. No se alteró la autenticación de producción ni se registraron existencias o ventas reales. Las capturas identifican expresamente los datos ficticios. Las pruebas se realizaron en Chromium con emulación móvil; no sustituyen una prueba en teléfono físico o Safari ni verifican un guardado contra el backend real.

Evidencia local: `.taste-skill/admin/checks.json`, `.taste-skill/navigation-checks.json`, capturas y reportes en `.taste-skill/admin/`.
