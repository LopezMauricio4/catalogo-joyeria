# Diagnóstico de diseño de Alpez

Fecha: 2 de noviembre de 2026.

Evaluación realizada con taste-skill para dirección visual y lectura de capturas, e Impeccable para auditoría técnica y refinamiento. Impeccable quedó instalada globalmente en Codex. Alcance: inicio, catálogo y componentes públicos compartidos. Es una mejora sobre la identidad existente, sin sustituir el sistema por un nuevo concepto de marca.

## Diagnóstico

Alpez tiene una base reconocible: verde bosque, serif Cormorant Garamond, oro como acento y fotografías propias. La sensación de plantilla provenía principalmente de etiquetas pequeñas repetidas, tratamientos decorativos y falta de consistencia entre componentes. Cambiar toda la paleta habría desaprovechado esa base.

| Prioridad | Problema encontrado | Consecuencia | Corrección aplicada |
| --- | --- | --- | --- |
| P1 | Texto del pie de página con contraste de aproximadamente 2,4:1 | Datos de contacto y responsables difíciles de leer | Color explícito de texto claro, sin heredar el gris de los párrafos globales |
| P1 | Secciones enteras inicialmente transparentes, dependientes de IntersectionObserver | El contenido podía permanecer invisible si fallaba la observación | Contenido visible por defecto; animaciones progresivas sobre sus elementos |
| P2 | Título del catálogo disponible solo para lectores de pantalla | Faltaba una referencia visual clara al entrar | H1 visible «Catálogo de joyas» |
| P2 | Cabecera oculta por scroll con controles que podían recibir el foco | Navegación por teclado fuera de pantalla | La cabecera reaparece al recibir foco y no se oculta mientras lo contiene |
| P2 | Paneles cerrados seguían teniendo geometría en el documento | Complicaba inspección, estados y navegación | Estado hidden real en menú móvil y cuenta, manteniendo inert y aria-hidden |
| P2 | Textos de 9–13 px y demasiadas etiquetas en mayúsculas | Lectura fatigosa y jerarquía fragmentada | Texto principal de 16 px; metadatos de 13 px; acciones de 14 px en las superficies intervenidas |
| P2 | Fotografías de colecciones enmascaradas con degradados detrás del texto | Se perdía detalle del producto y claridad de composición | Fotografía sin máscara, texto separado y apilamiento en móvil |
| P2 | Perfiles sociales con columna de texto demasiado estrecha en tablet | Párrafos y nombres excesivamente quebrados | Reparto de columnas y separaciones específicos para tablet |
| P2 | Categorías sin productos conservaban una sección vacía | Recorrido sin contenido útil | La sección aparece únicamente cuando hay categorías con piezas |
| P2 | Estado vacío mencionaba el backend y se confundía con un error | Mensaje técnico ajeno a la compra | Mensaje orientado a asesoría; los errores mantienen el aviso y reintento existentes |
| P3 | Sombras, transparencias, divisores e iconos repetidos | Ruido visual y aspecto de plantilla | Superficies planas, navegación opaca y servicios presentados como una lista |
| P3 | Bordes y etiquetas de material precedían al nombre de la pieza | La interfaz competía con las fotografías | Tarjetas abiertas, nombre primero, material y precio debajo |

## Dirección visual

Referencia de taste-skill: **The specimen catalogue**, semilla **392451762**, con paleta y tipografías conservadas. Se tomó el principio de presentar cada pieza con una fotografía limpia y su información fuera de la imagen. No se reconstruyeron todas las secciones a partir de los blueprints: el alcance fue refinar la tienda existente y mantener sus recorridos.

Idea aplicada: la bandeja de balines de la fotografía de Alpez abre el catálogo; las piezas reales continúan esa presentación con nombres, materiales y precios claros. La acción interactiva principal es explorar esas piezas por material y reunirlas en el carrito para solicitar asesoría.

Se mantuvieron los archivos propios `inicio-alpez.webp`, `material-oro-18k.webp`, `material-laminado-v2.webp` y las imágenes de productos devueltas por la API. No se incorporaron imágenes externas, ilustraciones sustitutivas, testimonios ni datos comerciales inventados. Los perfiles sociales y sus créditos existentes se conservaron.

## Comparación verificable

| Medición | Antes | Después |
| --- | --- | --- |
| Texto principal medido por taste-skill | 14 px | 16 px, interlineado 1,65 |
| H1 en escritorio a 1440 px | 69,1 px | 76,3 px |
| Líneas del H1 a 1440, 768 y 390 px | 2 | 2 |
| Contraste de párrafos del pie sobre verde | ≈2,4:1 | ≈14,7:1 |
| Título visible del catálogo | No | Sí |
| Contenido de Reveal visible sin animación | No garantizado | Sí |
| Desbordamiento de inicio y catálogo | No se midieron todos los anchos inicialmente | Ninguno a 320, 390, 768, 1024 y 1440 px |

Las primeras capturas se tomaron mientras la API local no era accesible desde el navegador de verificación. Documentan el estado de error original y los componentes estáticos; no sirven para comparar densidad de productos ni rendimiento con el estado final. Al iniciar la API accesible, la comprobación final utilizó **46 productos reales**. No se sustituyó la API por datos simulados.

## Validación

