import React, { useMemo } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AddWallet } from '../wallet/AddWallet'
import * as Styled from './Stake.styles'

type Props = {
  asset: Asset
  ShareContent: React.ComponentType<{ asset: Asset }>
  TopContent: React.ComponentType
  AddStake: React.ComponentType<{ asset: Asset }>
  keystoreState: KeystoreState
}

export const Stake: React.FC<Props> = (props) => {
  const { ShareContent, TopContent, AddStake, asset, keystoreState } = props
  const intl = useIntl()

  const walletIsImported = useMemo(() => hasImportedKeystore(keystoreState), [keystoreState])
  const walletIsLocked = useMemo(() => isLocked(keystoreState), [keystoreState])

  const tabs = useMemo(
    () => [
      { label: intl.formatMessage({ id: 'common.add' }), key: 'add', content: <AddStake asset={asset} /> },
      { label: intl.formatMessage({ id: 'stake.withdraw' }), key: 'withdraw', content: 'withdraw' }
    ],
    [intl, asset]
  )

  const extra = useMemo(
    () => (
      <Styled.AdvancedButton color="primary" typevalue="outline">
        {intl.formatMessage({ id: 'stake.advancedMode' })}
      </Styled.AdvancedButton>
    ),
    [intl]
  )

  return (
    <Styled.Container>
      <Styled.TopContainer>
        <TopContent />
      </Styled.TopContainer>
      <Styled.ContentContainer>
        {walletIsImported && !walletIsLocked ? (
          <>
            <Styled.TotalContainer>
              <ShareContent asset={asset} />
            </Styled.TotalContainer>
            <Styled.StakeContentContainer>
              <Styled.Tabs tabs={tabs} centered={false} tabBarExtraContent={extra} />
            </Styled.StakeContentContainer>
          </>
        ) : (
          <AddWallet isLocked={walletIsImported && walletIsLocked} />
        )}
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
