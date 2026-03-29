import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shein: '#e91e8c',
        asos: '#2d2d2d',
        terminalx: '#ff6b35',
      }
    }
  },
  plugins: [],
}
export default config
