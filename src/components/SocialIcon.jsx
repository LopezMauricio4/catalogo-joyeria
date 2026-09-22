export default function SocialIcon({ type, size = 24, className = '' }) {
  return <img src={`/social/${type}.png`} width={size} height={size} alt="" aria-hidden="true"
    className={`social-brand-icon ${className}`} style={{ width: size, height: size }} decoding="async" />;
}

export function WhatsAppIcon({ size = 22, className = '' }) {
  return <SocialIcon type="whatsapp" size={size} className={className} />;
}
