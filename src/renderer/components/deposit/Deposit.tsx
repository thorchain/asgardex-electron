import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { WalletAddress } from '../../../shared/wallet/types'
import { eqAddress, eqOAddress } from '../../helpers/fp/eq'
import { PoolDetailRD, PoolShareRD, PoolSharesRD } from '../../services/midgard/types'
import { getSharesByAssetAndType } from '../../services/midgard/utils'
import { MimirHalt } from '../../services/thorchain/types'
import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AssetWithDecimal } from '../../types/asgardex'
import { Props as SymDepositContentProps } from '../../views/deposit/add/SymDepositView.types'
import { Props as WidthdrawContentProps } from '../../views/deposit/withdraw/WithdrawDepositView.types'
import { AddWallet } from '../wallet/add'
import * as Styled from './Deposit.styles'

type TabKey = 'deposit-sym' | 'deposit-asym' | 'withdraw-sym' | 'withdraw-asym-asset'

type Tab = {
  key: TabKey
  label: string
  disabled: boolean
  content: JSX.Element
}

export type Props = {
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  asset: AssetWithDecimal
  shares: PoolSharesRD
  poolDetail: PoolDetailRD
  ShareContent: React.ComponentType<{
    asset: AssetWithDecimal
    poolShare: PoolShareRD
    smallWidth?: boolean
    poolDetail: PoolDetailRD
  }>
  // TODO (@Veado) Temporary disabled #827
  // AsymDepositContent: React.ComponentType<{ asset: Asset; poolDetail: PoolDetailRD; haltedChains: Chain[] }>
  SymDepositContent: React.ComponentType<SymDepositContentProps>
  WidthdrawContent: React.ComponentType<WidthdrawContentProps>
  // TODO (@Veado) Temporary disabled #827
  // AsymWidthdrawContent: React.ComponentType<{
  //   asset: Asset
  //   poolShare: PoolShareRD
  //   poolDetail: PoolDetailRD
  //   haltedChains: Chain[]
  //   mimirHalt: MimirHalt
  // }>
  keystoreState: KeystoreState
  runeWalletAddress: WalletAddress
  assetWalletAddress: WalletAddress
}

export const Deposit: React.FC<Props> = (props) => {
  const {
    asset: assetWD,
    ShareContent,
    haltedChains,
    mimirHalt,
    // TODO (@Veado) Temporary disabled #827
    // AsymDepositContent,
    SymDepositContent,
    WidthdrawContent,
    // TODO (@Veado) Temporary disabled #827
    // AsymWidthdrawContent,
    keystoreState,
    shares: poolSharesRD,
    poolDetail: poolDetailRD,
    runeWalletAddress,
    assetWalletAddress
  } = props

  const { asset } = assetWD
  const intl = useIntl()

  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const walletIsImported = useMemo(() => hasImportedKeystore(keystoreState), [keystoreState])
  const walletIsLocked = useMemo(() => isLocked(keystoreState), [keystoreState])

  const symPoolShare: PoolShareRD = useMemo(
    () =>
      FP.pipe(
        poolSharesRD,
        RD.map((shares) => getSharesByAssetAndType({ shares, asset, type: 'sym' })),
        RD.map((oPoolShare) =>
          FP.pipe(
            oPoolShare,
            O.filter(
              ({ runeAddress, assetAddress }) =>
                // use shares of current selected addresses only
                eqOAddress.equals(runeAddress, O.some(runeWalletAddress.address)) &&
                eqAddress.equals(assetAddress, assetWalletAddress.address)
            )
          )
        )
      ),
    [asset, assetWalletAddress, poolSharesRD, runeWalletAddress]
  )

  // TODO (@Veado) Temporary disabled #827
  const _asymPoolShareAsset = useMemo(
    () =>
      FP.pipe(
        poolSharesRD,
        RD.map((shares) => getSharesByAssetAndType({ shares, asset, type: 'asym' }))
      ),
    [asset, poolSharesRD]
  )

  const hasPoolShare = (poolShare: PoolShareRD): boolean => FP.pipe(poolShare, RD.toOption, O.flatten, O.isSome)
  const hasSymPoolShare: boolean = useMemo(() => hasPoolShare(symPoolShare), [symPoolShare])
  // TODO (@Veado) Temporary disabled #827
  // const hasAsymPoolShareAsset: boolean = useMemo(() => hasPoolShare(asymPoolShareAsset), [asymPoolShareAsset])

  const tabs = useMemo(
    (): Tab[] => [
      // {
      //   key: 'deposit-asym',
      //   disabled: false,
      //   label: intl.formatMessage({ id: 'deposit.add.asym' }, { asset: asset.ticker }),
      //   content: <AsymDepositContent asset={asset} haltedChains={haltedChains} />
      // },
      {
        key: 'deposit-sym',
        disabled: false,
        label: intl.formatMessage({ id: 'deposit.add.sym' }),
        content: (
          <SymDepositContent
            poolDetail={poolDetailRD}
            asset={assetWD}
            runeWalletAddress={runeWalletAddress.address}
            assetWalletAddress={assetWalletAddress.address}
            haltedChains={haltedChains}
            mimirHalt={mimirHalt}
          />
        )
      },
      {
        key: 'withdraw-sym',
        disabled: !hasSymPoolShare,
        label: intl.formatMessage({ id: 'deposit.withdraw.sym' }),
        content: (
          <WidthdrawContent
            poolDetail={poolDetailRD}
            asset={assetWD}
            runeWalletAddress={runeWalletAddress}
            assetWalletAddress={assetWalletAddress}
            poolShare={symPoolShare}
            haltedChains={haltedChains}
            mimirHalt={mimirHalt}
          />
        )
      }
      // {
      //   key: 'withdraw-asym-asset',
      //   disabled: !hasAsymPoolShareAsset,
      //   label: intl.formatMessage({ id: 'deposit.withdraw.asym' }, { asset: asset.ticker }),
      //   content: <AsymWidthdrawContent asset={asset} poolShare={asymPoolShareAsset} haltedChains={haltedChains} />
      // }
    ],
    [
      intl,
      SymDepositContent,
      poolDetailRD,
      assetWD,
      runeWalletAddress,
      assetWalletAddress,
      haltedChains,
      mimirHalt,
      hasSymPoolShare,
      WidthdrawContent,
      symPoolShare
    ]
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
              <Styled.ShareContentWrapper alignTop={hasSymPoolShare}>
                <ShareContent
                  poolDetail={poolDetailRD}
                  asset={assetWD}
                  poolShare={symPoolShare}
                  smallWidth={!isDesktopView}
                />
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
