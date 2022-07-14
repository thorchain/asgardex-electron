import React from 'react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

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

// const _themDecorator = withThemes(null, [lightTheme, darkTheme], { providerFn })

// Creates a `Router` decorator
// based on https://storybook.js.org/docs/react/essentials/toolbars-and-globals#create-a-decorator
const withRouter = (Story, context) => (
  <Router>
    <Routes>
      <Route path="/" element={<Story {...context} />} />
    </Routes>
  </Router>
)

export const decorators = [withRouter];

export const parameters = {
  viewport: {
    viewports: INITIAL_VIEWPORTS
  }
};
