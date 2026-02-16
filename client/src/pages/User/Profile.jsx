import React, { useState, useEffect } from 'react'
import { 
  UserIcon, 
  MapPinIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Profile = () => {
  const { user, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Datos personales
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  // Dirección de envío
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    phone: ''
  })

  // Dirección de facturación
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    phone: '',
    cuit: '',
    companyName: '',
    fiscalCondition: 'Consumidor Final'
  })

  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })

      if (user.shippingAddress) {
        setShippingAddress(user.shippingAddress)
      }

      if (user.billingAddress) {
        setBillingAddress(user.billingAddress)
      }
    }
  }, [user])

  const handlePersonalDataChange = (e) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value
    })
  }

  const handleShippingAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handleBillingAddressChange = (e) => {
    setBillingAddress({
      ...billingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let dataToSend = {}

      if (activeTab === 'personal') {
        dataToSend = {
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          phone: personalData.phone,
          address: personalData.address
        }
      } else if (activeTab === 'shipping') {
        dataToSend = { shippingAddress }
      } else if (activeTab === 'billing') {
        dataToSend = { billingAddress }
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' })
        // Actualizar el estado global del usuario
        useAuthStore.getState().setUser(data.user)
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar perfil' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar perfil' })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', name: 'Datos Personales', icon: UserIcon },
    { id: 'shipping', name: 'Dirección de Envío', icon: MapPinIcon },
    { id: 'billing', name: 'Datos de Facturación', icon: DocumentTextIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Administra tu información personal y direcciones</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMessage({ type: '', text: '' })
                  }}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 m-6 rounded-md ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                )}
                <p className={`ml-3 text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Datos Personales */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={personalData.firstName}
                      onChange={handlePersonalDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={personalData.lastName}
                      onChange={handlePersonalDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (no se puede cambiar)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled
                    value={personalData.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={personalData.phone}
                    onChange={handlePersonalDataChange}
                    placeholder="+52 1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={personalData.address}
                    onChange={handlePersonalDataChange}
                    placeholder="Calle, número, colonia..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Dirección de Envío */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shipping-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="shipping-firstName"
                      name="firstName"
                      required
                      value={shippingAddress.firstName}
                      onChange={handleShippingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="shipping-lastName"
                      name="lastName"
                      required
                      value={shippingAddress.lastName}
                      onChange={handleShippingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shipping-street" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y número *
                  </label>
                  <input
                    type="text"
                    id="shipping-street"
                    name="street"
                    required
                    value={shippingAddress.street}
                    onChange={handleShippingAddressChange}
                    placeholder="Calle Principal #123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad/Localidad *
                    </label>
                    <input
                      type="text"
                      id="shipping-city"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleShippingAddressChange}
                      placeholder="Buenos Aires"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia *
                    </label>
                    <select
                      id="shipping-state"
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleShippingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar provincia</option>
                      <option value="Buenos Aires">Buenos Aires</option>
                      <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                      <option value="Catamarca">Catamarca</option>
                      <option value="Chaco">Chaco</option>
                      <option value="Chubut">Chubut</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Corrientes">Corrientes</option>
                      <option value="Entre Ríos">Entre Ríos</option>
                      <option value="Formosa">Formosa</option>
                      <option value="Jujuy">Jujuy</option>
                      <option value="La Pampa">La Pampa</option>
                      <option value="La Rioja">La Rioja</option>
                      <option value="Mendoza">Mendoza</option>
                      <option value="Misiones">Misiones</option>
                      <option value="Neuquén">Neuquén</option>
                      <option value="Río Negro">Río Negro</option>
                      <option value="Salta">Salta</option>
                      <option value="San Juan">San Juan</option>
                      <option value="San Luis">San Luis</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Santiago del Estero">Santiago del Estero</option>
                      <option value="Tierra del Fuego">Tierra del Fuego</option>
                      <option value="Tucumán">Tucumán</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="shipping-postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="shipping-postalCode"
                      name="postalCode"
                      required
                      value={shippingAddress.postalCode}
                      onChange={handleShippingAddressChange}
                      placeholder="C1234ABC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-1">
                      País *
                    </label>
                    <input
                      type="text"
                      id="shipping-country"
                      name="country"
                      required
                      value={shippingAddress.country}
                      onChange={handleShippingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Envíos dentro de Argentina
                    </p>
                  </div>

                  <div>
                    <label htmlFor="shipping-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="shipping-phone"
                      name="phone"
                      required
                      value={shippingAddress.phone}
                      onChange={handleShippingAddressChange}
                      placeholder="+54 11 1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Datos de Facturación */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Complete sus datos fiscales según AFIP/ARCA para la emisión de facturas electrónicas en Argentina.
                  </p>
                </div>

                <div>
                  <label htmlFor="billing-fiscalCondition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condición Fiscal *
                  </label>
                  <select
                    id="billing-fiscalCondition"
                    name="fiscalCondition"
                    required
                    value={billingAddress.fiscalCondition}
                    onChange={handleBillingAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Consumidor Final">Consumidor Final</option>
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributista">Monotributista</option>
                    <option value="Exento">Exento</option>
                    <option value="Responsable No Inscripto">Responsable No Inscripto</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccione su condición frente al IVA según AFIP
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="billing-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="billing-firstName"
                      name="firstName"
                      required
                      value={billingAddress.firstName}
                      onChange={handleBillingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="billing-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="billing-lastName"
                      name="lastName"
                      required
                      value={billingAddress.lastName}
                      onChange={handleBillingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="billing-companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social {billingAddress.fiscalCondition !== 'Consumidor Final' && '*'}
                  </label>
                  <input
                    type="text"
                    id="billing-companyName"
                    name="companyName"
                    required={billingAddress.fiscalCondition !== 'Consumidor Final'}
                    value={billingAddress.companyName}
                    onChange={handleBillingAddressChange}
                    placeholder="Nombre o Razón Social"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {billingAddress.fiscalCondition === 'Consumidor Final' 
                      ? 'Opcional para consumidores finales'
                      : 'Obligatorio para Responsables Inscriptos y Monotributistas'}
                  </p>
                </div>

                <div>
                  <label htmlFor="billing-cuit" className="block text-sm font-medium text-gray-700 mb-1">
                    CUIT/CUIL *
                  </label>
                  <input
                    type="text"
                    id="billing-cuit"
                    name="cuit"
                    required
                    value={billingAddress.cuit}
                    onChange={handleBillingAddressChange}
                    placeholder="20-12345678-9"
                    maxLength="13"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: XX-XXXXXXXX-X (11 dígitos con guiones)
                  </p>
                </div>

                <div>
                  <label htmlFor="billing-street" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y número *
                  </label>
                  <input
                    type="text"
                    id="billing-street"
                    name="street"
                    required
                    value={billingAddress.street}
                    onChange={handleBillingAddressChange}
                    placeholder="Calle Principal #123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad/Localidad *
                    </label>
                    <input
                      type="text"
                      id="billing-city"
                      name="city"
                      required
                      value={billingAddress.city}
                      onChange={handleBillingAddressChange}
                      placeholder="Buenos Aires"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia *
                    </label>
                    <select
                      id="billing-state"
                      name="state"
                      required
                      value={billingAddress.state}
                      onChange={handleBillingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar provincia</option>
                      <option value="Buenos Aires">Buenos Aires</option>
                      <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                      <option value="Catamarca">Catamarca</option>
                      <option value="Chaco">Chaco</option>
                      <option value="Chubut">Chubut</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Corrientes">Corrientes</option>
                      <option value="Entre Ríos">Entre Ríos</option>
                      <option value="Formosa">Formosa</option>
                      <option value="Jujuy">Jujuy</option>
                      <option value="La Pampa">La Pampa</option>
                      <option value="La Rioja">La Rioja</option>
                      <option value="Mendoza">Mendoza</option>
                      <option value="Misiones">Misiones</option>
                      <option value="Neuquén">Neuquén</option>
                      <option value="Río Negro">Río Negro</option>
                      <option value="Salta">Salta</option>
                      <option value="San Juan">San Juan</option>
                      <option value="San Luis">San Luis</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Santiago del Estero">Santiago del Estero</option>
                      <option value="Tierra del Fuego">Tierra del Fuego</option>
                      <option value="Tucumán">Tucumán</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="billing-postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="billing-postalCode"
                      name="postalCode"
                      required
                      value={billingAddress.postalCode}
                      onChange={handleBillingAddressChange}
                      placeholder="C1234ABC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700 mb-1">
                      País *
                    </label>
                    <input
                      type="text"
                      id="billing-country"
                      name="country"
                      required
                      value={billingAddress.country}
                      onChange={handleBillingAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sistema configurado para Argentina
                    </p>
                  </div>

                  <div>
                    <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="billing-phone"
                      name="phone"
                      required
                      value={billingAddress.phone}
                      onChange={handleBillingAddressChange}
                      placeholder="+54 11 1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile