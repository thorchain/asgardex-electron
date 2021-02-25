import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { PoolShareRD } from '../../services/midgard/types'
import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AddWallet } from '../wallet/add'
import * as Styled from './Deposit.styles'

type TabKey = 'deposit-sym' | 'deposit-asym' | 'withdraw'

type Tab = {
  key: TabKey
  label: string
  content: JSX.Element
}

export type Props = {
  asset: Asset
  asymPoolShare: PoolShareRD
  symPoolShare: PoolShareRD
  ShareContent: React.ComponentType<{ asset: Asset; poolShare: PoolShareRD; smallWidth?: boolean }>
  AsymDepositContent: React.ComponentType<{ asset: Asset }>
  SymDepositContent: React.ComponentType<{ asset: Asset }>
  WidthdrawContent: React.ComponentType<{ asset: Asset; poolShare: PoolShareRD }>
  keystoreState: KeystoreState
}

export const Deposit: React.FC<Props> = (props) => {
  const { ShareContent, SymDepositContent, WidthdrawContent, asset, keystoreState, symPoolShare } = props
  const intl = useIntl()

  const walletIsImported = useMemo(() => hasImportedKeystore(keystoreState), [keystoreState])
  const walletIsLocked = useMemo(() => isLocked(keystoreState), [keystoreState])

  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const tabs = useMemo(
    (): Tab[] => [
      // TODO (@Veado) enable with #827 https ://github.com/thorchain/asgardex-electron/issues/827
      // AsymDepositContent component should be received from props
      // {
      //   key: 'deposit-asym',
      //   label: intl.formatMessage({ id: 'deposit.add.asym' }, { asset: asset.ticker }),
      //   content: <AsymDepositContent asset={asset} />
      // },
      {
        key: 'deposit-sym',
        label: intl.formatMessage({ id: 'deposit.add.sym' }, { assetA: asset.ticker, assetB: AssetRuneNative.ticker }),
        content: <SymDepositContent asset={asset} />
      },
      {
        key: 'withdraw',
        label: intl.formatMessage({ id: 'deposit.withdraw' }),
        content: <WidthdrawContent asset={asset} poolShare={symPoolShare} />
      }
    ],
    [intl, asset, SymDepositContent, WidthdrawContent, symPoolShare]
  )

  const alignTopShareContent: boolean = useMemo(
    () =>
      FP.pipe(
        symPoolShare,
        RD.toOption,
        O.flatten,
        O.fold(
          () => false,
          () => true
        )
      ),
    [symPoolShare]
  )

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        {walletIsImported && !walletIsLocked ? (
          <>
            <Styled.DepositContentCol xs={24} xl={15}>
              <Styled.Tabs destroyInactiveTabPane tabs={tabs} centered={false} defaultActiveKey="deposit-sym" />
            </Styled.DepositContentCol>
            <Styled.ShareContentCol xs={24} xl={9}>
              <Styled.ShareContentWrapper alignTop={alignTopShareContent}>
                <ShareContent smallWidth={!isDesktopView} asset={asset} poolShare={symPoolShare} />
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
