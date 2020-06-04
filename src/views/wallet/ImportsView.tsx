import React, { useMemo } from 'react'

import { Tabs, Button } from 'antd'
import { useHistory } from 'react-router-dom'

import ImportPhrase from '../../components/wallet/ImportPhrase'
import View from '../View'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

type Tab = {
  key: TabKey
  label: string
  content: React.ReactNode
}

const WalletCreate: React.FC = (): JSX.Element => {
  const history = useHistory()

  const clickHandler = () => {
    history.goBack()
  }

  const items = useMemo(() => [{ key: TabKey.PHRASE, label: 'Phrase', content: <ImportPhrase /> }] as Tab[], [])

  const tabs = useMemo(
    () =>
      items.map(({ label, key, content }) => (
        <Tabs.TabPane tab={label} key={key}>
          {content}
        </Tabs.TabPane>
      )),
    [items]
  )

  return (
    <View>
      <Button onClick={clickHandler}>Back</Button>
      <h1>Import Existing Wallet</h1>
      <Tabs activeKey={TabKey.PHRASE} size="large">
        {tabs}
      </Tabs>
    </View>
  )
}
export default WalletCreate
