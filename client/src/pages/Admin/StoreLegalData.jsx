import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BuildingOffice2Icon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { homeSettingsAPI, contentPagesAPI } from '../../services/api'

const CONDICIONES = [
  'Responsable Inscripto',
  'Monotributista',
  'Exento',
  'Consumidor Final'
]

/**
 * Datos del comercio: identidad legal y fiscal de la tienda.
 *
 * Se cargan una sola vez y alimentan las variables de las paginas
 * institucionales ({{razonSocial}}, {{cuit}}, etc.), asi que cambiar un dato
 * acá lo actualiza en todas las paginas a la vez.
 */
const StoreLegalData = () => {
  const [form, setForm] = useState({
    legalBusinessName: '',
    legalCuit: '',
    legalTaxCategory: '',
    legalAddress: '',
    legalJurisdiction: '',
    footerEmail: '',
    footerPhone: '',
    footerSchedule: ''
  })
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [faltantes, setFaltantes] = useState([])

  const cargarFaltantes = async () => {
    try {
      const { data } = await contentPagesAPI.getVariables()
      setFaltantes(data.faltantes || [])
    } catch {
      // El aviso es informativo: si falla, la pantalla igual sirve.
    }
  }

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await homeSettingsAPI.get()
        setForm(prev => {
          const siguiente = { ...prev }
          for (const campo of Object.keys(prev)) {
            if (data[campo] !== undefined && data[campo] !== null) siguiente[campo] = data[campo]
          }
          return siguiente
        })
      } catch {
        toast.error('No se pudieron cargar los datos del comercio')
      } finally {
        setLoading(false)
      }
    }
    cargar()
    cargarFaltantes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await homeSettingsAPI.update(form)
      toast.success('Datos guardados')
      await cargarFaltantes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  const campo = (name, label, ayuda, tipo = 'text') => (
    <div>
      <label htmlFor={name} className="input-label">{label}</label>
      <input
        id={name} name={name} type={tipo}
        value={form[name]} onChange={handleChange} className="input"
      />
      {ayuda && <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">{ayuda}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          Datos del comercio
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Identidad legal de tu tienda. Se completan una sola vez y aparecen
          automáticamente en los términos, la política de privacidad y el resto de
          las páginas institucionales.
        </p>
      </div>

      {faltantes.length > 0 ? (
        <div className="mb-6 rounded-xl border border-warning-500/30 bg-warning-50 px-4 py-3 dark:bg-warning-500/10">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-warning-600 dark:text-warning-400" />
            <div>
              <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                {faltantes.length === 1
                  ? 'Te falta 1 dato por completar'
                  : `Te faltan ${faltantes.length} datos por completar`}
              </p>
              <p className="mt-1 text-xs text-warning-700/80 dark:text-warning-400/80">
                Mientras estén vacíos, en las páginas públicas se muestra una raya en
                su lugar.
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-warning-700/80 dark:text-warning-400/80">
                {faltantes.map(f => (
                  <li key={f.key}>
                    <span className="font-medium">{f.label}</span>
                    {/* Algunos datos se cargan en otra pantalla: se indica cuál. */}
                    <span className="opacity-75"> — se carga en {f.origen}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-success-500/30 bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          Todos los datos están completos.
        </div>
      )}

      <form onSubmit={guardar} className="card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <BuildingOffice2Icon className="h-5 w-5 text-surface-400" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            Identidad fiscal
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {campo('legalBusinessName', 'Razón social', 'Como figura en AFIP')}
          {campo('legalCuit', 'CUIT', 'Con o sin guiones')}

          <div>
            <label htmlFor="legalTaxCategory" className="input-label">Condición fiscal</label>
            <select
              id="legalTaxCategory" name="legalTaxCategory"
              value={form.legalTaxCategory} onChange={handleChange} className="input"
            >
              <option value="">Seleccionar…</option>
              {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {campo('legalJurisdiction', 'Jurisdicción', 'Dónde se resuelven los conflictos legales')}

          <div className="sm:col-span-2">
            {campo('legalAddress', 'Domicilio comercial', 'Se usa para identificar al vendedor en los términos, aunque no tengas local')}
          </div>
        </div>

        <div className="divider my-8"></div>

        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Contacto
        </h2>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Estos datos se muestran en el footer y en la página de contacto.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {campo('footerEmail', 'Email de contacto', null, 'email')}
          {campo('footerPhone', 'Teléfono / WhatsApp')}
          <div className="sm:col-span-2">
            {campo('footerSchedule', 'Horario de atención', 'Ej: Lunes a viernes de 9 a 18 h')}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando…' : 'Guardar datos'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StoreLegalData
