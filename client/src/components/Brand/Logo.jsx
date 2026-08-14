import React from 'react'

/**
 * Isotipo de marca TiendaKit — extraído del Manual de marca v1.0.
 * Colores fijos de marca (no usar tokens): cuadrado Malbec #6E223F,
 * marquesina "t" crema #F4EFE9, brazo "k" naranja #E8890A / #F5A93E.
 * Es autocontenido: funciona sobre cualquier fondo (claro u oscuro).
 */
export const TiendaKitIcon = ({ className = 'h-8 w-8', ...props }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="TiendaKit" {...props}>
    <rect x="0" y="0" width="100" height="100" rx="27" fill="#6E223F" />
    <rect x="34" y="24" width="12" height="52" rx="3.5" fill="#F4EFE9" />
    <rect x="18" y="24" width="40" height="12" rx="3.5" fill="#F4EFE9" />
    <path d="M 46 50 L 80 26 L 80 38 L 52 58 Z" fill="#E8890A" />
    <path d="M 46 50 L 80 74 L 80 62 L 52 44 Z" fill="#F5A93E" />
  </svg>
)

/**
 * Lockup completo: isotipo + wordmark "TiendaKit" (Kit en naranja).
 * `wordmarkClassName` controla el color del "Tienda" según el fondo.
 */
export const Logo = ({
  iconClassName = 'h-8 w-8',
  showWordmark = true,
  wordmarkClassName = 'text-surface-900 dark:text-white',
  textSize = 'text-xl',
}) => (
  <span className="inline-flex items-center gap-2">
    <TiendaKitIcon className={iconClassName} />
    {showWordmark && (
      <span className={`${textSize} font-bold tracking-tight ${wordmarkClassName}`}>
        Tienda<span className="text-accent-500">Kit</span>
      </span>
    )}
  </span>
)

export default Logo
