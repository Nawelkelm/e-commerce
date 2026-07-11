import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/themeStore'

const ThemeToggle = ({ variant = 'default' }) => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = variant === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDark
          ? 'hover:bg-primary-800/60 text-primary-200 hover:text-white'
          : 'hover:bg-surface-100 dark:hover:bg-surface-700'
      }`}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <MoonIcon className={`h-5 w-5 ${isDark ? '' : 'text-surface-600 dark:text-surface-300'}`} />
      ) : (
        <SunIcon className={`h-5 w-5 ${isDark ? '' : 'text-surface-200'}`} />
      )}
    </button>
  )
}

export default ThemeToggle
