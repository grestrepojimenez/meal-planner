import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontSize: {
        'clamp-30': "clamp(1.1rem, 5vw, 1.9rem)",
        'clamp-20': "clamp(1rem, 4vw, 1.6rem)",
        'clamp-18': "clamp(1rem, 4vw, 1.3rem)",
      },
    },
  },
  plugins: [],
}
export default config
