import { useEffect, useRef, useState } from 'react';

/**
 * Reveal — envuelve una sección y la anima con un fade + slide sutil
 * cuando entra en el viewport. Se dispara una sola vez por elemento.
 *
 * Respeta prefers-reduced-motion: si el usuario lo tiene activado,
 * el contenido aparece directamente, sin animación.
 *
 * Uso:
 *   <Reveal>...</Reveal>
 *   <Reveal as="section" className="py-20">...</Reveal>
 *   <Reveal delay={100}>...</Reveal>
 */
const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-luxury ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
