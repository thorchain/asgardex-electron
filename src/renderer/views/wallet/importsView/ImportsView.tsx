import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { PageTitle } from '../../../components/PageTitle/PageTitle'
import Tabs from '../../../components/Tabs'
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
      <PageTitle>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</PageTitle>
      <Tabs tabs={items} />
    </Styled.ImportsViewWrapper>
  )
}
export default ImportsView
