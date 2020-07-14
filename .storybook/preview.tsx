import React from 'react'
import themes from '@thorchain/asgardex-theme'
import { addDecorator } from '@storybook/react/dist/client/preview'
import { configure } from '@storybook/react'
import { withThemes } from '@react-theming/storybook-addon'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { AppProvider } from '../src/contexts/AppContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AppWrapper } from '../src/App.style'
import { Locale } from '../src/shared/i18n/types'
import { getMessagesByLocale } from '../src/i18n'
import { IntlProvider } from 'react-intl'

const lightTheme = { name: 'Light', ...themes.light }
const darkTheme = { name: 'Dark', ...themes.dark }
const locale = Locale.EN
const messages = getMessagesByLocale(locale)

const providerFn = ({ theme, children }) => (
  <AppProvider>
    {/* We use IntlProvider instead of our our custom I18nProvider to provide messages, but w/o dependencies to Electron/Node source, which can't run in storybook */}
    <IntlProvider locale={locale} messages={messages} defaultLocale={locale}>
      <ThemeProvider theme={theme}>
        <AppWrapper>{children}</AppWrapper>
      </ThemeProvider>
    </IntlProvider>
  </AppProvider>
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
