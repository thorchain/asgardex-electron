import React from 'react'
import { addDecorator } from '@storybook/react'
import { withThemes } from '@react-theming/storybook-addon'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { AppProvider } from '../src/renderer/contexts/AppContext'
import { ThemeProvider, themes } from '../src/renderer/contexts/ThemeContext'
import * as Styled from '../src/renderer/views/app/AppView.styles'
import { Locale } from '../src/shared/i18n/types'
import { IntlProvider } from 'react-intl'
import { getMessagesByLocale } from '../src/renderer/i18n'

import * as mockApi from '../src/shared/mock/api'

// Mock api provided by main renderer
window.apiHDWallet = { ...mockApi.apiHDWallet }
window.apiKeystore = { ...mockApi.apiKeystore }
window.apiLang = { ...mockApi.apiLang }
window.apiUrl = { ...mockApi.apiUrl }

const lightTheme = { name: 'Light', ...themes.light }
const darkTheme = { name: 'Dark', ...themes.dark }
const locale = Locale.EN
const messages = getMessagesByLocale(locale)

const providerFn = ({ theme, children }) => (
  <AppProvider>
    {/* We use IntlProvider instead of our our custom I18nProvider to provide messages, but w/o dependencies to Electron/Node source, which can't run in storybook */}
    <IntlProvider locale={locale} messages={messages} defaultLocale={locale}>
      <ThemeProvider theme={theme}>
        <Styled.AppWrapper>{children}</Styled.AppWrapper>
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
