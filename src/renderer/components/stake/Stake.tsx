import React, { useMemo } from 'react'

import { Asset } from '@thorchain/asgardex-util'
// import { Col } from 'antd'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AddWallet } from '../wallet/AddWallet'
import * as Styled from './Stake.styles'

type Props = {
  asset: Asset
  ShareContent: React.ComponentType<{ asset: Asset }>
  AddStake: React.ComponentType<{ asset: Asset }>
  keystoreState: KeystoreState
}

export const Stake: React.FC<Props> = (props) => {
  const { ShareContent, AddStake, asset, keystoreState } = props
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
      <Styled.ContentContainer>
        {walletIsImported && !walletIsLocked ? (
          <>
            <Styled.StakeContentCol xs={24} xl={15}>
              <Styled.Tabs tabs={tabs} centered={false} tabBarExtraContent={extra} />
            </Styled.StakeContentCol>
            <Styled.ShareContentCol xs={24} xl={9}>
              <Styled.ShareContentWrapper>
                <ShareContent asset={asset} />
              </Styled.ShareContentWrapper>
            </Styled.ShareContentCol>
          </>
        ) : (
          <AddWallet isLocked={walletIsImported && walletIsLocked} />
        )}
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
