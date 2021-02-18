import React, { useMemo, useCallback } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import { useObservableState } from 'observable-hooks'

import { Network } from '../../../../../shared/api/types'
import { useAppContext } from '../../../../contexts/AppContext'
import {
  getEthTokenAddress,
  isBnbAsset,
  isBtcAsset,
  isEthAsset,
  isRuneBnbAsset,
  isRuneNativeAsset
} from '../../../../helpers/assetHelper'
import { isBnbChain, isEthChain } from '../../../../helpers/chainHelper'
import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import { useRemoteImage } from '../../../../hooks/useRemoteImage'
import { DEFAULT_NETWORK } from '../../../../services/const'
import { bnbIcon, btcIcon, ethIcon, runeIcon, bnbRuneIcon } from '../../../icons'
import * as Styled from './AssetIcon.style'
import { Size } from './AssetIcon.types'

type ComponentProps = {
  size?: Size
  asset: Asset
}

type Props = ComponentProps & React.HTMLAttributes<HTMLDivElement>

export const AssetIcon: React.FC<Props> = ({ asset, size = 'normal', className = '', ...rest }): JSX.Element => {
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const imgUrl = useMemo(() => {
    // BTC
    if (isBtcAsset(asset)) {
      return btcIcon
    }
    // ETH
    if (isEthAsset(asset)) {
      return ethIcon
    }
    // RUNE
    if (isRuneNativeAsset(asset)) {
      return runeIcon
    }
    // BNB RUNE
    if (isRuneBnbAsset(asset)) {
      return bnbRuneIcon
    }
    // BNB
    if (isBnbAsset(asset)) {
      // Since BNB is blacklisted at TrustWallet's asset, we have to use "our" own BNB icon
      // (see https://github.com/trustwallet/assets/blob/master/blockchains/binance/blacklist.json)
      return bnbIcon
    }

    if (network === 'mainnet') {
      if (isBnbChain(asset.chain)) {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${asset.symbol}/logo.png`
      }

      if (isEthChain(asset.chain)) {
        const tokenAddress = getEthTokenAddress(asset)
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
      }
    }

    return ''
  }, [asset, network])

  const remoteIconImage = useRemoteImage(imgUrl)

  const renderIcon = useCallback(
    (src: string) => (
      <Styled.IconWrapper className={`coinIcon-wrapper ${className}`} size={size}>
        <Styled.Icon src={src} size={size} />{' '}
      </Styled.IconWrapper>
    ),
    [className, size]
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
      <Styled.IconWrapper {...rest} size={size}>
        <Styled.IconFallback style={{ backgroundImage }} size={size}>
          {ticker}
        </Styled.IconFallback>
      </Styled.IconWrapper>
    )
  }, [asset, size, rest])

  return RD.fold(() => <></>, renderPendingIcon, renderFallbackIcon, renderIcon)(remoteIconImage)
}
