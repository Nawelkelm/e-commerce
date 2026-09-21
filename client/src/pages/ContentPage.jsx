import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { contentPagesAPI } from '../services/api'
import NotFound from './NotFound'

/**
 * Renderiza una pagina institucional o legal por su slug.
 *
 * El contenido es HTML que escribe un administrador desde el panel y que el
 * backend ya sanitiza al guardarlo (RICH_TEXT_FIELDS en middleware/sanitize),
 * descartando scripts, manejadores de eventos y protocolos peligrosos.
 */
const ContentPage = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const { data } = await contentPagesAPI.getBySlug(slug)
        if (!cancelado) setPage(data)
      } catch {
        // Cualquier fallo al resolver el slug se muestra como pagina
        // inexistente: no hay nada util que el visitante pueda hacer.
        if (!cancelado) setNotFound(true)
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  if (notFound || !page) {
    return <NotFound />
  }

  const actualizada = new Date(page.updatedAt).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <>
      <Helmet>
        <title>{page.metaTitle || page.title}</title>
        {page.metaDescription && <meta name="description" content={page.metaDescription} />}
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mt-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
            {page.title}
          </h1>
          <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
            Última actualización: {actualizada}
          </p>
        </header>

        {/* El HTML viene sanitizado del backend. */}
        <div
          className="content-page-body"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </>
  )
}

export default ContentPage