- `npm run build`: aprobado. La compilación señala un chunk JavaScript de unos 591 kB antes de gzip.
- `npm run lint`: aprobado.
- `npm test`: 25 pruebas aprobadas.
- Navegador Chromium mediante el cliente CDP incluido en taste-skill: inicio y catálogo a 320, 390, 768, 1024 y 1440 px; sin desbordamiento horizontal en esos escenarios.
- API de productos: HTTP 200, 46 piezas. Filtro «Oro 18k»: 21 piezas, todas con el material seleccionado.
- Diálogo nativo de filtros: apertura y cierre con Escape.
- Pieza real → agregar al carrito → selección conservada en carrito. Se utilizó un perfil temporal; no se envió ningún pedido.
- Menú móvil: apertura, cierre con Escape y restauración del foco al botón.
- Cabecera: permanece accesible al recuperar el foco después de desplazarse.
- Movimiento reducido: contenido visible y entrada de la portada sin animación.
- Sin excepciones JavaScript registradas en el recorrido probado.
- Capturas de producción revisadas: pliegue y página completa en escritorio, tablet y móvil, más capturas de inicio y catálogo a 320 y 1024 px.

La comprobación responsiva usa viewports emulados de Chromium. No certifica compatibilidad con todos los navegadores, lectores de pantalla, dispositivos físicos ni todos los gestos táctiles. No se ejercitaron operaciones administrativas autenticadas.

### Interpretación de las herramientas

La inspección final de taste-skill termina con **0 FAIL y 3 WARN**, con excepciones declaradas para `emoji`, `eyebrow` e `icon-cards`:

- `emoji`: los símbolos pertenecen a los nombres reales «Topos Clover 🍀» y «Combo Anillo ➕ Manilla». Se preservaron los datos del catálogo.
- `eyebrow`: la geometría móvil confundía «Ver colección» y enlaces al final de un bloque con etiquetas del encabezado siguiente. Las etiquetas decorativas reales se eliminaron.
- `icon-cards`: la heurística identificaba flechas de enlaces al final de los servicios como iconos superiores de tarjetas. Los servicios se presentan como filas sin icono superior, borde ni fondo de tarjeta.

No se desactivaron reglas de contraste, visibilidad, tamaño de texto o desbordamiento. Los tres avisos restantes corresponden al fondo cálido de la marca, la variedad de tamaños heredados y la falta de vídeo nativo en la página. Se conservaron los reproductores externos con sus alternativas; no se añadió vídeo de stock ni autoplay para satisfacer una métrica.

El detector mecánico de Impeccable produjo dos avisos: uso de Inter y un borde lateral en `.product-editor-note`. Inter se conserva como tipografía de interfaz existente; Cormorant conserva la voz visual de la marca. El borde pertenece al editor administrativo, fuera de esta intervención. Estos avisos no equivalen a fallos funcionales.

### Juicio visual final

ROUND final

- Seen in one second: fotografía de los balines y titular de la tienda.
- Idea: presentar el material y las piezas reales de Alpez con menos interferencia de interfaz.
- Live thing: catálogo por material y selección en carrito.
- Layout words by section: hero=split / colecciones=fotografía y texto / favoritas=catálogo / categorías=galería / servicios=lista / social=perfiles / footer=información.
- Scores: design 7 · usability 8 · creativity 6 · content 7 → overall **7,1/10**.
- Caps applied: creatividad limitada por conservar una composición conocida; no se afirma una identidad visual exclusiva ni una puntuación de premio.
- Top three remaining opportunities: unificar iluminación y encuadre de las fotos de productos; crear un argumento de marca más específico con información suministrada por Alpez; reducir el coste del JavaScript inicial y la dependencia de embeds sociales.

La escala es un juicio editorial, no una medición automática.

## Trabajo posterior recomendado

1. **Fotografía:** preparar una serie consistente de producto: fondo, iluminación, escala y ángulo. Las fotos propias aportan credibilidad, pero sus diferencias de encuadre siguen siendo visibles.
2. **Rendimiento:** dividir las pantallas administrativas del JavaScript público y evaluar carga bajo demanda de los embeds. El bundle sigue siendo grande; esta intervención no hizo una migración de arquitectura.
3. **CSS:** continuar consolidando los estilos antiguos por superficie. Se retiraron tratamientos y reglas obsoletos de inicio, pero la hoja global aún contiene convenciones históricas del catálogo, fichas y administración.
4. **Móvil estrecho:** el botón flotante de WhatsApp heredado puede superponerse a texto en determinados puntos del scroll, visible en la captura de 320 px. Conviene definir su ubicación junto con el resto de acciones móviles.
5. **Contexto durable:** usar `$impeccable init` para registrar público, propuesta de valor y criterios de marca en PRODUCT.md; el proyecto todavía no contiene ese documento ni DESIGN.md.

## Archivos y evidencia

El código mejorado está aplicado en `src/pages/Home.jsx`, `src/pages/Catalog.jsx`, `src/App.jsx`, `src/index.css` y los componentes compartidos de navegación, pie, tarjetas, perfiles sociales y Reveal.

Las capturas y resultados locales están en `.taste-skill/before/`, `.taste-skill/after/`, `.taste-skill/verification.json` y `.taste-skill/impeccable-detect.json`. Esa carpeta se excluyó de Git para no incorporar automáticamente capturas y datos del catálogo al repositorio. Este diagnóstico sí queda como documentación del proyecto.
