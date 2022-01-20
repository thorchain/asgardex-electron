import React, { useMemo, useCallback } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../../shared/api/types'
import {
  getEthTokenAddress,
  iconUrlInERC20Whitelist,
  isBchAsset,
  isBnbAsset,
  isBtcAsset,
  isDogeAsset,
  isEthAsset,
  isFoxERC20Asset,
  isLtcAsset,
  isRuneBnbAsset,
  isRuneNativeAsset,
  isTgtERC20Asset,
  isXRuneAsset
} from '../../../../helpers/assetHelper'
import { isBnbChain, isEthChain } from '../../../../helpers/chainHelper'
import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import { useRemoteImage } from '../../../../hooks/useRemoteImage'
import { bnbIcon, btcIcon, dogeIcon, ethIcon, runeIcon, bnbRuneIcon, xRuneIcon, tgtIcon } from '../../../icons'
import * as Styled from './AssetIcon.styles'
import { Size } from './AssetIcon.types'

type ComponentProps = {
  size?: Size
  asset: Asset
  network: Network
}

type Props = ComponentProps & React.HTMLAttributes<HTMLDivElement>

export const AssetIcon: React.FC<Props> = ({
  asset,
  size = 'normal',
  className = '',
  network,
  ...rest
}): JSX.Element => {
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
    if (isRuneBnbAsset(asset, network)) {
      return bnbRuneIcon
    }
    // BNB
    if (isBnbAsset(asset)) {
      // Since BNB is blacklisted at TrustWallet's asset, we have to use "our" own BNB icon
      // (see https://github.com/trustwallet/assets/blob/master/blockchains/binance/denylist.json
      return bnbIcon
    }
    // LTC
    if (isLtcAsset(asset)) {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/litecoin/info/logo.png`
    }
    // BCH
    if (isBchAsset(asset)) {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoincash/info/logo.png`
    }

    if (isXRuneAsset(asset)) {
      return xRuneIcon
    }

    if (isFoxERC20Asset(asset)) {
      return 'https://assets.coincap.io/assets/icons/256/fox.png'
    }

    if (isTgtERC20Asset(asset)) {
      return tgtIcon
    }

    // DOGE
    if (isDogeAsset(asset)) {
      return dogeIcon
    }

    if (network !== 'testnet') {
      if (isBnbChain(asset.chain)) {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${asset.symbol}/logo.png`
      }

      // Since we've already checked ETH.ETH before,
      // we know any asset is ERC20 here - no need to run expensive `isEthTokenAsset`
      if (isEthChain(asset.chain)) {
        return FP.pipe(
          // Try to get url from ERC20Whitelist first
          iconUrlInERC20Whitelist(asset),
          // Or use `trustwallet`
          O.alt(() =>
            FP.pipe(
              getEthTokenAddress(asset),
              O.map(
                (tokenAddress) =>
                  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
              )
            )
          ),
          O.getOrElse(() => '')
        )
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
      <Styled.IconWrapper size={size} className={'asd ' + className}>
        <LoadingOutlined />
      </Styled.IconWrapper>
    )
  }, [size, className])
  const renderFallbackIcon = useCallback(() => {
    const { ticker } = asset
    const numbers = getIntFromName(ticker)
    const backgroundImage = `linear-gradient(45deg,${rainbowStop(numbers[0])},${rainbowStop(numbers[1])})`

    return (
      <Styled.IconWrapper {...rest} className={className} size={size}>
        <Styled.IconFallback style={{ backgroundImage }} size={size}>
          {ticker}
        </Styled.IconFallback>
      </Styled.IconWrapper>
    )
  }, [asset, size, rest, className])

  return RD.fold(() => <></>, renderPendingIcon, renderFallbackIcon, renderIcon)(remoteIconImage)
}
