/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'; 
export default {
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
      './src/**/*.{js,jsx}',],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  //plugins: [require("tailwindcss-animate")],
  plugins: [tailwindcssAnimate],
}

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
