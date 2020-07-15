import React, { useMemo } from 'react'

import { Row } from 'antd'
import { useIntl } from 'react-intl'

import Tabs from '../../../components/Tabs'
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

  return (
    <Styled.ImportsViewWrapper>
      <div style={{ position: 'absolute' }}>
        <BackLink />
      </div>
      <Row style={{ justifyContent: 'center' }}>
        <Headline>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</Headline>
      </Row>
      <Tabs tabs={items} />
    </Styled.ImportsViewWrapper>
  )
}
export default ImportsView
