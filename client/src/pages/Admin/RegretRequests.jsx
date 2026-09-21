import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { ArrowUturnLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import { regretRequestsAPI } from '../../services/api'

const ESTADOS = {
  pending:    { label: 'Pendiente',  badge: 'badge-warning' },
  processing: { label: 'En proceso', badge: 'badge-info' },
  resolved:   { label: 'Resuelta',   badge: 'badge-success' },
  rejected:   { label: 'Rechazada',  badge: 'badge-error' }
}

const fecha = (iso) => new Date(iso).toLocaleString('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

/** Dias corridos transcurridos desde que entro la solicitud. */
const diasDesde = (iso) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)

/**
 * Bandeja de solicitudes del boton de arrepentimiento.
 *
 * Se muestra la antiguedad de cada solicitud porque el plazo legal para
 * responder corre desde que el consumidor la envia.
 */
const RegretRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [abierta, setAbierta] = useState(null)
  const [notas, setNotas] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await regretRequestsAPI.getAll(filtro ? { status: filtro } : {})
      setRequests(data)
    } catch {
      toast.error('No se pudieron cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (request, status) => {
    try {
      await regretRequestsAPI.update(request.id, { status })
      toast.success('Estado actualizado')
      await cargar()
      setAbierta(null)
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  const guardarNotas = async () => {
    try {
      await regretRequestsAPI.update(abierta.id, { adminNotes: notas })
      toast.success('Notas guardadas')
      await cargar()
      setAbierta(null)
    } catch {
      toast.error('No se pudieron guardar las notas')
    }
  }

  const pendientes = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Arrepentimientos
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Solicitudes de cancelación recibidas por el botón de arrepentimiento
            (Res. 424/2020). El plazo de respuesta corre desde la fecha de envío.
          </p>
        </div>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input mt-4 sm:mt-0 sm:w-56"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {pendientes > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
          <ClockIcon className="h-5 w-5 shrink-0" />
          Tenés {pendientes} solicitud{pendientes > 1 ? 'es' : ''} sin responder.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner h-12 w-12"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <ArrowUturnLeftIcon className="h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-surface-600 dark:text-surface-400">
            No hay solicitudes{filtro ? ' con ese estado' : ''}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>Recibida</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const dias = diasDesde(r.createdAt)
                const estado = ESTADOS[r.status] || ESTADOS.pending
                return (
                  <tr key={r.id}>
                    <td>
                      <p className="font-medium text-surface-900 dark:text-white">{r.customerName}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{r.customerEmail}</p>
                      {r.customerPhone && (
                        <p className="text-xs text-surface-500 dark:text-surface-400">{r.customerPhone}</p>
                      )}
                    </td>
                    <td>
                      {r.order ? (
                        <span className="font-mono text-xs text-surface-900 dark:text-white">
                          {r.order.orderNumber}
                        </span>
                      ) : r.orderNumber ? (
                        <span className="font-mono text-xs text-surface-500 dark:text-surface-400" title="No coincide con ningún pedido">
                          {r.orderNumber} (?)
                        </span>
                      ) : (
                        <span className="text-xs text-surface-400">—</span>
                      )}
                    </td>
                    <td>
                      <p className="text-sm text-surface-700 dark:text-surface-300">{fecha(r.createdAt)}</p>
                      <p className={`text-xs ${dias > 10 && r.status === 'pending' ? 'text-error-500 font-medium' : 'text-surface-500 dark:text-surface-400'}`}>
                        hace {dias} día{dias === 1 ? '' : 's'}
                      </p>
                    </td>
                    <td><span className={estado.badge}>{estado.label}</span></td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          onClick={() => { setAbierta(r); setNotas(r.adminNotes || '') }}
                          className="btn-ghost btn-sm"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {abierta && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="card w-full max-w-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Solicitud de {abierta.customerName}
            </h2>
            <p className="mt-1 font-mono text-xs text-surface-500 dark:text-surface-400">{abierta.id}</p>

            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Email', abierta.customerEmail],
                ['Teléfono', abierta.customerPhone || '—'],
                ['DNI / CUIT', abierta.customerDocument || '—'],
                ['Pedido', abierta.orderNumber || '—'],
                ['Recibida', fecha(abierta.createdAt)],
                ['Resuelta', abierta.resolvedAt ? fecha(abierta.resolvedAt) : '—']
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">{k}</dt>
                  <dd className="mt-0.5 text-sm text-surface-900 dark:text-white">{v}</dd>
                </div>
              ))}
            </dl>

            {abierta.reason && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">Motivo</p>
                <p className="mt-1 text-sm text-surface-700 dark:text-surface-300">{abierta.reason}</p>
              </div>
            )}

            <div className="mt-6">
              <label htmlFor="notas" className="input-label">Notas internas</label>
              <textarea
                id="notas" rows={3} value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="input"
                placeholder="Gestión, reintegro, contacto con el cliente…"
              />
            </div>

            <div className="mt-6">
              <p className="input-label">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ESTADOS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => cambiarEstado(abierta, k)}
                    disabled={abierta.status === k}
                    className="btn-outline btn-sm disabled:opacity-40"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setAbierta(null)} className="btn-secondary">Cerrar</button>
              <button onClick={guardarNotas} className="btn-primary">Guardar notas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegretRequests
