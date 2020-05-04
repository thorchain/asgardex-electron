import React from 'react'
import { Layout } from 'antd'
import { AppWrapper } from './App.style'
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter as Router } from 'react-router-dom'
import ViewRoutes from './views/ViewRoutes'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { MidgardProvider } from './contexts/MidgardContext'
import { ThemeProvider } from './contexts/ThemeContext'

type Props = {}

const App: React.FC<Props> = (_): JSX.Element => {
  return (
    <ConnectionProvider>
      <ThemeProvider>
        <MidgardProvider>
          <Router>
            <AppWrapper>
              <Layout>
                <Header />
                <ViewRoutes />
                <Footer></Footer>
              </Layout>
            </AppWrapper>
          </Router>
        </MidgardProvider>
      </ThemeProvider>
    </ConnectionProvider>
  )
}

export default App
