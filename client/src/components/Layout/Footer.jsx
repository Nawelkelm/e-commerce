import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [footerSettings, setFooterSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFooterSettings()
  }, [])

  const loadFooterSettings = async () => {
    try {
      const response = await fetch(`/api/home-settings?_=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (response.ok) {
        const data = await response.json()
        setFooterSettings(data)
      }
    } catch (error) {
      console.error('Error loading footer settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (footerSettings?.footerEnabled === false) return null

  if (loading || !footerSettings) {
    return (
      <footer className="bg-surface-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center gap-2 text-surface-500 dark:text-surface-400">
            <div className="loading-spinner h-4 w-4" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      </footer>
    )
  }

  const socialLinks = [
    { key: 'footerFacebook', title: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { key: 'footerInstagram', title: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { key: 'footerTwitter', title: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { key: 'footerYoutube', title: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { key: 'footerTiktok', title: 'TikTok', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
    { key: 'footerLinkedin', title: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  ]

  const whatsappUrl = footerSettings.footerWhatsapp ? `https://wa.me/${footerSettings.footerWhatsapp}` : null

  return (
    <footer className="bg-surface-950 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* About */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">
              {footerSettings.footerAboutTitle || 'Sobre Nosotros'}
            </h3>
            <p className="text-surface-400 text-sm leading-relaxed mb-6">
              {footerSettings.footerAboutText || 'Tu tienda online de confianza.'}
            </p>

            {footerSettings.footerSocialEnabled && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ key, title, path }) =>
                  footerSettings[key] ? (
                    <a key={key} href={footerSettings[key]} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-primary-400 hover:bg-surface-700 transition-all duration-200"
                      title={title}>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={path}/></svg>
                    </a>
                  ) : null
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:text-green-400 hover:bg-surface-700 transition-all duration-200"
                    title="WhatsApp">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          {footerSettings.footerContactEnabled && (
            <div>
              <h3 className="text-white text-base font-semibold mb-4">
                {footerSettings.footerContactTitle || 'Contacto'}
              </h3>
              <ul className="space-y-3 text-sm">
                {footerSettings.footerAddress && (
                  <li className="flex items-start gap-2.5 text-surface-400">
                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <span>{footerSettings.footerAddress}</span>
                  </li>
                )}
                {footerSettings.footerPhone && (
                  <li className="flex items-center gap-2.5">
                    <svg className="h-4 w-4 flex-shrink-0 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    <a href={`tel:${footerSettings.footerPhone}`} className="text-surface-400 hover:text-primary-400 transition-colors">{footerSettings.footerPhone}</a>
                  </li>
                )}
                {footerSettings.footerEmail && (
                  <li className="flex items-center gap-2.5">
                    <svg className="h-4 w-4 flex-shrink-0 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    <a href={`mailto:${footerSettings.footerEmail}`} className="text-surface-400 hover:text-primary-400 transition-colors">{footerSettings.footerEmail}</a>
                  </li>
                )}
                {footerSettings.footerSchedule && (
                  <li className="flex items-center gap-2.5 text-surface-400">
                    <svg className="h-4 w-4 flex-shrink-0 text-surface-500 dark:text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{footerSettings.footerSchedule}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Link Columns */}
          {footerSettings.footerLinksEnabled && (
            <>
              {[
                { title: footerSettings.footerColumn1Title || 'Información', links: footerSettings.footerColumn1Links },
                { title: footerSettings.footerColumn2Title || 'Ayuda', links: footerSettings.footerColumn2Links },
                { title: footerSettings.footerColumn3Title || 'Legal', links: footerSettings.footerColumn3Links },
              ].filter(col => col.links?.length > 0).map((col, i) => (
                <div key={i}>
                  <h3 className="text-white text-base font-semibold mb-4">{col.title}</h3>
                  <ul className="space-y-2.5">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link to={link.url} className="text-sm text-surface-400 hover:text-primary-400 transition-colors">
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Copyright & Payment */}
        <div className="border-t border-surface-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            {footerSettings.footerCopyrightText || `© ${currentYear} TiendaKit. Todos los derechos reservados.`}
          </p>

          {footerSettings.footerShowPaymentMethods && footerSettings.footerPaymentMethods?.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-surface-500 dark:text-surface-400 text-xs">Aceptamos:</span>
              <div className="flex gap-1.5">
                {footerSettings.footerPaymentMethods.includes('visa') && (
                  <span className="px-2 py-1 rounded bg-surface-800 border border-surface-700 text-[10px] font-bold text-surface-300 tracking-wider">VISA</span>
                )}
                {footerSettings.footerPaymentMethods.includes('mastercard') && (
                  <span className="px-2 py-1 rounded bg-surface-800 border border-surface-700 text-[10px] font-bold text-surface-300 tracking-wider">MC</span>
                )}
                {footerSettings.footerPaymentMethods.includes('amex') && (
                  <span className="px-2 py-1 rounded bg-surface-800 border border-surface-700 text-[10px] font-bold text-surface-300 tracking-wider">AMEX</span>
                )}
                {footerSettings.footerPaymentMethods.includes('mercadopago') && (
                  <span className="px-2 py-1 rounded bg-primary-600/20 border border-primary-500/30 text-[10px] font-bold text-primary-400 tracking-wider">MP</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
