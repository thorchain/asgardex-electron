import React, { useMemo } from 'react'

import PageTitle from '../../../components/PageTitle'
import Tabs from '../../../components/Tabs'
import { KeystoreView } from './KeystoreView'
import { PhraseView } from './PhraseView'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

export const CreateView = () => {
  const items = useMemo(
    () => [
      { key: TabKey.KEYSTORE, label: 'keystore', content: <KeystoreView /> },
      { key: TabKey.PHRASE, label: 'phrase', content: <PhraseView /> }
    ],
    []
  )

  return (
    <>
      <PageTitle>create new wallet</PageTitle>
      <Tabs tabs={items} />
    </>
  )
}
