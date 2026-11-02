# Menús de navegación y cuenta

Se unificaron con el estándar táctil del catálogo: controles de al menos 48 × 48 px, feedback desde pointerdown, áreas seguras, movimiento reducido y foco de diálogo nativo.

## Cambios

- Menú hamburguesa a pantalla completa hasta 1023 px, con navegación desplazable y acciones de cuenta separadas en la base.
- Se conserva el catálogo desplegable por material y categoría, con texto mayor y controles independientes para navegar o desplegar.
- El menú se cierra con Escape, con su botón o arrastrando el tirador hacia abajo. Al pasar a escritorio se cierra automáticamente y libera el scroll del documento.
- La cuenta se abre como hoja inferior en móvil y diálogo centrado en tablet/escritorio. No se cierra por desplazar el contenido.
- «Iniciar sesión» y «Crear cuenta» son acciones distintas, amplias y con rutas explícitas.
- La cuenta autenticada conserva nombre, correo y cierre de sesión; para administradores ofrece productos, inventario y ventas. El correo y nombres largos pueden ajustarse en varias líneas.
- Se sustituyeron la trampa de foco manual, el backdrop personalizado y los cierres globales por scroll por el mismo diálogo nativo y resorte utilizado en los filtros.
- El componente de hoja inferior ahora admite título, etiqueta de cierre, clase, breakpoint y un destino alternativo de retorno del foco.
- El modo de AuthPage se deriva de la URL, para que cambiar desde `/auth` a `/auth?mode=register` muestre efectivamente el formulario de registro y viceversa.

## Archivos

- `src/components/Navbar.jsx`: cabecera, estados mutuamente excluyentes y composición de menús.
- `src/components/AccountMenu.jsx`: acciones de invitado, cuenta y administración.
- `src/components/BottomSheet.jsx`: infraestructura compartida de diálogo y gestos.
- `src/hooks/usePressFeedback.js`: soporte reutilizable para botones y enlaces.
- `src/styles/navigation.css`: presentación y estados de navegación.
- `src/pages/AuthPage.jsx`: sincronización del formulario con la URL.

## Validación

Compilación de producción, ESLint y las 25 pruebas existentes aprobadas.

27 comprobaciones de navegador de navegación aprobadas: menú completo y objetivos táctiles a 320, 390 y 768 px; cuenta en esos tamaños y a 1440 px; submenús; enlaces de colección; formularios de acceso y registro; Escape; recuperación del foco; Tab; arrastre táctil de cierre; cambio a escritorio; pantalla baja de 390 × 420; movimiento reducido y ausencia de excepciones JavaScript.

Las capturas finales se revisaron visualmente. El detector de Impeccable no encontró patrones problemáticos en Navbar, AccountMenu, BottomSheet y el CSS de navegación.

La prueba usa Chromium y eventos táctiles sintetizados. No se introdujeron credenciales ni se crearon cuentas; no se verificaron en esta sesión operaciones reales de inicio/cierre de sesión o acciones administrativas. Falta una comprobación en teléfono físico, especialmente de Safari y áreas seguras.

Evidencia local: `.taste-skill/navigation-checks.json`, `.taste-skill/navigation-detect.json` y capturas `navigation-*.jpg` / `account-*.jpg`.
