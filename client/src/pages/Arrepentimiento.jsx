import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { contentPagesAPI, regretRequestsAPI } from '../services/api'

/**
 * Boton de arrepentimiento (Resolucion 424/2020 + art. 34 de la Ley 24.240).
 *
 * El texto explicativo sale de la pagina de contenido "arrepentimiento", que
 * el comercio puede editar desde el panel. El formulario es fijo porque los
 * datos que se piden son los que hacen falta para identificar la compra.
 */
const Arrepentimiento = () => {
  const [intro, setIntro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [solicitudId, setSolicitudId] = useState(null)
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerDocument: '',
    orderNumber: '',
    reason: ''
  })

  useEffect(() => {
    contentPagesAPI.getBySlug('arrepentimiento')
      .then(({ data }) => setIntro(data))
      .catch(() => setIntro(null)) // Si la pagina no existe, se muestra solo el formulario.
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)

    try {
      const { data } = await regretRequestsAPI.create(form)
      setSolicitudId(data.id)
      toast.success('Solicitud enviada')
    } catch (error) {
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'No pudimos enviar la solicitud. Probá de nuevo en unos minutos.'
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  // Pantalla de confirmacion: el numero de solicitud es el comprobante de
  // que el tramite quedo iniciado.
  if (solicitudId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-success-500" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
          Recibimos tu solicitud
        </h1>
        <p className="mt-3 text-surface-600 dark:text-surface-400">
          Te enviamos un correo a <strong>{form.customerEmail}</strong> con el acuse de
          recibo y los pasos a seguir.
        </p>
        <div className="mt-6 rounded-xl bg-surface-100 px-5 py-4 dark:bg-surface-800">
          <p className="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">
            Número de solicitud
          </p>
          <p className="mt-1 font-mono text-sm text-surface-900 dark:text-white">
            {solicitudId}
          </p>
        </div>
        <Link to="/" className="btn-primary btn-lg mt-8">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Botón de arrepentimiento</title>
        <meta
          name="description"
          content="Cancelá tu compra dentro de los 10 días corridos, sin costo y sin justificar el motivo."
        />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-4xl">
          {intro?.title || 'Botón de Arrepentimiento'}
        </h1>

        {intro?.content && (
          <div
            className="content-page-body mt-6"
            dangerouslySetInnerHTML={{ __html: intro.content }}
          />
        )}

        <form onSubmit={handleSubmit} className="card mt-10 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            Datos de la solicitud
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Los campos marcados con <span className="text-error-500">*</span> son obligatorios.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customerName" className="input-label">
                Nombre y apellido <span className="text-error-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={form.customerName}
                onChange={handleChange}
                className="input"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="customerEmail" className="input-label">
                Email <span className="text-error-500">*</span>
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                value={form.customerEmail}
                onChange={handleChange}
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="input-label">Teléfono</label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={handleChange}
                className="input"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="customerDocument" className="input-label">DNI o CUIT</label>
              <input
                id="customerDocument"
                name="customerDocument"
                type="text"
                value={form.customerDocument}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="orderNumber" className="input-label">Número de pedido</label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                value={form.orderNumber}
                onChange={handleChange}
                className="input"
                placeholder="Si lo tenés a mano"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="reason" className="input-label">Motivo</label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={form.reason}
                onChange={handleChange}
                className="input"
                placeholder="Opcional: la ley no te exige justificar el arrepentimiento."
              />
            </div>
          </div>

          <button type="submit" disabled={enviando} className="btn-primary btn-lg mt-8 w-full sm:w-auto">
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </>
  )
}

export default Arrepentimiento
