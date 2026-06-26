import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store'
import { authAPI } from '../../services/api'
import PageMeta from '../../components/SEO/PageMeta'

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) { toast.error('Por favor completá todos los campos'); return false }
    if (formData.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return false }
    if (formData.password !== formData.confirmPassword) { toast.error('Las contraseñas no coinciden'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error('Por favor ingresá un email válido'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      await authAPI.register({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password })
      toast.success('¡Cuenta creada! Por favor verificá tu email')
      navigate('/email-verification-pending', { state: { email: formData.email } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta title="Crear Cuenta" description="Registrate para disfrutar de todos los beneficios." />
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-gradient">TiendaKit</Link>
            <h2 className="mt-6 text-heading-1 text-surface-900 dark:text-white">Crear cuenta</h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Iniciá sesión
              </Link>
            </p>
          </div>

          <div className="card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="input-label">Nombre</label>
                  <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="input" placeholder="Nombre" />
                </div>
                <div>
                  <label htmlFor="lastName" className="input-label">Apellido</label>
                  <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="input" placeholder="Apellido" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="input-label">Email</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="input" placeholder="tu@email.com" />
              </div>

              <div>
                <label htmlFor="password" className="input-label">Contraseña</label>
                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="input" placeholder="Mínimo 6 caracteres" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="input-label">Confirmar contraseña</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="input" placeholder="Repetí la contraseña" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                {loading ? <div className="loading-spinner h-5 w-5 mx-auto" /> : 'Crear Cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
