import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store'
import { authAPI } from '../../services/api'
import PageMeta from '../../components/SEO/PageMeta'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const from = location.state?.from || '/'

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) { toast.error('Por favor completá todos los campos'); return }
    setLoading(true)
    try {
      const response = await authAPI.login(formData)
      const { user, token } = response.data
      login(user, token)
      toast.success(`¡Bienvenido ${user.firstName}!`)
      navigate(from, { replace: true })
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.emailVerified === false) {
        toast.error('Por favor verificá tu email antes de iniciar sesión')
        navigate('/email-verification-pending', { state: { email: error.response.data.email || formData.email } })
        return
      }
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta title="Iniciar Sesión" description="Accedé a tu cuenta para ver tus pedidos y más." />
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-gradient">TiendaKit</Link>
            <h2 className="mt-6 text-heading-1 text-surface-900 dark:text-white">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Registrate acá
              </Link>
            </p>
          </div>

          <div className="card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="input-label">Email</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="input" placeholder="tu@email.com" />
              </div>
              <div>
                <label htmlFor="password" className="input-label">Contraseña</label>
                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="input" placeholder="••••••••" />
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                {loading ? <div className="loading-spinner h-5 w-5 mx-auto" /> : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
