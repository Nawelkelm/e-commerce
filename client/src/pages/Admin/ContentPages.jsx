import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { contentPagesAPI } from '../../services/api'

const VACIA = {
  slug: '',
  title: '',
  content: '',
  excerpt: '',
  metaTitle: '',
  metaDescription: '',
  isPublished: true,
  sortOrder: 0
}

/**
 * Administracion de las paginas institucionales y legales.
 *
 * El cuerpo se edita como HTML en un textarea: el backend lo sanitiza al
 * guardarlo, conservando el marcado seguro y descartando scripts.
 */
const ContentPages = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null) // null = sin editor abierto
  const [form, setForm] = useState(VACIA)
  const [guardando, setGuardando] = useState(false)
  const [variables, setVariables] = useState([])

  const cargar = async () => {
    try {
      const { data } = await contentPagesAPI.getAll()
      setPages(data)
    } catch {
      toast.error('No se pudieron cargar las páginas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // Las variables se muestran como ayuda en el editor.
    contentPagesAPI.getVariables()
      .then(({ data }) => setVariables(data.variables || []))
      .catch(() => setVariables([]))
  }, [])

  const abrirNueva = () => {
    setForm(VACIA)
    setEditando('nueva')
  }

  const abrirEdicion = (page) => {
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content || '',
      excerpt: page.excerpt || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished,
      sortOrder: page.sortOrder
    })
    setEditando(page)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'sortOrder' ? Number(value) : value)
    }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editando === 'nueva') {
        await contentPagesAPI.create(form)
        toast.success('Página creada')
      } else {
        // El slug de una pagina del sistema no se puede cambiar.
        const payload = editando.isSystem ? { ...form, slug: undefined } : form
        await contentPagesAPI.update(editando.id, payload)
        toast.success('Página actualizada')
      }
      setEditando(null)
      await cargar()
    } catch (error) {
      toast.error(
        error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'No se pudo guardar'
      )
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (page) => {
    if (!window.confirm(`¿Eliminar la página "${page.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await contentPagesAPI.delete(page.id)
      toast.success('Página eliminada')
      await cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Páginas
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Contenido institucional y legal de la tienda. Las páginas del sistema se
            pueden editar y despublicar, pero no eliminar.
          </p>
        </div>
        <button onClick={abrirNueva} className="btn-primary mt-4 sm:mt-0">
          <PlusIcon className="h-5 w-5" />
          Nueva página
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <DocumentTextIcon className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-surface-600 dark:text-surface-400">No hay páginas todavía</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>URL</th>
                <th>Estado</th>
                <th>Orden</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-surface-900 dark:text-white">{page.title}</span>
                      {page.isSystem && (
                        <span title="Página del sistema: no se puede eliminar">
                          <LockClosedIcon className="h-4 w-4 text-surface-400" />
                        </span>
                      )}
                    </div>
                    {page.excerpt && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{page.excerpt}</p>
                    )}
                  </td>
                  <td>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      /{page.slug}
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td>
                    <span className={page.isPublished ? 'badge-success' : 'badge-warning'}>
                      {page.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="tabular-nums text-surface-600 dark:text-surface-400">{page.sortOrder}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEdicion(page)}
                        className="btn-ghost btn-sm"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => eliminar(page)}
                        disabled={page.isSystem}
                        className="btn-ghost btn-sm text-error-500 disabled:opacity-30"
                        title={page.isSystem ? 'Las páginas del sistema no se eliminan' : 'Eliminar'}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <form onSubmit={guardar} className="card w-full max-w-3xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              {editando === 'nueva' ? 'Nueva página' : `Editar: ${editando.title}`}
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="input-label">
                  Título <span className="text-error-500">*</span>
                </label>
                <input
                  id="title" name="title" type="text" required
                  value={form.title} onChange={handleChange} className="input"
                />
              </div>

              <div>
                <label htmlFor="slug" className="input-label">
                  URL <span className="text-error-500">*</span>
                </label>
                <input
                  id="slug" name="slug" type="text" required
                  value={form.slug} onChange={handleChange} className="input"
                  disabled={editando !== 'nueva' && editando.isSystem}
                  placeholder="terminos"
                />
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  {editando !== 'nueva' && editando.isSystem
                    ? 'El sistema enlaza esta URL, por eso no se puede cambiar.'
                    : 'Sólo minúsculas, números y guiones.'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="excerpt" className="input-label">Resumen</label>
                <input
                  id="excerpt" name="excerpt" type="text"
                  value={form.excerpt} onChange={handleChange} className="input"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="content" className="input-label">Contenido (HTML)</label>
                <textarea
                  id="content" name="content" rows={16}
                  value={form.content} onChange={handleChange}
                  className="input font-mono text-xs"
                />
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Se admiten etiquetas como &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt; y
                  &lt;a&gt;. Los scripts se eliminan al guardar.
                </p>

                {variables.length > 0 && (
                  <div className="mt-3 rounded-lg bg-surface-100 p-3 dark:bg-surface-800">
                    <p className="text-xs font-medium text-surface-700 dark:text-surface-300">
                      Variables disponibles
                    </p>
                    <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                      Escribilas en el contenido y se reemplazan solas por los datos de
                      tu tienda. Así no tenés que repetirlos en cada página.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {variables.map(v => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => setForm(prev => ({
                            ...prev,
                            content: `${prev.content}{{${v.key}}}`
                          }))}
                          title={v.valor ? `${v.label}: ${v.valor}` : `${v.label} — sin completar (${v.origen})`}
                          className={`rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                            v.valor
                              ? 'bg-surface-200 text-surface-700 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-200'
                              : 'bg-warning-100 text-warning-700 hover:bg-warning-200 dark:bg-warning-500/20 dark:text-warning-400'
                          }`}
                        >
                          {`{{${v.key}}}`}
                        </button>
                      ))}
                    </div>
                    {variables.some(v => !v.valor) && (
                      <p className="mt-2 text-xs text-warning-700 dark:text-warning-400">
                        Las resaltadas todavía no tienen valor. Cargalas en
                        Datos del comercio.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="metaTitle" className="input-label">Meta título (SEO)</label>
                <input
                  id="metaTitle" name="metaTitle" type="text"
                  value={form.metaTitle} onChange={handleChange} className="input"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="input-label">Meta descripción (SEO)</label>
                <input
                  id="metaDescription" name="metaDescription" type="text"
                  value={form.metaDescription} onChange={handleChange} className="input"
                />
              </div>

              <div>
                <label htmlFor="sortOrder" className="input-label">Orden</label>
                <input
                  id="sortOrder" name="sortOrder" type="number"
                  value={form.sortOrder} onChange={handleChange} className="input"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                  <input
                    name="isPublished" type="checkbox"
                    checked={form.isPublished} onChange={handleChange}
                    className="h-4 w-4 rounded border-surface-300 text-primary-600"
                  />
                  Publicada
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setEditando(null)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ContentPages
