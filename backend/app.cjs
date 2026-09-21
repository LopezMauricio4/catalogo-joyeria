// Entrada de despliegue junto a package.json y node_modules del backend.
// La aplicación TypeScript se compila antes de que Vercel empaquete la función.
const express = require('express');
const compiledApp = require('./dist/app.js').default;

const app = express();
app.use(compiledApp);

module.exports = app;
