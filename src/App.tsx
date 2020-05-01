import React, { useState } from 'react'
import { Layout } from 'antd'
import { AppWrapper } from './App.style'
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter as Router } from 'react-router-dom'
import ViewRoutes from './views/ViewRoutes'
import { ConnectionProvider } from './contexts/ConnectionContext'

type Props = {}

const App: React.FC<Props> = (_): JSX.Element => {
  const [wide, setWide] = useState(false)
  const toggleSpace = () => {
    setWide((current) => !current)
  }

  return (
    <ConnectionProvider>
      <Router>
        <AppWrapper space={wide ? 'wide' : 'no'}>
          <Layout>
            <Header />
            <ViewRoutes />
            <Footer clickButtonHandler={toggleSpace}></Footer>
          </Layout>
        </AppWrapper>
      </Router>
    </ConnectionProvider>
  )
}

export default App
