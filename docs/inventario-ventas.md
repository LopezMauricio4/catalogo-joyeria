# Inventario, catálogo y ventas

## Operación

1. En Inventario registra insumos, unidades, existencias, costo unitario y precio de venta suelta.
2. En Productos asigna los insumos y la cantidad necesaria para **una** pieza. También puedes representar una pieza terminada mediante un artículo de inventario y una cantidad de 1.
3. El catálogo calcula cuántas piezas pueden elaborarse usando el material limitante. No reserva materiales al publicar, agregar al carrito ni abrir WhatsApp. Un insumo inactivo no aporta disponibilidad.
4. Productos antiguos sin materiales aparecen agotados hasta configurar su composición; su antiguo campo `stock` no se usa como disponibilidad. No se asignaron materiales por inferencia.
5. En Ventas, el administrador registra cliente, teléfono, fecha/hora, productos o insumos sueltos, cantidades, precios cobrados y nota opcional. Puede combinar ambos tipos en una venta. Los artículos ajenos al catálogo deben existir en inventario para descontar sus existencias.
6. El servidor registra el UUID y el nombre de la sesión del responsable. Conserva también la hora de registro, separada de la fecha de la venta.
7. Los materiales compartidos se suman antes de descontarlos. Si falta material, no se guarda ninguna parte de la venta. El catálogo se refresca al entrar, recuperar el foco y cada 30 segundos mientras está visible.

## Integridad y permisos

- Tablas internas `InventoryItem`, `InventoryMovement`, `ProductComponent`, `Sale` y `SaleLine`: RLS activado y permisos revocados a `anon` y `authenticated`. El acceso pasa por el backend con Supabase Auth y rol `app_metadata.role=admin`.
- La respuesta pública del catálogo excluye composición, costos, clientes y ventas.
- Las operaciones de stock usan transacciones Serializable con reintentos limitados. Stock y movimientos se guardan juntos. La edición de la ficha del insumo no modifica el saldo; usa entradas y salidas.
- Las ventas usan una clave de idempotencia y un hash de sus datos y responsable. Reintentar la misma solicitud no vuelve a descontar. Reutilizar la clave con datos diferentes produce 409.
- Ventas no se editan ni eliminan desde la API. Una futura anulación debe añadir estado, movimiento inverso e historial; nunca borrar el registro original.
- Hay controles de stock no negativo en la base. El cliente muestra una estimación; el servidor vuelve a comprobar existencias al guardar.

## Base para finanzas

`Sale` conserva moneda COP, total, costo total y fecha efectiva. `SaleLine` conserva nombre, SKU, unidad, cantidades, precio y costo históricos. Los importes monetarios se guardan como Decimal con dos decimales; cantidades y costos unitarios derivados pueden usar seis. Se redondea por línea y se suman los totales de líneas.

El costo corresponde al costo unitario vigente del insumo al registrar la venta, no a FIFO ni promedio ponderado. Las ventas retroactivas descuentan existencias actuales y usan el costo vigente al registrarlas. El registro no acredita un pago ni calcula utilidad neta: aún no incluye gastos, impuestos, pagos parciales, descuentos explícitos, mano de obra ni devoluciones vinculadas. Finanzas debe incorporar esas entidades sin recalcular los precios históricos.

## Organización y despliegue

- `modules/products/availability.ts`: cálculo de disponibilidad y presentación pública/administrativa.
- `modules/inventory`: fichas y movimientos de insumos.
- `modules/sales`: validación, registro e historial paginado de ventas.
- `lib/transactions.ts`: política común para operaciones concurrentes.
- `SalesPage`, `ProductMaterials` y `AdminNavigation`: interfaces de administración.

En una base nueva aplica `npm exec -- prisma migrate deploy` desde `backend` antes de desplegar el código. Regenera Prisma con `npm exec -- prisma generate`. Las migraciones de este cambio ya fueron aplicadas a la base configurada durante el desarrollo.

Verificación: `npm run lint`, `npm run build:vercel`, `npm --prefix backend test`. Para pruebas reales, establece `RUN_DATABASE_TESTS=1`: los casos transaccionales revierten sus datos y el caso de concurrencia elimina exclusivamente sus propios registros temporales al finalizar.

### Ventas por total cobrado
El formulario registra insumos del inventario y un único importe total. La ganancia bruta es total cobrado menos costo histórico de los insumos (sin otros gastos). El servidor captura los costos y descuenta las cantidades en la misma transacción. Para conservar subtotales contables, distribuye el importe entre las líneas proporcionalmente a sus precios de venta de inventario; si todos valen cero, reparte por línea. El redondeo acumulado mantiene la suma exacta; el precio unitario asignado puede diferir por centavos del subtotal dividido entre cantidad. El historial presenta costos por artículo y el ingreso y ganancia de la venta completa. Las solicitudes anteriores con precio por línea siguen siendo compatibles.

### Catálogo independiente (30 de septiembre de 2026)
La creación y edición de productos ya no requieren insumos ni consultan inventario. El catálogo no expone stock, estados de disponibilidad ni componentes; el carrito no usa existencias para limitar pedidos. Las relaciones antiguas se conservan en la base por compatibilidad, sin intervenir en el catálogo. Ventas continúa descontando únicamente los artículos seleccionados en su formulario y conserva sus costos históricos.
