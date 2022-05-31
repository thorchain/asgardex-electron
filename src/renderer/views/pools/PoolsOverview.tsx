import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { PoolType } from '../../services/midgard/types'
import { isLocked } from '../../services/wallet/util'
import { ActivePools } from './ActivePools'
import { PendingPools } from './PendingPools'
import * as Styled from './PoolsOverview.styles'

type Tab = {
  key: PoolType
  label: string
  content: JSX.Element
}

export const PoolsOverview: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, O.none)

  const [activeTabKey, setActiveTabKey] = useState('active')

  const {
    service: {
      pools: { haltedChains$ }
    }
  } = useMidgardContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])

  const { mimirHalt } = useMimirHalt()

  const tabs = useMemo(
    (): Tab[] => [
      {
        key: 'active',
        label: intl.formatMessage({ id: 'pools.available' }),
        content: <ActivePools haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={isLocked(keystore)} />
      },
      {
        key: 'pending',
        label: intl.formatMessage({ id: 'pools.pending' }),
        content: <PendingPools haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={isLocked(keystore)} />
      }
    ],
    [intl, haltedChains, mimirHalt, keystore]
  )

  const renderTabBar = useCallback(
    () => (
      <Styled.TabButtonsContainer>
        {tabs.map(({ key, label }) => (
          <Styled.TabButton key={key} selected={key === activeTabKey} onClick={() => setActiveTabKey(key)}>
            {label}
          </Styled.TabButton>
        ))}
      </Styled.TabButtonsContainer>
    ),
    [activeTabKey, tabs]
  )

  return (
    <>
      <Styled.TabButtonsContainer>
        <Styled.Tabs renderTabBar={renderTabBar} activeKey={activeTabKey}>
          {tabs.map(({ key, label, content }) => (
            <Styled.TabPane tab={label} key={key}>
              {content}
            </Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.TabButtonsContainer>
    </>
  )
}
