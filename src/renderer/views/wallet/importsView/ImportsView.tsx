import React, { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageTitle } from '../../../components/page/PageTitle'
import { Tabs } from '../../../components/tabs'
import { ImportKeystore } from '../../../components/wallet/keystore'
import { ImportPhrase } from '../../../components/wallet/phrase/'
import { useWalletContext } from '../../../contexts/WalletContext'
import { useKeystoreClientStates } from '../../../hooks/useKeystoreClientStates'
import { useKeystoreRedirectAfterImport } from '../../../hooks/useKeystoreRedirectAfterImport'
import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './ImportsView.styles'

enum TabKey {
  PHRASE = 'phrase',
  KEYSTORE = 'keystore'
}

export const ImportsView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const { keystoreService } = useWalletContext()
  const { importKeystore$, loadKeystore$, addKeystore } = keystoreService
  const { clientStates } = useKeystoreClientStates()
  // redirect to wallet assets view  whenever keystore have been imported and ALL clients are initialized
  useKeystoreRedirectAfterImport()

  const [activeTab, setActiveTab] = useState(TabKey.KEYSTORE)

  const items = useMemo(
    () => [
      {
        key: TabKey.KEYSTORE,
        label: (
          <span onClick={() => navigate(walletRoutes.imports.keystore.path())}>
            {intl.formatMessage({ id: 'common.keystore' })}
          </span>
        ),
        content: (
          <ImportKeystore loadKeystore$={loadKeystore$} importKeystore$={importKeystore$} clientStates={clientStates} />
        )
      },
      {
        key: TabKey.PHRASE,
        label: (
          <span onClick={() => navigate(walletRoutes.imports.phrase.path())}>
            {intl.formatMessage({ id: 'common.phrase' })}
          </span>
        ),
        content: <ImportPhrase clientStates={clientStates} addKeystore={addKeystore} />
      }
    ],
    [addKeystore, clientStates, navigate, importKeystore$, intl, loadKeystore$]
  )

  /**
   * Need to initial sync tabs' state with history.
   * Call only for onMount
   */
  useEffect(
    () => {
      navigate(walletRoutes.imports.phrase.path(), { replace: true })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  /**
   * Need to sync tabs' state with history
   */
  useEffect(() => {
    if (location.pathname.includes(walletRoutes.imports.keystore.path())) {
      setActiveTab(TabKey.KEYSTORE)
    } else if (location.pathname.includes(walletRoutes.imports.phrase.path())) {
      setActiveTab(TabKey.PHRASE)
    }
  }, [navigate, activeTab, location.pathname])

  return (
    <Styled.ImportsViewWrapper>
      <PageTitle>{intl.formatMessage({ id: 'wallet.imports.wallet' })}</PageTitle>
      <Tabs tabs={items} defaultTabIndex={1} activeTabKey={activeTab} />
    </Styled.ImportsViewWrapper>
  )
}
