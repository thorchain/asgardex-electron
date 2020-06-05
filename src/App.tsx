import React from 'react'

import { Layout } from 'antd'
import { BrowserRouter as Router } from 'react-router-dom'

import { AppWrapper } from './App.style'
import Footer from './components/Footer'
import Header from './components/header/Header'
import { BinanceProvider } from './contexts/BinanceContext'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { I18nProvider } from './contexts/I18nContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { WalletProvider } from './contexts/WalletContext'
import GlobalStyle from './Global.style'
import { envOrDefault } from './helpers/envHelper'
import ViewRoutes from './views/ViewRoutes'

type Props = {}

const AppView: React.FC<Props> = (_): JSX.Element => {
  return (
    <>
      <GlobalStyle />
      <AppWrapper>
        <Layout>
          <Header />
          <ViewRoutes />
          <Footer commitHash={envOrDefault($COMMIT_HASH, '')}></Footer>
        </Layout>
      </AppWrapper>
    </>
  )
}

const App: React.FC<Props> = (_): JSX.Element => {
  return (
    <ConnectionProvider>
      <BinanceProvider>
        <MidgardProvider>
          <WalletProvider>
            <I18nProvider>
              <Router>
                <ThemeProvider>
                  <AppView />
                </ThemeProvider>
              </Router>
            </I18nProvider>
          </WalletProvider>
        </MidgardProvider>
      </BinanceProvider>
    </ConnectionProvider>
  )
}

export default App
