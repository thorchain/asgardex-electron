import React, { useMemo } from 'react'

import { Tabs, Row } from 'antd'
import { useIntl } from 'react-intl'

import BackLink from '../../../components/uielements/backLink'
import Label from '../../../components/uielements/label'
import ImportPhrase from '../../../components/wallet/ImportPhrase'
import { ImportsViewWrapper, TabLabel } from './ImportsView.style'

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
  const intl = useIntl()
  const items: Tab[] = useMemo(
    () => [
      { key: TabKey.PHRASE, label: intl.formatMessage({ id: 'wallet.imports.phrase' }), content: <ImportPhrase /> }
    ],
    [intl]
  )

  const tabs = useMemo(
    () =>
      items.map(({ label, key, content }) => (
        <Tabs.TabPane tab={<TabLabel>{label}</TabLabel>} key={key}>
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
      <div style={{ height: '95%' }}>
        <Tabs activeKey={TabKey.PHRASE} size="large">
          {tabs}
        </Tabs>
      </div>
    </ImportsViewWrapper>
  )
}
export default ImportsView
