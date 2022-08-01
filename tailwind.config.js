const t = require('@thorchain/asgardex-theme').default

/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Custom colors based on `asgardex-theme`
      // Light theme https://gitlab.com/thorchain/asgardex-common/asgardex-theme/-/blob/master/src/light.ts
      // Dark theme https://gitlab.com/thorchain/asgardex-common/asgardex-theme/-/blob/master/src/dark.ts
      colors: {
        // text
        text0: t.light.palette.text[0],
        text0d: t.dark.palette.text[0],
        text1: t.light.palette.text[1],
        text1d: t.dark.palette.text[1],
        text2: t.light.palette.text[2],
        text2d: t.dark.palette.text[2],
        text3: t.light.palette.text[3],
        text3d: t.dark.palette.text[3],
        // error
        error0: t.light.palette.error[0],
        error0d: t.dark.palette.error[0],
        error1: t.light.palette.error[1],
        error1d: t.dark.palette.error[1],
        error2: t.light.palette.error[2],
        error2d: t.dark.palette.error[2],
        error3: t.light.palette.error[3],
        error3d: t.dark.palette.error[3]
      }
    },
    // Breakpoint definitions based on `MediaQueries`
    // @see `src/renderer/helpers/styleHelper.ts`
    screens: {
      xs: '0px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1600px'
    }
  },
  plugins: []
}
