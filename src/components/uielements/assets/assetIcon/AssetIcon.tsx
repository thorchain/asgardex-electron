import React, { useState, useMemo, useCallback } from 'react'

import { Asset, AssetTicker } from '@thorchain/asgardex-util'

import bnbIcon from '../../../../assets/svg/coin-bnb.svg'
import runeIcon from '../../../../assets/svg/rune-flash-icon.svg'
import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import * as Styled from './AssetIcon.style'
import { Size } from './types'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size
  asset: Asset
}

const AssetIcon: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, size = 'normal' } = props
  const [error, setError] = useState(false)

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

  const onErrorHandler = useCallback(() => {
    setError(true)
  }, [])

  const renderIcon = useMemo(
    () => (
      <Styled.IconWrapper size={size}>
        <Styled.Icon src={imgUrl} size={size} onError={onErrorHandler} />{' '}
      </Styled.IconWrapper>
    ),
    [imgUrl, onErrorHandler, size]
  )

  const renderFallbackIcon = useMemo(() => {
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

  return (
    <>
      {!error && renderIcon}
      {error && renderFallbackIcon}
    </>
  )
}

export default AssetIcon
