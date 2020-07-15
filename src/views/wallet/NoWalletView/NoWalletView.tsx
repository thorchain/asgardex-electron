import React, { useMemo } from 'react'

// import { useIntl } from 'react-intl'

import Tabs from '../../../components/Tabs'
import { MainnetView } from './MainnetView'

enum TabKey {
  TESTNET = 'testnet',
  MAINNET = 'mainnet'
}

type Tab = {
  key: TabKey
  label: string
  content: React.ReactNode
}

const NoWalletView = () => {
  // const intl = useIntl()
  const items: Tab[] = useMemo(
    () => [
      { key: TabKey.TESTNET, label: 'testnet', content: <span>testnet</span> },
      { key: TabKey.MAINNET, label: 'mainnet', content: <MainnetView /> }
    ],
    []
  )

  return <Tabs centerContent={true} tabs={items} defaultTabIndex={1} />
}

export default NoWalletView
