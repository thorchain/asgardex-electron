import React, { useMemo } from 'react'

import { Tabs, Row } from 'antd'
import { useIntl } from 'react-intl'

import BackLink from '../../../components/uielements/backLink'
import Headline from '../../../components/uielements/headline'
import ImportPhrase from '../../../components/wallet/ImportPhrase'
import * as Styled from './ImportsView.style'

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
        <Tabs.TabPane tab={<Styled.TabLabel>{label}</Styled.TabLabel>} key={key}>
          {content}
        </Tabs.TabPane>
      )),
    [items]
  )

  return (
    <Styled.ImportsViewWrapper>
      <div style={{ position: 'absolute' }}>
        <BackLink />
      </div>
      <Row style={{ justifyContent: 'center' }}>
        <Headline>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</Headline>
      </Row>
      <Styled.Tabs activeKey={TabKey.PHRASE}>{tabs}</Styled.Tabs>
    </Styled.ImportsViewWrapper>
  )
}
export default ImportsView
