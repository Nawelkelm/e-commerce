import { useState, useEffect } from 'react'
import { TagIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

/**
 * Cupones vigentes en el home.
 *
 * Escrito con el sistema de diseño y el lenguaje editorial del resto del home
 * (label en versalitas + regla, bloques planos, paleta Malbec). Antes tenía su
 * propia hoja de 290 líneas con un coral fuera de paleta y tarjetas con sombra
 * que chocaban con todo lo demás; esa hoja además era global y pisaba clases
 * de otras páginas.
 */

const pesos = (n) => `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`

const formatearDescuento = (cupon) => {
  if (cupon.discountType === 'percentage') return `${parseInt(cupon.discountValue, 10)}%`
  if (cupon.discountType === 'fixed') return pesos(cupon.discountValue)
  if (cupon.discountType === 'freeShipping') return 'Envío gratis'
  return ''
}

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

const CouponBanner = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [settings, setSettings] = useState({
    couponBannerEnabled: true,
    couponBannerTitle: '¡Ofertas Especiales!',
    couponBannerSubtitle: 'Aprovecha estos cupones de descuento',
    couponBannerMaxCoupons: 3
  })

  useEffect(() => {
    const cargarSettings = async () => {
      try {
        const res = await fetch('/api/home-settings')
        const data = await res.json()
        if (data) {
          setSettings((prev) => ({
            couponBannerEnabled: data.couponBannerEnabled ?? prev.couponBannerEnabled,
            couponBannerTitle: data.couponBannerTitle || prev.couponBannerTitle,
            couponBannerSubtitle: data.couponBannerSubtitle || prev.couponBannerSubtitle,
            couponBannerMaxCoupons: data.couponBannerMaxCoupons || prev.couponBannerMaxCoupons
          }))
        }
      } catch {
        // Si falla, quedan los valores por defecto.
      }
    }

    const cargarCupones = async () => {
      try {
        const res = await fetch('/api/coupons/public')
        const data = await res.json()
        setCoupons(data.coupons || [])
      } catch {
        setCoupons([])
      } finally {
        setLoading(false)
      }
    }

    cargarSettings()
    cargarCupones()
  }, [])

  const copiar = (codigo) => {
    navigator.clipboard.writeText(codigo)
    setCopiedCode(codigo)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Mientras carga no se reserva espacio: un esqueleto haría saltar el resto
  // del home cuando no hay cupones, que es el caso más común.
  if (loading) return null
  if (!settings.couponBannerEnabled || coupons.length === 0) return null

  const visibles = coupons.slice(0, settings.couponBannerMaxCoupons)

  return (
    <section className="border-y border-surface-200 bg-surface-50 py-14 dark:border-surface-800 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header editorial: label + regla, igual que las demás secciones */}
        <div className="mb-8 flex items-center gap-3">
          <span className="flex flex-shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-500">
            <TagIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {settings.couponBannerTitle}
          </span>
          <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
          <span className="hidden flex-shrink-0 text-[10px] uppercase tracking-wider text-surface-400 sm:block">
            {settings.couponBannerSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-surface-200 bg-surface-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-surface-800 dark:bg-surface-800">
          {visibles.map((cupon) => {
            const copiado = copiedCode === cupon.code
            return (
              <div
                key={cupon.id}
                className="flex flex-col gap-3 bg-white p-5 dark:bg-surface-900"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold leading-none tracking-tight text-primary-700 dark:text-primary-400">
                    {formatearDescuento(cupon)}
                  </span>
                  {cupon.discountType !== 'freeShipping' && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                      de descuento
                    </span>
                  )}
                </div>

                {cupon.description && (
                  <p className="text-sm leading-snug text-surface-700 dark:text-surface-300">
                    {cupon.description}
                  </p>
                )}

                <ul className="space-y-0.5 text-[11px] text-surface-500 dark:text-surface-400">
                  {cupon.minPurchase > 0 && (
                    <li>Compra mínima {pesos(cupon.minPurchase)}</li>
                  )}
                  {cupon.maxDiscount && cupon.discountType === 'percentage' && (
                    <li>Tope de descuento {pesos(cupon.maxDiscount)}</li>
                  )}
                  {cupon.endDate && <li>Válido hasta el {formatearFecha(cupon.endDate)}</li>}
                </ul>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <code className="flex-1 truncate rounded-lg border border-dashed border-surface-300 bg-surface-50 px-3 py-2 font-mono text-sm font-semibold tracking-wider text-surface-900 dark:border-surface-700 dark:bg-surface-950 dark:text-white">
                    {cupon.code}
                  </code>
                  <button
                    onClick={() => copiar(cupon.code)}
                    className="btn-outline btn-sm flex-shrink-0"
                    aria-label={`Copiar el código ${cupon.code}`}
                  >
                    {copiado ? (
                      <>
                        <CheckIcon aria-hidden="true" className="h-4 w-4 text-success-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon aria-hidden="true" className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CouponBanner
