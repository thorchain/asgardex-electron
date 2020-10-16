import React, { useMemo } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { getDefaultRuneAsset } from '../../helpers/assetHelper'
import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { StakeType } from '../../types/asgardex'
import { AddWallet } from '../wallet/AddWallet'
import * as Styled from './Stake.styles'

type TabKey = 'stake-sym' | 'stake-asym' | 'withdraw'

type Tab = {
  key: TabKey
  label: string
  content: JSX.Element
}

type Props = {
  asset: Asset
  ShareContent: React.ComponentType<{ asset: Asset }>
  StakeContent: React.ComponentType<{ asset: Asset; runeAsset: Asset; type: StakeType }>
  WidthdrawContent: React.ComponentType<{ asset: Asset; runeAsset: Asset }>
  keystoreState: KeystoreState
}

export const Stake: React.FC<Props> = (props) => {
  const { ShareContent, StakeContent, WidthdrawContent, asset, keystoreState } = props
  const intl = useIntl()

  const walletIsImported = useMemo(() => hasImportedKeystore(keystoreState), [keystoreState])
  const walletIsLocked = useMemo(() => isLocked(keystoreState), [keystoreState])

  const {
    service: {
      pools: { runeAsset$ }
    }
  } = useMidgardContext()

  const runeAsset = useObservableState(runeAsset$, getDefaultRuneAsset(asset.chain))

  const tabs = useMemo(
    (): Tab[] => [
      {
        key: 'stake-sym',
        label: intl.formatMessage({ id: 'stake.add.sym' }, { asset: asset.ticker }),
        content: <StakeContent asset={asset} runeAsset={runeAsset} type="sym" />
      },
      {
        key: 'stake-asym',
        label: intl.formatMessage({ id: 'stake.add.asym' }, { assetA: asset.ticker, assetB: runeAsset.ticker }),
        content: <StakeContent asset={asset} runeAsset={runeAsset} type="asym" />
      },
      {
        key: 'withdraw',
        label: intl.formatMessage({ id: 'stake.withdraw' }),
        content: <WidthdrawContent asset={asset} runeAsset={runeAsset} />
      }
    ],
    [intl, asset, runeAsset]
  )

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        {walletIsImported && !walletIsLocked ? (
          <>
            <Styled.StakeContentCol xs={24} xl={15}>
              <Styled.Tabs tabs={tabs} centered={false} defaultTabIndex={1} />
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
