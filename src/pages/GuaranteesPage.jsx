import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import WhatsAppAdvisorButton from "../components/WhatsAppAdvisorButton";

// The two materials are set side by side with the same rows, so a customer can compare
// what each guarantee covers at a glance.
const materials = [
  {
    key: "oro-18k",
    title: "Oro 18k (Ley 750)",
    summary: "Garantía de por vida",
    intro: "Las piezas elaboradas en oro de 18K son una inversión para toda la vida debido a la pureza y nobleza del metal.",
    rows: [
      ["Cobertura", "Garantía de por vida sobre la autenticidad y calidad del material, incluyendo la pureza del oro."],
      ["No cubre", "Golpes, abolladuras, fracturas, mal uso, exposición a químicos abrasivos industriales, pérdida o hurto de la pieza."],
    ],
  },
  {
    key: "laminado",
    title: "Oro laminado 18k",
    summary: "Garantía de 1 año",
    intro: "Nuestras piezas de oro laminado están diseñadas con altos estándares de durabilidad para acompañarte en tu día a día.",
    rows: [
      ["Cobertura", "Un año de garantía por cambios en la tonalidad o pérdida de color del material."],
      ["Resistencia", "Resiste el contacto con lociones, cremas y agua de piscina, para que puedas usarla con confianza en tus actividades cotidianas."],
    ],
  },
];

const care = [
  ["Evita rayarlas", "no las guardes junto a otras joyas ni las uses para trabajos pesados de fricción."],
  ["Uso consciente", "aunque son muy duraderas, dales periodos de descanso y mantenimiento."],
  ["Limpieza periódica", "lávalas ocasionalmente con agua y jabón suave y sécalas muy bien con un paño limpio."],
];

const GuaranteesPage = () => (
  <div className="guarantees-page shop-shell">
    <Link to="/" className="product-back">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver al inicio
    </Link>

    <header className="guarantees-header">
      <h1>Garantías y cambios</h1>
      <p>
        En Alpez Joyería nos comprometemos con la calidad de cada una de nuestras piezas. Así funcionan nuestras
        garantías según el material de tu joya.
      </p>
    </header>

    <section className="guarantees-materials" aria-label="Garantía por material">
      {materials.map(material => (
        <article key={material.key} className="guarantees-material" data-material={material.key}>
          <h2>{material.title}</h2>
          <p className="guarantees-summary">{material.summary}</p>
          <p>{material.intro}</p>
          <dl>
            {material.rows.map(([term, text]) => <div key={term}><dt>{term}</dt><dd>{text}</dd></div>)}
          </dl>
        </article>
      ))}
    </section>

    <section className="guarantees-section" aria-labelledby="guarantees-care">
      <h2 id="guarantees-care">Cuidados del oro laminado</h2>
      <ul>
        {care.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}
      </ul>
    </section>

    <section className="guarantees-section" aria-labelledby="guarantees-claims">
      <h2 id="guarantees-claims">Cambios y validación</h2>
      <p>
        Para solicitar una garantía o cambio, contáctanos con el número de pedido, comprobante u otro medio que permita acreditar la compra.
        El producto será evaluado por nuestro equipo para verificar que cumple con las condiciones descritas.
      </p>
      <p>
        Estas condiciones no limitan la garantía legal ni los derechos de retracto o reversión del pago cuando sean aplicables según la
        legislación colombiana. Antes de confirmar una compra por WhatsApp se informarán las condiciones de entrega y los derechos aplicables al pedido.
      </p>
      <WhatsAppAdvisorButton message="Hola, Alpez. Quiero solicitar una garantía o un cambio." className="shop-button">
        Solicitar garantía o cambio
      </WhatsAppAdvisorButton>
    </section>
  </div>
);

export default GuaranteesPage;
