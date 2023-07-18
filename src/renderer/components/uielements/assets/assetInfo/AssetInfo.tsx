import React, { useCallback, useMemo, useRef, useState } from 'react'

import { Address } from '@xchainjs/xchain-util'
import { Asset, formatAssetAmount, assetToString, AssetAmount } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { sequenceSOption, sequenceTOption } from '../../../../helpers/fpHelpers'
import { loadingString, emptyString } from '../../../../helpers/stringHelper'
import { getAssetAmountByAsset } from '../../../../helpers/walletHelper'
import { NonEmptyWalletBalances } from '../../../../services/wallet/types'
import { QRCodeModal } from '../../qrCodeModal/QRCodeModal'
import { AssetIcon } from '../assetIcon'
import * as Styled from './AssetInfo.styles'

type Props = {
  asset: O.Option<Asset>
  // balances are optional:
  // No balances == don't render price
  // balances == render price
  assetsWB?: O.Option<NonEmptyWalletBalances>
  walletInfo?: O.Option<{
    address: Address
    network: Network
    walletType: WalletType
  }>
  network: Network
}

export const AssetInfo: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const { assetsWB = O.none, asset: oAsset, walletInfo: oWalletInfo = O.none, network } = props

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const previousBalance = useRef<O.Option<AssetAmount>>(O.none)

  const [showQRModal, setShowQRModal] = useState<O.Option<Address>>(O.none)

  const renderAssetIcon = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.map((asset) => <AssetIcon asset={asset} size="large" key={assetToString(asset)} network={network} />),
        O.getOrElse(() => <></>)
      ),
    [oAsset, network]
  )

  const renderLedgerWalletType = useMemo(
    () =>
      FP.pipe(
        oWalletInfo,
        O.filter(({ walletType }) => isLedgerWallet(walletType)),
        O.map((walletInfo) => (
          <Styled.WalletTypeLabel key={walletInfo.address}>
            {intl.formatMessage({ id: 'ledger.title' })}
          </Styled.WalletTypeLabel>
        )),
        O.getOrElse(() => <></>)
      ),
    [intl, oWalletInfo]
  )

  const renderBalance = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(assetsWB, oAsset),
        O.fold(
          () =>
            FP.pipe(
              previousBalance.current,
              O.map((amount) => formatAssetAmount({ amount, trimZeros: true })),
              O.getOrElse(() => emptyString)
            ),
          ([assetsWB, asset]) =>
            FP.pipe(
              getAssetAmountByAsset(assetsWB, asset),
              // save latest amount (if available only)
              O.map((amount) => {
                previousBalance.current = O.some(amount)
                return amount
              }),
              // use previous stored balances if amount is not available,
              // because `assetsWB` is loaded in parallel for all assets of different chains
              O.alt(() => previousBalance.current),
              O.map((amount) => formatAssetAmount({ amount, trimZeros: true })),
              O.getOrElse(() => loadingString)
            )
        )
      ),
    [oAsset, assetsWB]
  )

  const renderAddress = useCallback(
    (additionalContent: JSX.Element | null = null) =>
      FP.pipe(
        sequenceSOption({ walletInfo: oWalletInfo, asset: oAsset }),
        O.map(({ walletInfo: { address, network }, asset }) => (
          <Styled.AddressContainer key={'addres info'}>
            <Styled.AddressEllipsis enableCopy network={network} chain={asset.chain} address={address} />
            {additionalContent}
          </Styled.AddressContainer>
        )),
        O.getOrElse(() => <></>)
      ),
    [oWalletInfo, oAsset]
  )

  const renderQRIcon = useMemo(() => {
    const oAddress = () =>
      FP.pipe(
        oWalletInfo,
        O.map(({ address }) => address)
      )

    return renderAddress(<Styled.QrcodeOutlined onClick={() => setShowQRModal(oAddress)} />)
  }, [oWalletInfo, renderAddress])

  const closeQrModal = useCallback(() => setShowQRModal(O.none), [setShowQRModal])

  const renderQRCodeModal = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oAsset, showQRModal),
      O.map(([asset, address]) => (
        <QRCodeModal
          key="qr-modal"
          asset={asset}
          address={address}
          network={network}
          visible={true}
          onCancel={closeQrModal}
          onOk={closeQrModal}
        />
      )),
      O.getOrElse(() => <></>)
    )
  }, [showQRModal, oAsset, network, closeQrModal])

  return (
    <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
      {renderQRCodeModal}
      {renderAssetIcon}
      <Styled.AssetInfoWrapper>
        <Styled.AssetTitleWrapper>
          <Styled.AssetTitle>
            {FP.pipe(
              oAsset,
              O.map(({ ticker }) => ticker),
              O.getOrElse(() => loadingString)
            )}
          </Styled.AssetTitle>
          {renderLedgerWalletType}
        </Styled.AssetTitleWrapper>
        <Styled.AssetSubtitle>
          {FP.pipe(
            oAsset,
            O.map(({ chain, synth }) => (synth ? 'synth' : chain)),
            O.getOrElse(() => loadingString)
          )}
        </Styled.AssetSubtitle>
        {!isDesktopView && (
          <Styled.InfoContainer>
            {renderQRIcon}
            <Styled.AssetPrice>{renderBalance}</Styled.AssetPrice>
          </Styled.InfoContainer>
        )}
      </Styled.AssetInfoWrapper>
      {isDesktopView && (
        <Styled.InfoContainer>
          {renderQRIcon}
          <Styled.AssetPrice>{renderBalance}</Styled.AssetPrice>
        </Styled.InfoContainer>
      )}
    </Styled.Card>
  )
}
