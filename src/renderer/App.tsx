import React from 'react'

import { HashRouter as Router } from 'react-router-dom'

import { AppWrapper, AppLayout } from './App.style'
import { Footer } from './components/footer'
import { Header } from './components/header/Header'
import { AppProvider } from './contexts/AppContext'
import { BinanceProvider } from './contexts/BinanceContext'
import { BitcoinProvider } from './contexts/BitcoinContext'
import { EthereumProvider } from './contexts/EthereumContext'
import { I18nProvider } from './contexts/I18nContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { WalletProvider } from './contexts/WalletContext'
import { envOrDefault } from './helpers/envHelper'
import { View } from './views/View'
import { ViewRoutes } from './views/ViewRoutes'

export const AppView: React.FC = (): JSX.Element => {
  return (
    <>
      <AppWrapper>
        <AppLayout>
          <Header />
          <View>
            <ViewRoutes />
          </View>
          <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
        </AppLayout>
      </AppWrapper>
    </>
  )
}

export const App: React.FC = (): JSX.Element => {
  return (
    <AppProvider>
      <WalletProvider>
        <BinanceProvider>
          <BitcoinProvider>
            <EthereumProvider>
              <MidgardProvider>
                <I18nProvider>
                  <Router>
                    <ThemeProvider>
                      <AppView />
                    </ThemeProvider>
                  </Router>
                </I18nProvider>
              </MidgardProvider>
            </EthereumProvider>
          </BitcoinProvider>
        </BinanceProvider>
      </WalletProvider>
    </AppProvider>
  )
}
