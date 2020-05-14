import React from 'react'
import { addDecorator } from '@storybook/react/dist/client/preview'
import { withKnobs } from '@storybook/addon-knobs'
import { configure } from '@storybook/react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { ConnectionProvider } from '../src/contexts/ConnectionContext'
import { MidgardProvider } from '../src/contexts/MidgardContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { I18nProvider } from '../src/contexts/I18nContext'
import { AppWrapper } from '../src/App.style'

addDecorator(withKnobs)

addDecorator((story) => (
  <ConnectionProvider>
    <MidgardProvider>
      <I18nProvider>
        <ThemeProvider>
          <AppWrapper>{story()}</AppWrapper>
        </ThemeProvider>
      </I18nProvider>
    </MidgardProvider>
  </ConnectionProvider>
))

addDecorator((story) => (
  <Router>
    <Route path="/" component={() => story()} />
  </Router>
))

const req = require.context('../src', true, /\.stories\.(js|ts|tsx)$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)
