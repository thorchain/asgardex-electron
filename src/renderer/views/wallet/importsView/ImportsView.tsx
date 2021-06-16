import React, { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { PageTitle } from '../../../components/page/PageTitle'
import { Tabs } from '../../../components/tabs'
import { ImportKeystore } from '../../../components/wallet/keystore'
import { ImportPhrase } from '../../../components/wallet/phrase/'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './ImportsView.style'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

export const ImportsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const history = useHistory()
  const { keystoreService } = useWalletContext()
  const { importKeystore$, loadKeystore$ } = keystoreService

  const [activeTab, setActiveTab] = useState(TabKey.KEYSTORE)

  const items = useMemo(
    () => [
      {
        key: TabKey.KEYSTORE,
        label: (
          <span onClick={() => history.push(walletRoutes.imports.keystore.template)}>
            {intl.formatMessage({ id: 'common.keystore' })}
          </span>
        ),
        content: <ImportKeystore loadKeystore$={loadKeystore$} importKeystore$={importKeystore$} />
      },
      {
        key: TabKey.PHRASE,
        label: (
          <span onClick={() => history.push(walletRoutes.imports.phrase.template)}>
            {intl.formatMessage({ id: 'common.phrase' })}
          </span>
        ),
        content: <ImportPhrase />
      }
    ],
    [history, importKeystore$, intl, loadKeystore$]
  )

  /**
   * Need to initial sync tabs' state with history.
   * Call only for onMount
   */
  useEffect(() => {
    history.replace(walletRoutes.imports.phrase.path())
  }, [history])

  /**
   * Need to sync tabs' state with history
   */
  useEffect(() => {
    return history.listen((location) => {
      if (location.pathname.includes(walletRoutes.imports.keystore.template)) {
        setActiveTab(TabKey.KEYSTORE)
      } else if (location.pathname.includes(walletRoutes.imports.phrase.template)) {
        setActiveTab(TabKey.PHRASE)
      }
    })
  }, [history, activeTab])

  return (
    <Styled.ImportsViewWrapper>
      <PageTitle>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</PageTitle>
      <Tabs tabs={items} defaultTabIndex={1} activeTabKey={activeTab} />
    </Styled.ImportsViewWrapper>
  )
}
