import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/themeStore'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6 text-surface-700 dark:text-surface-300 dark:text-surface-200" />
      ) : (
        <SunIcon className="h-6 w-6 text-surface-200" />
      )}
    </button>
  )
}

export default ThemeToggle
