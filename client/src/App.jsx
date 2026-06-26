import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'

// Componentes de layout
import Layout from './components/Layout/Layout'
import AdminLayout from './components/Layout/AdminLayout'

// Páginas públicas
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CouponsPage from './pages/CouponsPage'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import EmailVerificationPending from './pages/EmailVerificationPending'

// Páginas de usuario
import Profile from './pages/User/Profile'
import Orders from './pages/User/Orders'
import OrderDetail from './pages/User/OrderDetail'
import Wishlist from './pages/Wishlist'

// Páginas de administración
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminOrders from './pages/Admin/Orders'
import AdminShipments from './pages/Admin/Shipments'
import LogisticsCredentials from './pages/Admin/LogisticsCredentials'
import ShippingMethods from './pages/Admin/ShippingMethods'
import BankAccounts from './pages/Admin/BankAccounts'
import AdminInvoices from './pages/Admin/Invoices'
import AfipSettings from './pages/Admin/AfipSettings'
import AdminUsers from './pages/Admin/Users'
import AdminCategories from './pages/Admin/Categories'
import AdminSuppliers from './pages/Admin/Suppliers'
import AdminAnalytics from './pages/Admin/Analytics'
import AdminSettings from './pages/Admin/Settings'
import AdminHomeSettings from './pages/Admin/HomeSettings'
import RoleManagement from './pages/Admin/RoleManagement'
import CouponManagement from './pages/Admin/CouponManagement'
import EmailTemplateManagement from './pages/Admin/EmailTemplateManagement'
import SmtpSettings from './pages/Admin/SmtpSettings'
import ReviewManagement from './pages/Admin/ReviewManagement'
import StockDashboard from './pages/StockDashboard'

// Páginas de pago
import PaymentSuccess from './pages/Payment/Success'
import PaymentFailure from './pages/Payment/Failure'
import PaymentPending from './pages/Payment/Pending'
import PaymentTransfer from './pages/PaymentTransfer'

// Componentes de protección de rutas
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'

// Hooks y stores
import { useAuthStore } from './store'
import { useThemeStore } from './store/themeStore'
import { generateSessionId } from './services/api'

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { initialize } = useAuthStore()
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    // Inicializar tema
    initializeTheme()
    
    // Inicializar autenticación
    initialize()
    
    // Generar session ID para usuarios invitados si no existe
    if (!localStorage.getItem('sessionId')) {
      generateSessionId()
    }

    // Verificar estado de auth periódicamente
    const authCheckInterval = setInterval(() => {
      // Acceder directamente al store para evitar problemas de minificación
      const store = useAuthStore.getState()
      if (store.checkAuthStatus && typeof store.checkAuthStatus === 'function') {
        store.checkAuthStatus()
      }
    }, 5000) // Cada 5 segundos

    // Verificar cuando la ventana gana foco
    const handleFocus = () => {
      // Acceder directamente al store para evitar problemas de minificación
      const store = useAuthStore.getState()
      if (store.checkAuthStatus && typeof store.checkAuthStatus === 'function') {
        store.checkAuthStatus()
      }
    }
    
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(authCheckInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [initialize])

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
            <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="productos" element={<Products />} />
              <Route path="productos/:slug" element={<ProductDetail />} />
              <Route path="carrito" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="cupones" element={<CouponsPage />} />
              
              {/* Rutas de autenticación */}
              <Route path="login" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="email-verification-pending" element={<EmailVerificationPending />} />
              
              {/* Rutas de pago */}
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/failure" element={<PaymentFailure />} />
              <Route path="payment/pending" element={<PaymentPending />} />
              <Route path="payment/transfer" element={<PaymentTransfer />} />
              
              {/* Rutas protegidas de usuario */}
              <Route path="perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="pedidos" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="pedidos/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              <Route path="wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
            </Route>

            {/* Rutas de administración */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProducts />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="envios" element={<AdminShipments />} />
              <Route path="credenciales-logistica" element={<LogisticsCredentials />} />
              <Route path="metodos-envio" element={<ShippingMethods />} />
              <Route path="cuentas-bancarias" element={<BankAccounts />} />
              <Route path="facturas" element={<AdminInvoices />} />
              <Route path="afip" element={<AfipSettings />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="proveedores" element={<AdminSuppliers />} />
              <Route path="cupones" element={<CouponManagement />} />
              <Route path="emails" element={<EmailTemplateManagement />} />
              <Route path="smtp" element={<SmtpSettings />} />
              <Route path="resenas" element={<ReviewManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="stock" element={<StockDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="home" element={<AdminHomeSettings />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          
          {/* Notificaciones toast */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#171717',
                color: '#fafafa',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
              },
              success: {
                duration: 3000,
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                duration: 5000,
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App