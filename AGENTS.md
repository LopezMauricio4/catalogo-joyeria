# Directrices del panel de administración de Alpez

## Alcance y prioridad

Estas instrucciones configuran el trabajo futuro de diseño y UX del panel administrativo. Se aplican a productos, inventario, ventas, sus formularios y componentes compartidos cuando se utilicen en administración. No ordenan modificar componentes por sí solas. Las instrucciones expresas del usuario tienen prioridad.

Conservar React, React Router y Tailwind/CSS existentes, así como la identidad de Alpez. Mantener rutas, permisos, autenticación, datos, reglas de inventario, cálculos de costos y ventas, carga de imágenes y contratos de API. Si se modifica un componente compartido, comprobar también su uso en la tienda pública.

## Habilidades instaladas y modo de uso

- **taste-skill:** instalada globalmente. Su nombre declarado es `design-taste-frontend`; «diseno-gusto-frontend» es la referencia en español del usuario, no otro paquete ni un dial técnico. Leer su `SKILL.md` y `references/app-screens.md` antes de implementar cambios administrativos. Aplicar el modo de pantallas de trabajo/app, no el de landing pages.
- **impeccable:** instalada. Utilizar sus directrices de refinamiento, densidad, accesibilidad y verificación cuando correspondan al cambio.
- **apple-design:** instalada. Aplicar sus reglas de manipulación directa, captura de puntero, continuidad e interrupción de gestos.
- **mobile-native:** instalada. Aplicar sus reglas de viewport, teclado, áreas seguras, scroll y controles táctiles.
- **emil-design-eng:** instalada. Usar como apoyo para formularios, componentes y feedback de interacción.

Las habilidades globales están bajo `$CODEX_HOME/skills` o, por defecto en este entorno, `%USERPROFILE%\.codex\skills`. `taste-skill` es el nombre de su carpeta.

Los nombres `data-density-optimization`, `form-ux-efficiency`, `mobile-navigation-patterns` y `touch-target-optimization` se registran abajo como **directrices locales solicitadas por el usuario**. No se ha verificado ni instalado un paquete externo independiente con esos nombres. No afirmar lo contrario ni ejecutar instaladores de procedencia supuesta. Si posteriormente se proporciona una fuente concreta, verificarla antes de instalarla.

## taste-skill: estética de herramienta administrativa

- Priorizar claridad, lectura rápida y ejecución de tareas sobre decoración. Cada pantalla debe tener una tarea principal identificable y una acción accesible desde su primer bloque.
- Conservar la paleta de Alpez mediante los tokens existentes; usar el acento con moderación y dar significado consistente a los colores de estado.
- Usar superficies planas, separaciones coherentes, alineación de columnas y jerarquía tipográfica contenida. Evitar tarjetas anidadas, degradados decorativos, glows, etiquetas repetitivas en mayúsculas y grandes cabeceras de marketing.
- En administración, los bordes discretos de tablas, campos y paneles son válidos. La compacidad no debe depender de texto diminuto ni de controles difíciles de tocar.
- Importes y cantidades alineados y con cifras tabulares, unidades y formato apropiados a Colombia. Mostrar cero como cero; distinguir valores ausentes de valores nulos o pendientes.
- Microinteracciones rápidas y funcionales: feedback desde pointerdown/estado active, aproximadamente 100–160 ms en controles. Evitar entradas animadas repetidas en listas de trabajo.
- Respetar `prefers-reduced-motion`, manteniendo feedback de estado sin desplazamiento o escala. Nunca mantener datos invisibles a la espera de una animación.

## data-density-optimization: inventario compacto y colapsable

- Mostrar primero identidad de la pieza o insumo, miniatura cuando exista, existencias con unidad y estado. Añadir el precio o costo en la vista resumida cuando sea necesario para la tarea.
- Presentar material, medidas, composición, costos adicionales e historial mediante detalles expandibles cuando sean secundarios. No ocultar alertas ni datos necesarios para decidir.
- Usar filas/tarjetas compactas con bordes y espaciados compartidos; evitar repetir grandes bloques de información y acciones en cada tarjeta.
- La expansión debe tener un control explícito con `aria-expanded` y `aria-controls`, o usar `details/summary` cuando encaje. Evitar controles interactivos anidados dentro de un botón que envuelve toda la tarjeta.
- Mantener filtros, selección y posición de desplazamiento cuando se abren y cierran detalles. Preservar el contexto al editar una pieza.
- En escritorio, aprovechar tablas o rejillas cuando faciliten comparar. En móvil, utilizar filas o tarjetas resumidas y detalles bajo demanda; nunca provocar scroll horizontal de toda la página.
- Derivar totales y estados de los datos reales. No inventar indicadores, porcentajes ni datos de muestra presentados como reales.

## form-ux-efficiency: formularios de administración

- Agrupar por tarea con títulos, labels persistentes y campos relacionados próximos. Distinguir datos obligatorios y opcionales.
- Usar divulgación progresiva para opciones poco frecuentes. Dividir formularios realmente complejos en secciones o pasos lógicos; no convertir tareas breves, como registrar un movimiento, en un asistente innecesario.
- Conservar borradores al alternar secciones o pasos. Diferenciar cancelar, restablecer y guardar; no descartar cambios silenciosamente por un gesto o cierre accidental.
- Mantener una acción principal clara. Si hay una base fija de acciones, asegurar que no cubra campos, mensajes, controles o el teclado.
- Mostrar validación específica junto al campo, asociada con `aria-describedby` y `aria-invalid`; enfocar el primer error al enviar y preservar la información escrita.
- Usar `inputMode`, tipo de campo y autocomplete adecuados; inputs de al menos 16 px en móvil. No desactivar zoom.
- Prevenir envíos duplicados y mostrar estado de guardado, éxito y error recuperable. Mantener las validaciones del servidor y las restricciones de existencias, cantidades y precios.

## mobile-navigation-patterns: navegación administrativa

- Mantener localizable la sección actual: productos, inventario o ventas, con etiquetas claras y estado activo accesible.
- Adaptar la navegación al espacio: menú de pantalla completa o barra inferior con 3–5 destinos principales cuando corresponda. No añadir patrones duplicados que compitan entre sí.
- Reutilizar los componentes de diálogo/hoja inferior ya disponibles cuando sean adecuados. Mantener el scroll interior independiente del fondo.
- Los diálogos deben gestionar el foco, Escape, bloqueo del fondo y retorno al control de apertura. Todo gesto tendrá una alternativa visible por botón o teclado.
- Para arrastres, usar Pointer Events y captura de puntero, separar el tirador del contenido desplazable y manejar pointercancel, pérdida de captura y blur. No implementar scroll horizontal nativo mediante un drag de JavaScript innecesario.
- Considerar `dvh`/`svh`, `visualViewport` cuando sea necesario, áreas seguras y teclado. Las acciones importantes deben seguir siendo alcanzables en pantallas bajas.

## touch-target-optimization: controles de al menos 48 × 48 px

- Exigir un área interactiva mínima de **48 × 48 CSS px** en botones, iconos de acción, enlaces de navegación, toggles, selectores y controles de expansión administrativos. El icono visible puede ser menor que su área de contacto.
- Mantener al menos 8 px de separación entre controles adyacentes independientes, especialmente editar, eliminar, guardar y cancelar.
- Evitar acciones destructivas pegadas a las más frecuentes; identificarlas por texto o nombre accesible y mantener el flujo de confirmación que corresponda.
- No depender de hover: aplicar feedback al presionar y foco visible. Limpiar estados de presión al soltar, cancelar un gesto o perder el foco.
- No reducir áreas táctiles para aumentar densidad. Ganar espacio mediante resumen de contenido, divulgación progresiva y eliminación de repetición.

## Verificación al implementar

Probar el recorrido administrativo afectado con datos reales autorizados o fixtures claramente identificados, incluyendo carga, vacío, errores, guardado y contenido largo. No ejecutar escrituras reales de inventario o ventas únicamente para tomar capturas.

Comprobar móvil de 320/390 px, tablet y escritorio; ausencia de desbordamiento; objetivos táctiles; teclado/foco; formularios con errores y movimiento reducido. Ejercitar gestos mediante eventos táctiles cuando sea posible y distinguir esa emulación de una prueba en teléfono físico.

Ejecutar compilación, lint y pruebas pertinentes. Para la inspección de taste-skill del panel, usar el modo `--app`. Informar lo verificado y las limitaciones sin declarar una certificación de accesibilidad ni afirmar pruebas no realizadas.
