import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const WishlistButton = ({ 
  productId, 
  productData = null, 
  size = 'medium',
  showText = false,
  className = ''
}) => {
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  
  const inWishlist = isInWishlist(productId)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para usar la lista de deseos')
      navigate('/login')
      return
    }

    await toggleWishlist(productId, productData)
  }

  const sizeClasses = {
    small: 'w-8 h-8 p-1.5',
    medium: 'w-10 h-10 p-2',
    large: 'w-12 h-12 p-2.5'
  }

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-7 h-7'
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${inWishlist 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:bg-surface-900 border border-surface-300'
        }
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {inWishlist ? (
        <HeartSolidIcon className={`${iconSizes[size]} text-red-600`} />
      ) : (
        <HeartIcon className={`${iconSizes[size]}`} />
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  )
}

export default WishlistButton
