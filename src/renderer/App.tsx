import React from 'react'

import { shell } from 'electron'
import { HashRouter as Router } from 'react-router-dom'

import { AppWrapper, AppLayout } from './App.style'
import Footer from './components/Footer'
import Header from './components/header/Header'
import { AppProvider } from './contexts/AppContext'
import { BinanceProvider } from './contexts/BinanceContext'
import { I18nProvider } from './contexts/I18nContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { WalletProvider } from './contexts/WalletContext'
import { envOrDefault } from './helpers/envHelper'
import View from './views/View'
import ViewRoutes from './views/ViewRoutes'

type Props = {}

const AppView: React.FC<Props> = (_): JSX.Element => {
  return (
    <>
      <AppWrapper>
        <AppLayout>
          <Header />
          <View>
            <ViewRoutes />
          </View>
          <Footer
            commitHash={envOrDefault($COMMIT_HASH, '')}
            openExternal={shell.openExternal}
            isDev={$IS_DEV}></Footer>
        </AppLayout>
      </AppWrapper>
    </>
  )
}

const App: React.FC<Props> = (_): JSX.Element => {
  return (
    <AppProvider>
      <WalletProvider>
        <BinanceProvider>
          <MidgardProvider>
            <I18nProvider>
              <Router>
                <ThemeProvider>
                  <AppView />
                </ThemeProvider>
              </Router>
            </I18nProvider>
          </MidgardProvider>
        </BinanceProvider>
      </WalletProvider>
    </AppProvider>
  )
}

export default App
