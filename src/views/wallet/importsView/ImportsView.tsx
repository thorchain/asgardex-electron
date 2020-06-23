import React, { useMemo } from 'react'

import { Tabs, Row } from 'antd'

import BackLink from '../../../components/uielements/backLink'
import Label from '../../../components/uielements/label'
import ImportPhrase from '../../../components/wallet/ImportPhrase'
import { ImportsViewWrapper } from './ImportsView.style'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

type Tab = {
  key: TabKey
  label: string
  content: React.ReactNode
}

const ImportsView: React.FC = (): JSX.Element => {
  const items = useMemo(() => [{ key: TabKey.PHRASE, label: 'Phrase', content: <ImportPhrase /> }] as Tab[], [])

  const tabs = useMemo(
    () =>
      items.map(({ label, key, content }) => (
        <Tabs.TabPane
          tab={
            <Row>
              <Label style={{ padding: 0, paddingLeft: 20, paddingRight: 20 }}>{label}</Label>
            </Row>
          }
          key={key}>
          {content}
        </Tabs.TabPane>
      )),
    [items]
  )

  return (
    <ImportsViewWrapper>
      <div style={{ position: 'absolute' }}>
        <BackLink />
      </div>
      <Row style={{ justifyContent: 'center' }}>
        <Label size="big" style={{ padding: 0 }}>
          IMPORT EXISTING WALLET
        </Label>
      </Row>
      <div>
        <Tabs activeKey={TabKey.PHRASE} size="large" tabBarStyle={{ justifyItems: 'center' }}>
          {tabs}
        </Tabs>
      </div>
    </ImportsViewWrapper>
  )
}
export default ImportsView
