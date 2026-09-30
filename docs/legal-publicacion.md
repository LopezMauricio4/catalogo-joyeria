# Preparación legal del catálogo

Revisión funcional del 30 de septiembre de 2026. Implementación de avisos; no certifica cumplimiento legal integral.

## Antes de publicar

- Los responsables, sus cédulas, el correo y el teléfono fueron suministrados por el negocio y se incorporaron en src/data/legal.js. Se utiliza la dirección facilitada (barrio y ciudad); antes de publicar conviene completar nomenclatura o indicaciones suficientes para recibir notificaciones. No se ha inventado un NIT a partir de las cédulas.
- Revisar la política con el responsable del negocio o asesor jurídico, incluyendo conservación, proveedores y tratamiento fuera de Colombia. La inclusión de proveedores en un aviso no sustituye acuerdos ni garantías de transmisión/transferencia.
- Revisar las fichas ya publicadas: composición real (incluido metal base si es laminado), medidas, tallas y precio final con impuestos aplicables. El cambio no modifica automáticamente los precios ni inventa medidas.
- Confirmar por WhatsApp los cargos de envío, total a pagar, entrega y condiciones aplicables antes de aceptar el pedido. La ausencia de pasarela no elimina deberes de información y protección del consumidor.
- Obtener y conservar autorización antes de registrar nombre y teléfono de clientes de ventas presenciales o por WhatsApp. La casilla de registro web no cubre automáticamente a esos clientes ni autoriza publicidad.

## Registro web

Casilla no preseleccionada, enlace público a política, validación en formulario y servicio `signUp`. Supabase recibe versión, texto, aceptación y fecha del navegador en `user_metadata.privacy_consent`.

Este dato acompaña la cuenta, pero **no es un registro inmutable**: `user_metadata` es editable por el usuario y la fecha proviene del cliente. Antes de considerar la autorización plenamente auditada, conservar evidencia en un registro de servidor con fecha propia, acceso restringido y retención definida (por ejemplo, mediante hook de autenticación). No se añadió un trigger al esquema administrado de Supabase ni se atribuyó consentimiento retroactivo a las cuentas existentes.

## Fuentes oficiales consultadas

- Ley 1480 de 2011, artículos 23, 26 y 50: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306
- Ley 1581 de 2012, autorización, derechos, consultas y reclamos: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981
- SIC, autorización previa, expresa e informada: https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/para-el-adecuado-tratamiento-de-los-datos-es-indispensable-la-autorizacion-expresa-previa-e-informada

El footer enlaza a la SIC como autoridad, sin afirmar afiliación ni aval de la tienda.

