import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const GuaranteesPage = () => (
  <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
    <Link to="/" className="product-back text-ink-muted transition hover:text-ink-soft">
      <ArrowLeft className="h-4 w-4" />
      Volver al inicio
    </Link>

    <header className="mb-12 max-w-3xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest-800">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <p className="luxury-eyebrow">Atención y respaldo</p>
      <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] text-ink md:text-6xl">
        Políticas de garantía y cambios
      </h1>
      <p className="mt-6 text-base leading-8 text-ink-muted">
        En Alpez Joyería nos comprometemos con la calidad de cada una de nuestras piezas. Queremos que brilles
        con total tranquilidad, por eso te explicamos cómo funcionan nuestras garantías según el tipo de material.
      </p>
    </header>

    <div className="grid gap-6">
      <section className="rounded-card-lg border border-gold-200 bg-[#fffaf0] p-6 md:p-8">
        <p className="luxury-eyebrow text-gold-700">01 · Oro de 18K (Ley 750)</p>
        <h2 className="mt-3 text-3xl font-light text-ink">Una inversión para toda la vida</h2>
        <p className="mt-4 text-sm leading-7 text-ink-muted">
          Las piezas elaboradas en oro de 18K son una inversión para toda la vida debido a la pureza y nobleza del metal.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gold-200 bg-white/70 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">Cobertura</h3>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Garantía de por vida sobre la autenticidad y calidad del material, incluyendo la pureza del oro.
            </p>
          </div>
          <div className="rounded-xl border border-gold-200 bg-white/70 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">No cubre</h3>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Golpes, abolladuras, fracturas, mal uso, exposición a químicos abrasivos industriales, pérdida o hurto de la pieza.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-card-lg border border-sand-strong bg-[#fff8f1] p-6 md:p-8">
        <p className="luxury-eyebrow text-[#8a5d3b]">02 · Oro laminado de 18K</p>
        <h2 className="mt-3 text-3xl font-light text-ink">Durabilidad para todos los días</h2>
        <p className="mt-4 text-sm leading-7 text-ink-muted">
          Nuestras piezas de oro laminado están diseñadas con altos estándares de durabilidad para acompañarte en tu día a día.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-sand-strong bg-white/70 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">Cobertura</h3>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Un año de garantía por cambios en la tonalidad o pérdida de color del material.
            </p>
          </div>
          <div className="rounded-xl border border-sand-strong bg-white/70 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">Resistencia</h3>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Resiste el contacto con lociones, cremas y agua de piscina, para que puedas usarla con confianza en tus actividades cotidianas.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-sand-strong bg-white/70 p-5 md:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">Cuidados recomendados</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-ink-muted">
            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#8a5d3b]" /><span><strong className="text-ink">Evita rayarlas:</strong> no las guardes junto a otras joyas ni las uses para trabajos pesados de fricción.</span></li>
            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#8a5d3b]" /><span><strong className="text-ink">Uso consciente:</strong> aunque son muy duraderas, dales periodos de descanso y mantenimiento.</span></li>
            <li className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#8a5d3b]" /><span><strong className="text-ink">Limpieza periódica:</strong> lávalas ocasionalmente con agua y jabón suave y sécalas muy bien con un paño limpio.</span></li>
          </ul>
        </div>
      </section>

      <section className="rounded-card-lg border border-line bg-ivory-soft p-6 md:p-8">
        <p className="luxury-eyebrow">03 · Condiciones generales</p>
        <h2 className="mt-3 text-3xl font-light text-ink">Cambios y validación</h2>
        <p className="mt-4 border-l-2 border-gold-400 pl-4 text-sm leading-7 text-ink-muted">
          Para hacer efectiva cualquier garantía o cambio, es indispensable presentar el comprobante de compra o número de pedido.
          El producto será evaluado por nuestro equipo para verificar que cumple con las condiciones descritas.
        </p>
      </section>
    </div>
  </main>
);

export default GuaranteesPage;
