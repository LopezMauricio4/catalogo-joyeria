import { Link } from 'react-router-dom';
import { business, PRIVACY_PATH, SIC_URL } from '../data/legal';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

export default function TermsPage() {
  return <main className="legal-page shop-shell">
    <Link to="/" className="product-back">Volver al inicio</Link>
    <h1>Términos y Condiciones</h1>
    <p>Joyería Alpez · Versión del 30 de septiembre de 2026</p>
    <section><h2>Identificación y atención</h2>
      <ul>{business.responsiblePeople.map(person => <li key={person.identification}>{person.name} · {person.identification}</li>)}</ul>
      <p>Dirección de notificaciones: {business.address}.</p>
      <p>Contacto: <a href={`mailto:${business.email}`}>{business.email}</a> · <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">WhatsApp {business.phone}</a>.</p>
    </section>
    <section><h2>Catálogo y pedidos</h2><p>Este sitio permite consultar joyas y reunir una selección en el carrito. No procesa pagos en línea. El registro de cuenta es opcional. Agregar un producto al carrito o abrir WhatsApp no realiza el pago ni reserva existencias.</p><p>La compra se coordina por WhatsApp. Antes de confirmar el pedido, se informan los artículos, cantidades, medidas o tallas, precio total, gastos de envío, forma de pago y plazo de entrega para que el cliente pueda revisarlos y aceptar la compra.</p></section>
    <section><h2>Información y precios</h2><p>Los precios se expresan en pesos colombianos (COP) e incluyen los impuestos aplicables a las piezas. El envío, cuando corresponda, se informa por separado antes de confirmar la compra. La composición, medidas y características se describen en cada ficha; si falta una medida o tienes dudas sobre un material, solicítala antes de confirmar tu pedido.</p><p>El oro de 18k y el oro laminado de 18k son materiales distintos. La denominación de oro laminado no significa que toda la pieza sea de oro macizo. Revisa la composición específica informada para cada producto.</p></section>
    <section><h2>Entrega y soporte del pedido</h2><p>El destino, costo y plazo de entrega se acuerdan antes de cerrar la compra. Conserva la confirmación del pedido y los mensajes de atención para consultar su estado o solicitar soporte. Los responsables atenderán las novedades de entrega por los canales indicados.</p></section>
    <section><h2>Garantía y derechos del consumidor</h2><p>Consulta las <Link to="/garantias-y-cambios">condiciones de garantía y cambios</Link>. Estas condiciones no excluyen ni limitan la garantía legal ni otros derechos irrenunciables del consumidor.</p><p>En las ventas a distancia, cuando proceda legalmente, el retracto puede ejercerse dentro de los cinco días hábiles siguientes a la entrega del bien. Su procedencia, excepciones y devolución se rigen por la ley colombiana; por ejemplo, existe una excepción para bienes confeccionados conforme a especificaciones del consumidor o claramente personalizados. La reversión del pago, cuando resulte aplicable por el medio de pago y las circunstancias, se tramita conforme a la normativa vigente. Comunícate por nuestros canales para presentar tu solicitud.</p></section>
    <section><h2>Datos personales y reclamaciones</h2><p>El tratamiento de datos se describe en la <Link to={PRIVACY_PATH}>Política de Tratamiento de Datos Personales</Link>. Para consultas, peticiones o reclamos, escribe a <a href={`mailto:${business.email}`}>{business.email}</a> o al WhatsApp indicado, identificando el pedido y tu solicitud.</p><p>Puedes consultar a la <a href={SIC_URL} target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio — SIC</a>, autoridad de protección al consumidor en Colombia.</p></section>
  </main>;
}
