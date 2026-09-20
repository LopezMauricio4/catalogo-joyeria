/**
 * BrandMark — monograma de Alpez Joyería.
 * Rombo de línea fina en dorado con la inicial en serif al centro.
 * Es el elemento de identidad que acompaña al wordmark en Navbar y Footer.
 *
 * tone="light" → para fondos claros (navbar sobre ivory)
 * tone="dark"  → para fondos oscuros (footer sobre forest-900)
 */
const BrandMark = ({ size = 38, tone = 'light', className = '' }) => {
  const letterColor = tone === 'dark' ? '#fffdfb' : '#0b251b';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="28"
        height="28"
        stroke="#d4af37"
        strokeWidth="1"
        transform="rotate(45 20 20)"
      />
      <rect
        x="11"
        y="11"
        width="18"
        height="18"
        stroke="#d4af37"
        strokeWidth="0.5"
        strokeOpacity="0.5"
        transform="rotate(45 20 20)"
      />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontSize="16"
        fill={letterColor}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        A
      </text>
    </svg>
  );
};

export default BrandMark;