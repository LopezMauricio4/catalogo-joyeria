import { WhatsAppIcon } from './SocialIcon';
import { useLocation } from 'react-router-dom';
import WhatsAppAdvisorButton from "./WhatsAppAdvisorButton";

const FloatingWhatsApp = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/producto/') || pathname === '/carrito') return null;
  const whatsappMessage = 'Hola, quiero asesoría para elegir una pieza de joyería.';

  return (
    <WhatsAppAdvisorButton message={whatsappMessage} className="floating-whatsapp fixed bottom-5 right-5 z-40 inline-flex min-h-12 min-w-12 items-center justify-center gap-3 rounded-full bg-forest-800 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-forest-700"
      aria-label="Chatear por WhatsApp">
      <WhatsAppIcon className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </WhatsAppAdvisorButton>
  );
};

export default FloatingWhatsApp;
