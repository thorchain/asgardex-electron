import React from 'react'

import { HashRouter as Router } from 'react-router-dom'

import { AppProvider } from './contexts/AppContext'
import { BinanceProvider } from './contexts/BinanceContext'
import { BitcoinProvider } from './contexts/BitcoinContext'
import { ChainProvider } from './contexts/ChainContext'
import { EthereumProvider } from './contexts/EthereumContext'
import { I18nProvider } from './contexts/I18nContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThorchainProvider } from './contexts/ThorchainContext'
import { UserNodesProvider } from './contexts/UserNodesContext'
import { WalletProvider } from './contexts/WalletContext'
import { AppView } from './views/app/AppView'

export const App: React.FC = (): JSX.Element => {
  return (
    <AppProvider>
      <WalletProvider>
        <ChainProvider>
          <ThorchainProvider>
            <BinanceProvider>
              <BitcoinProvider>
                <EthereumProvider>
                  <MidgardProvider>
                    <UserNodesProvider>
                      <I18nProvider>
                        <Router>
                          <ThemeProvider>
                            <AppView />
                          </ThemeProvider>
                        </Router>
                      </I18nProvider>
                    </UserNodesProvider>
                  </MidgardProvider>
                </EthereumProvider>
              </BitcoinProvider>
            </BinanceProvider>
          </ThorchainProvider>
        </ChainProvider>
      </WalletProvider>
    </AppProvider>
  )
}
