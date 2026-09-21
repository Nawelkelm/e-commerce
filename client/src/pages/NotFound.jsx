import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

/**
 * Pagina 404. Hasta ahora el router no tenia ruta catch-all, asi que
 * cualquier URL desconocida renderizaba el layout vacio.
 */
const NotFound = () => (
  <>
    <Helmet>
      <title>Página no encontrada</title>
      <meta name="robots" content="noindex" />
    </Helmet>

    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
        No encontramos esta página
      </h1>

      <p className="mt-3 text-surface-600 dark:text-surface-400">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary btn-lg">
          <HomeIcon className="h-5 w-5" />
          Ir al inicio
        </Link>
        <Link to="/productos" className="btn-outline btn-lg">
          <MagnifyingGlassIcon className="h-5 w-5" />
          Ver productos
        </Link>
      </div>
    </div>
  </>
)

export default NotFound
