// Configuracion de ESLint para el frontend (React + Vite).
// ESLint 8 usa el formato "eslintrc"; el archivo va en .cjs porque el
// package.json declara "type": "module".
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  // dist/ y build/ son artefactos de compilacion: no se lintean.
  ignorePatterns: ['dist', 'build', 'node_modules', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    // El proyecto no usa PropTypes ni TypeScript: validar props por runtime
    // no es la convencion de este codigo.
    'react/prop-types': 'off',
    // Los textos estan en espanol y usan comillas/apostrofes literales en JSX.
    'react/no-unescaped-entities': 'off',
    // Permite _variablesIgnoradas cuando hace falta descartar un argumento.
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
