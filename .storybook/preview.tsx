import React from 'react'
import themes from '@thorchain/asgardex-theme'
import { addDecorator } from '@storybook/react/dist/client/preview'
import { withKnobs } from '@storybook/addon-knobs'
import { configure } from '@storybook/react'
import { withThemes } from '@react-theming/storybook-addon'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { ConnectionProvider } from '../src/contexts/ConnectionContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { I18nProvider } from '../src/contexts/I18nContext'
import { AppWrapper } from '../src/App.style'
import GlobalStyle from '../src/Global.style'

const lightTheme = { name: 'Light', ...themes.light }
const darkTheme = { name: 'Dark', ...themes.dark }

addDecorator(withKnobs)

const providerFn = ({ theme, children }) => (
  <ConnectionProvider>
    <I18nProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppWrapper>{children}</AppWrapper>
      </ThemeProvider>
    </I18nProvider>
  </ConnectionProvider>
)

addDecorator(withThemes(null, [lightTheme, darkTheme], { providerFn }))

addDecorator((story) => (
  <Router>
    <Route path="/" component={() => story()} />
  </Router>
))

const req = require.context('../src', true, /\.stories\.(ts|tsx)$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)
