const t = require('@thorchain/asgardex-theme').default

/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        main: ['MainFontRegular'],
        mainBold: ['MainFontBold'],
        mainSemiBold: ['MainFontSemiBold']
      },
      spacing: {
        '5px': '5px',
        '10px': '10px',
        '15px': '15px',
        '20px': '20px',
        '30px': '30px',
        '40px': '40px',
        '50px': '50px'
      },
      // https://tailwindcss.com/docs/font-size#providing-a-default-line-height
      fontSize: {
        11: ['11px', '14px'],
        14: ['14px', '17px'],
        16: ['16px', '19px'],
        18: ['18px', '21px'],
        20: ['20px', '23px']
      },
      // Custom colors based on `asgardex-theme`
      // Light theme https://gitlab.com/thorchain/asgardex-common/asgardex-theme/-/blob/master/src/light.ts
      // Dark theme https://gitlab.com/thorchain/asgardex-common/asgardex-theme/-/blob/master/src/dark.ts
      colors: {
        turquoise: '#23DCC8', //'#50E3C2'
        red: '#FF4954',
        // text
        text0: t.light.palette.text[0],
        text0d: t.dark.palette.text[0],
        text1: t.light.palette.text[1],
        text1d: t.dark.palette.text[1],
        text2: t.light.palette.text[2],
        text2d: t.dark.palette.text[2],
        text3: t.light.palette.text[3],
        text3d: t.dark.palette.text[3],
        // bg
        bg0: t.light.palette.background[0],
        bg0d: t.dark.palette.background[0],
        bg1: t.light.palette.background[1],
        bg1d: t.dark.palette.background[1],
        bg2: t.light.palette.background[2],
        bg2d: t.dark.palette.background[2],
        bg3: t.light.palette.background[3],
        bg3d: t.dark.palette.background[3],
        // error
        error0: t.light.palette.error[0],
        error0d: t.dark.palette.error[0],
        error1: t.light.palette.error[1],
        error1d: t.dark.palette.error[1],
        error2: t.light.palette.error[2],
        error2d: t.dark.palette.error[2],
        error3: t.light.palette.error[3],
        error3d: t.dark.palette.error[3],
        // warning
        warning0: t.light.palette.warning[0],
        warningr0d: t.dark.palette.warning[0],
        // gray
        gray0: t.light.palette.gray[0],
        gray0d: t.dark.palette.gray[0],
        gray1: t.light.palette.gray[1],
        gray1d: t.dark.palette.gray[1],
        gray2: t.light.palette.gray[2],
        gray2d: t.dark.palette.gray[2]
      },
      // Custom transition props
      // @see https://tailwindcss.com/docs/transition-property#customizing-your-theme
      transitionProperty: {
        height: 'height'
      }
    },
    // Breakpoint are overridden (not extended)
    // Based on `MediaQueries`
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
