import { useEffect, useState } from 'react';
import { WhatsAppIcon } from './SocialIcon';
import { useLocation } from 'react-router-dom';
import WhatsAppAdvisorButton from "./WhatsAppAdvisorButton";

// The footer carries its own WhatsApp link, so the floating button steps aside while the
// footer is on screen instead of covering its legal links.
function useFooterVisible(pathname) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);
  return visible;
}

const FloatingWhatsApp = () => {
  const { pathname } = useLocation();
  const footerVisible = useFooterVisible(pathname);
  if (pathname.startsWith('/producto/') || pathname === '/carrito') return null;
  const whatsappMessage = 'Hola, quiero asesoría para elegir una pieza de joyería.';

  return (
    <WhatsAppAdvisorButton message={whatsappMessage} className={`floating-whatsapp fixed bottom-5 right-5 z-40 inline-flex min-h-12 min-w-12 items-center justify-center gap-3 rounded-full bg-forest-800 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-forest-700${footerVisible ? ' is-hidden' : ''}`}
      aria-label="Chatear por WhatsApp" aria-hidden={footerVisible || undefined} tabIndex={footerVisible ? -1 : undefined}>
      <WhatsAppIcon className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </WhatsAppAdvisorButton>
  );
};

export default FloatingWhatsApp;
