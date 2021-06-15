import React, { useCallback, useMemo, useRef, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, formatAssetAmount, assetToString, AssetAmount } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../../shared/api/types'
import { sequenceSOption, sequenceTOption } from '../../../../helpers/fpHelpers'
import { loadingString, emptyString } from '../../../../helpers/stringHelper'
import { getAssetAmountByAsset } from '../../../../helpers/walletHelper'
import { NonEmptyWalletBalances } from '../../../../services/wallet/types'
import { QRCodeModal } from '../../qrCodeModal/QRCodeModal'
import { AssetIcon } from '../assetIcon'
import * as Styled from './AssetInfo.style'

type Props = {
  asset: O.Option<Asset>
  // balances are optional:
  // No balances == don't render price
  // balances == render price
  assetsWB?: O.Option<NonEmptyWalletBalances>
  walletInfo?: O.Option<{
    address: Address
    network: Network
  }>
  network: Network
}

export const AssetInfo: React.FC<Props> = (props): JSX.Element => {
  const { assetsWB = O.none, asset: oAsset, walletInfo = O.none, network } = props

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const previousBalance = useRef<O.Option<AssetAmount>>(O.none)

  const [showQrModal, setShowQrModal] = useState(false)

  const renderAssetIcon = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.map((asset) => <AssetIcon asset={asset} size="large" key={assetToString(asset)} network={network} />),
        O.getOrElse(() => <></>)
      ),
    [oAsset, network]
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
        sequenceSOption({ walletInfo, oAsset }),
        O.map(({ walletInfo: { address, network }, oAsset: asset }) => (
          <Styled.AddressContainer key={'addres info'}>
            <Styled.AddressEllipsis enableCopy network={network} chain={asset.chain} address={address} />
            {additionalContent}
          </Styled.AddressContainer>
        )),
        O.getOrElse(() => <></>)
      ),
    [walletInfo, oAsset]
  )

  const addressControls = useMemo(
    () => renderAddress(<Styled.QrcodeOutlined onClick={() => setShowQrModal(true)} />),
    [renderAddress, setShowQrModal]
  )

  const closeQrModal = useCallback(() => setShowQrModal(false), [setShowQrModal])

  const renderQRCodeModal = useMemo(() => {
    const oShowQrModal = showQrModal ? O.some('') : O.none
    return FP.pipe(
      sequenceTOption(oAsset, walletInfo, oShowQrModal),
      O.map(([asset, { address }, _]) => (
        <QRCodeModal
          key="qr-modal"
          asset={asset}
          address={address}
          network={network}
          visible={showQrModal}
          onCancel={closeQrModal}
          onOk={closeQrModal}
        />
      )),
      O.getOrElse(() => <></>)
    )
  }, [showQrModal, oAsset, walletInfo, network, closeQrModal])

  return (
    <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
      {renderQRCodeModal}
      {renderAssetIcon}
      <Styled.CoinInfoWrapper>
        <Styled.CoinTitle>
          {FP.pipe(
            oAsset,
            O.map(({ ticker }) => ticker),
            O.getOrElse(() => loadingString)
          )}
        </Styled.CoinTitle>
        <Styled.CoinSubtitle>
          {FP.pipe(
            oAsset,
            O.map((asset) => asset.chain),
            O.getOrElse(() => loadingString)
          )}
        </Styled.CoinSubtitle>
        {!isDesktopView && (
          <Styled.InfoContainer>
            {addressControls}
            <Styled.CoinPrice>{renderBalance}</Styled.CoinPrice>
          </Styled.InfoContainer>
        )}
      </Styled.CoinInfoWrapper>
      {isDesktopView && (
        <Styled.InfoContainer>
          {addressControls}
          <Styled.CoinPrice>{renderBalance}</Styled.CoinPrice>
        </Styled.InfoContainer>
      )}
    </Styled.Card>
  )
}
