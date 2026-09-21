import useReveal from '../hooks/useReveal'

/**
 * Envuelve contenido que aparece con una animación de entrada al llegar al
 * viewport.
 *
 * Se usa sobre el contenedor interno de cada sección y no sobre la <section>:
 * así las bandas de color quedan quietas y sólo el contenido sube dentro de
 * ellas. Animar la sección completa haría "parpadear" el fondo.
 *
 * Con `stagger`, los hijos directos entran escalonados.
 *
 * @param {'up'|'left'|'right'} direction  Desde dónde entra.
 * @param {boolean}             stagger    Escalona a los hijos directos.
 */
const Reveal = ({
  as: Tag = 'div',
  direction = 'up',
  stagger = false,
  className = '',
  children,
  ...props
}) => {
  const { ref, visible } = useReveal()

  // Con stagger el contenedor sólo hace de disparador: los que se animan son
  // los hijos. Por eso no lleva .reveal, que lo animaría también.
  const base = stagger
    ? `reveal-stagger ${visible ? 'reveal-in' : ''}`
    : `reveal ${visible ? 'reveal-in' : ''}`

  const clases = [
    base,
    direction === 'left' ? 'reveal-left' : '',
    direction === 'right' ? 'reveal-right' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <Tag ref={ref} className={clases} {...props}>
      {children}
    </Tag>
  )
}

export default Reveal
