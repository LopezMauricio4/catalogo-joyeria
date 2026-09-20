/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4: el sistema de color, tipografía, sombras y radios
  // se define en src/index.css dentro del bloque @theme.
  // Este archivo ya no necesita "theme.extend" — se deja explícito
  // por si en el futuro se agrega un plugin o un prefix.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}