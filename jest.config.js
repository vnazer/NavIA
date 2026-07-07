// Configuración Jest raíz — delega a los jest.config.ts de cada workspace.
// Corre todos los tests desde `npm test` en la raíz.
module.exports = {
  projects: ["<rootDir>/packages/*/jest.config.ts"],
};
