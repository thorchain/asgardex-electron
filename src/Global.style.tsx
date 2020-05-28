import { createGlobalStyle } from 'styled-components'

import Exo2Bold from './assets/fonts/Exo2-Bold.otf'
import Exo2Regular from './assets/fonts/Exo2-Regular.otf'
import Exo2SemiBold from './assets/fonts/Exo2-SemiBold.otf'

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'MainFontRegular';
    font-style: normal;
    font-weight: normal;
    src:
      url('${Exo2Regular}');
  }
  @font-face {
    font-family: 'MainFontBold';
    font-style: normal;
    font-weight: normal;
    src:
      url('${Exo2Bold}');
  }
  @font-face {
    font-family: 'MainFontSemiBold';
    font-style: normal;
    font-weight: normal;
    src:
      url('${Exo2SemiBold}');
  }

  html, body {
    font-family: 'MainFontRegular';
  }
`

export default GlobalStyle
