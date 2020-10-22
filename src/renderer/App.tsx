import React from 'react'

import { HashRouter as Router } from 'react-router-dom'

import { AppProvider } from './contexts/AppContext'
import { BinanceProvider } from './contexts/BinanceContext'
import { BitcoinProvider } from './contexts/BitcoinContext'
import { EthereumProvider } from './contexts/EthereumContext'
import { I18nProvider } from './contexts/I18nContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { WalletProvider } from './contexts/WalletContext'
import { AppView } from './views/app/AppView'

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
