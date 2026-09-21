// Vercel traza esta importación y las dependencias del backend compilado.
// backend es CommonJS; su export default de TypeScript está en .default.
import backend from '../backend/dist/app.js';

export default backend.default;
