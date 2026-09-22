module.exports = {
  testEnvironment: 'node',

  // Prepara las variables de entorno antes de cargar cualquier módulo:
  // config/database.js aborta al importarse si falta DATABASE_URL.
  setupFiles: ['<rootDir>/tests/setup-env.js'],

  testMatch: ['<rootDir>/tests/**/*.test.js'],

  // Los tests de integración comparten una única base: si corrieran en
  // paralelo, el TRUNCATE de un archivo borraría los datos de otro.
  maxWorkers: 1,

  // Las conexiones a PostgreSQL tardan en cerrarse del todo.
  forceExit: true,
  testTimeout: 20000
};
