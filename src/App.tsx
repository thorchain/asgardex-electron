import React, { useState } from 'react'
import { Button, Layout } from 'antd'
import { AppWrapper } from './App.style'
import Header from './AppHeader'
import { BrowserRouter as Router } from 'react-router-dom'
import AppContent from './AppContent'

type Props = {}

const App: React.FC<Props> = (_): JSX.Element => {
  const [wide, setWide] = useState(false)
  const toggleSpace = (_: React.MouseEvent<HTMLElement>) => {
    setWide((current) => !current)
  }

  return (
    <Router>
      <AppWrapper space={wide ? 'wide' : 'no'}>
        <Layout>
          <Header />
          <AppContent />
          <Layout.Footer style={{ backgroundColor: '#000' }}>
            <Button type="primary" size="large" onClick={toggleSpace}>
              Toggle Space
            </Button>
          </Layout.Footer>
        </Layout>
      </AppWrapper>
    </Router>
  )
}

export default App
