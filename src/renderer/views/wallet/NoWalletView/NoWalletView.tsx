import React, { useMemo } from 'react'

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
  const items: Tab[] = useMemo(() => [{ key: TabKey.MAINNET, label: 'mainnet', content: <MainnetView /> }], [])

  return <Tabs centerContent={true} tabs={items} />
}

export default NoWalletView
