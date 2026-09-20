import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

const FloatingWhatsApp = () => {
  const whatsappLink = buildWhatsAppLink('Hola, quiero asesoría para elegir una pieza de joyería.');

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:bg-emerald-400"
      aria-label="Chatear por WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
};

export default FloatingWhatsApp;
