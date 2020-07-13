import React, { useMemo, useCallback } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetTicker } from '@thorchain/asgardex-util'

import bnbIcon from '../../../../assets/svg/coin-bnb.svg'
import runeIcon from '../../../../assets/svg/rune-flash-icon.svg'
import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import { useRemoteImage } from '../../../../hooks/useRemoteImage'
import * as Styled from './AssetIcon.style'
import { Size } from './types'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size
  asset: Asset
}

const AssetIcon: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, size = 'normal' } = props

  const imgUrl = useMemo(() => {
    const { symbol, ticker } = asset
    const assetId = symbol
    // currently we do load assets for Binance chain only
    // Note: Trustwallet supports asset names for mainnet only. For testnet we will use the `IconFallback` component
    let url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${assetId}/logo.png`

    if (ticker === AssetTicker.RUNE) {
      // Always use "our" Rune asset
      url = runeIcon
    }
    if (ticker === 'BNB') {
      // Since BNB is blacklisted at TrustWallet's asset, we have to use "our" own BNB icon
      // (see https://github.com/trustwallet/assets/blob/master/blockchains/binance/blacklist.json)
      url = bnbIcon
    }
    return url
  }, [asset])

  const remoteIconImage = useRemoteImage(imgUrl)

  const renderIcon = useCallback(
    (src: string) => (
      <Styled.IconWrapper size={size}>
        <Styled.Icon src={src} size={size} />{' '}
      </Styled.IconWrapper>
    ),
    [size]
  )

  const renderPendingIcon = useCallback(() => {
    return (
      <Styled.IconWrapper size={size}>
        <LoadingOutlined />
      </Styled.IconWrapper>
    )
  }, [size])
  const renderFallbackIcon = useCallback(() => {
    const { ticker } = asset
    const numbers = getIntFromName(ticker)
    const backgroundImage = `linear-gradient(45deg,${rainbowStop(numbers[0])},${rainbowStop(numbers[1])})`

    return (
      <Styled.IconWrapper size={size}>
        <Styled.IconFallback style={{ backgroundImage }} size={size}>
          {ticker}
        </Styled.IconFallback>
      </Styled.IconWrapper>
    )
  }, [asset, size])

  return RD.fold(() => <></>, renderPendingIcon, renderFallbackIcon, renderIcon)(remoteIconImage)
}

export default AssetIcon
