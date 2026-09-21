import { useCallback, useEffect, useState } from 'react'

/**
 * Revela un elemento cuando entra en el viewport.
 *
 * Usa IntersectionObserver y no una librería de animación: el bundle ya pesa
 * ~1 MB y esto son pocas líneas. Tampoco escucha el evento scroll, que dispara
 * en cada píxel; el observer sólo avisa cuando cruza el umbral.
 *
 * La animación en sí vive en CSS (.reveal / .reveal-in en index.css) para que
 * el navegador la componga en el hilo gráfico: sólo transform y opacity.
 *
 * Si la persona pidió menos movimiento, el elemento arranca visible y no se
 * anima nada.
 *
 * @param {object}  opciones
 * @param {number}  opciones.threshold  Porción visible para disparar (0–1).
 * @param {string}  opciones.rootMargin Adelanta o retrasa el disparo.
 * @param {boolean} opciones.once       Si false, vuelve a ocultarse al salir.
 */
export const useReveal = ({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true
} = {}) => {
  // Ref por callback y no useRef: las secciones del home se renderizan recién
  // cuando llega la configuración del servidor, así que con useRef el efecto
  // corría con ref.current en null, salía temprano y no volvía a ejecutarse
  // nunca. Guardar el nodo en estado hace que el efecto corra cuando el
  // elemento realmente se monta.
  const [nodo, setNodo] = useState(null)
  const ref = useCallback((n) => setNodo(n), [])

  // Arranca en true si no hay soporte o si se pidió reducir movimiento: así el
  // contenido nunca queda invisible por un fallo de la animación.
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    if (typeof IntersectionObserver === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!nodo || visible) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entrada]) => {
        // Además de "está entrando", se revela cuando el elemento ya quedó por
        // ENCIMA del viewport. Sin esto, saltar al final de la página (Ctrl+End,
        // un ancla, o el scroll que restaura el navegador al volver atrás) deja
        // invisible para siempre todo lo que se salteó: nunca llegó a
        // intersecar, así que el observer no avisa.
        const yaPasoDeLargo = entrada.boundingClientRect.top < 0

        if (entrada.isIntersecting || yaPasoDeLargo) {
          setVisible(true)
          if (once) observer.unobserve(nodo)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(nodo)
    return () => observer.disconnect()
  }, [nodo, threshold, rootMargin, once, visible])

  return { ref, visible, className: visible ? 'reveal reveal-in' : 'reveal' }
}

export default useReveal
