import React, { useState, useMemo, useEffect } from 'react'

import { Asset } from '@thorchain/asgardex-util'

import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import * as Styled from './AssetIcon.style'
import { Size } from './types'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size
  asset: Asset
}

const AssetIcon: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, size = 'big' } = props
  const [error, setError] = useState(false)

  const imgUrl = useMemo(() => {
    const { symbol, ticker } = asset
    let assetId = symbol

    if (ticker === 'RUNE') {
      assetId = 'RUNE-B1A'
    }
    // currently we do load assets for Binance chain only
    const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${assetId}/logo.png`
    console.log('url', url)
    return url
  }, [asset])

  const renderIcon = useMemo(
    () => (
      <Styled.IconWrapper size={size}>
        <Styled.Icon src={imgUrl} size={size} onError={() => setError(true)} />{' '}
      </Styled.IconWrapper>
    ),
    [imgUrl, size]
  )
  useEffect(() => console.log('size', size), [size])

  const renderFallbackIcon = useMemo(() => {
    const { ticker = '' } = asset
    const gradientColors = () => {
      const numbers = getIntFromName(ticker)
      const start = rainbowStop(numbers[0])
      const stop = rainbowStop(numbers[1])
      return `linear-gradient(45deg,${start},${stop})`
    }
    return (
      <Styled.IconWrapper size={size}>
        <Styled.IconFallback style={{ backgroundImage: gradientColors() }} size={size}>
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
