import React from 'react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import {
  MemoryRouter, Route, Routes } from 'react-router-dom'

import { AppProvider } from '../src/renderer/contexts/AppContext'
import { ThemeProvider, themes } from '../src/renderer/contexts/ThemeContext'
import * as Styled from '../src/renderer/views/app/AppView.styles'
import { Locale } from '../src/shared/i18n/types'
import { IntlProvider } from 'react-intl'
import { getMessagesByLocale } from '../src/renderer/i18n'

import * as mockApi from '../src/shared/mock/api'
import type { DecoratorFn } from '@storybook/react';

// Mock api provided by main renderer
window.apiHDWallet = { ...mockApi.apiHDWallet }
window.apiKeystore = { ...mockApi.apiKeystore }
window.apiLang = { ...mockApi.apiLang }
window.apiUrl = { ...mockApi.apiUrl }

const lightTheme = { name: 'Light', ...themes.light }
const _darkTheme = { name: 'Dark', ...themes.dark }
const locale = Locale.EN
const messages = getMessagesByLocale(locale)

const providerDecorator: DecoratorFn = (Story) => (
  <AppProvider>
    {/* We use IntlProvider instead of our our custom I18nProvider to provide messages, but w/o dependencies to Electron/Node source, which can't run in storybook */}
    <IntlProvider locale={locale} messages={messages} defaultLocale={locale}>
      <ThemeProvider theme={lightTheme}>
        <Styled.AppWrapper><Story/></Styled.AppWrapper>
      </ThemeProvider>
    </IntlProvider>
  </AppProvider>
)

// Creates a `Router` decorator
// based on https://divotion.com/blog/typescript-react-router-v6-inside-storybook-stories
const reactRouterDecorator: DecoratorFn = (Story) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/*" element={<Story />} />
      </Routes>
    </MemoryRouter>
  );
};


export const decorators = [providerDecorator, reactRouterDecorator];

export const parameters = {
  viewport: {
    viewports: INITIAL_VIEWPORTS
  }
};
