/**
 * Esqueleto del home mientras cargan los datos.
 *
 * Reemplaza un spinner centrado a pantalla completa. La diferencia no es
 * estética: el esqueleto reserva el espacio que va a ocupar cada bloque, así
 * que cuando llegan los datos nada salta de lugar. Un spinner deja la pantalla
 * vacía y después empuja todo de golpe.
 *
 * El shimmer viene de `.skeleton` (animate-pulse), que el bloque de
 * prefers-reduced-motion de index.css ya neutraliza.
 */

/** Una franja gris. `w` y `h` son clases de Tailwind. */
const Barra = ({ w = 'w-full', h = 'h-4', className = '' }) => (
  <div className={`skeleton ${w} ${h} ${className}`} />
)

const HomeSkeleton = () => (
  <div aria-busy="true" aria-live="polite">
    <span className="sr-only">Cargando la tienda…</span>

    {/* Hero */}
    <div className="bg-primary-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-5">
            <Barra w="w-32" h="h-2.5" className="bg-primary-800" />
            <Barra w="w-full" h="h-12" className="bg-primary-800" />
            <Barra w="w-4/5" h="h-12" className="bg-primary-800" />
            <Barra w="w-2/3" h="h-4" className="mt-2 bg-primary-800" />
            <Barra w="w-36" h="h-5" className="mt-4 bg-primary-800" />
          </div>
          <div className="hidden flex-col justify-center gap-4 border-l border-primary-800/50 pl-12 lg:flex">
            {[0, 1, 2, 3].map((i) => (
              <Barra key={i} h="h-10" className="bg-primary-800" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Features */}
    <div className="border-y border-surface-200 bg-white py-12 dark:border-surface-800 dark:bg-surface-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Barra w="w-10" h="h-0.5" />
            <Barra w="w-24" h="h-3" />
            <Barra w="w-full" h="h-3" />
          </div>
        ))}
      </div>
    </div>

    {/* Categorías */}
    <div className="bg-surface-50 py-14 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Barra w="w-40" h="h-3" className="mb-8" />
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-surface-200 py-4 dark:border-surface-800">
              <Barra w="w-2/5" h="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Productos: mismo layout asimétrico que el bloque real */}
    <div className="bg-white py-16 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Barra w="w-44" h="h-3" className="mb-8" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Barra h="h-[420px]" className="rounded-xl" />
            <Barra w="w-3/4" h="h-4" />
            <Barra w="w-1/3" h="h-6" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Barra h="h-48" className="rounded-xl" />
                <Barra w="w-2/3" h="h-3" />
                <Barra w="w-1/4" h="h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default HomeSkeleton
