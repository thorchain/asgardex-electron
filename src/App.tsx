import React from 'react'
import { Layout } from 'antd'
import { AppWrapper } from './App.style'
import GlobalStyle from './Global.style'
import Header from './components/header/Header'
import Footer from './components/Footer'
import { BrowserRouter as Router } from 'react-router-dom'
import ViewRoutes from './views/ViewRoutes'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import { envOrDefault } from './helpers/envHelper'

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
      <MidgardProvider>
        <I18nProvider>
          <Router>
            <ThemeProvider>
              <AppView />
            </ThemeProvider>
          </Router>
        </I18nProvider>
      </MidgardProvider>
    </ConnectionProvider>
  )
}

export default App
