import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { isTerraNativeAsset } from '@xchainjs/xchain-terra'
import { Asset, isSynthAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../../shared/api/types'
import atomIcon from '../../../../assets/svg/asset-atom.svg'
import ethIcon from '../../../../assets/svg/asset-eth.svg'
import {
  getEthTokenAddress,
  iconUrlInERC20Whitelist,
  isBchAsset,
  isBnbAsset,
  isBnbAssetSynth,
  isBtcAsset,
  isDogeAsset,
  isLunaAsset,
  isUstAsset,
  isEthAsset,
  isLtcAsset,
  isRuneBnbAsset,
  isRuneNativeAsset,
  isTgtERC20Asset,
  isXRuneAsset,
  isAtomAsset
} from '../../../../helpers/assetHelper'
import { isBnbChain, isEthChain } from '../../../../helpers/chainHelper'
import { getIntFromName, rainbowStop } from '../../../../helpers/colorHelpers'
import { useRemoteImage } from '../../../../hooks/useRemoteImage'
import {
  bnbIcon,
  btcIcon,
  dogeIcon,
  runeIcon,
  bnbRuneIcon,
  xRuneIcon,
  tgtIcon,
  lunaIcon,
  ustIcon
} from '../../../icons'
import * as Styled from './AssetIcon.styles'
import { Size } from './AssetIcon.types'

type ComponentProps = {
  size?: Size
  asset: Asset
  network: Network
}

type Props = ComponentProps & React.HTMLAttributes<HTMLDivElement>

export const AssetIcon: React.FC<Props> = ({ asset, size = 'normal', className = '', network }): JSX.Element => {
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
    if (isBnbAsset(asset) || isBnbAssetSynth(asset)) {
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

    if (isTgtERC20Asset(asset)) {
      return tgtIcon
    }

    // DOGE
    if (isDogeAsset(asset)) {
      return dogeIcon
    }

    // Atom
    if (isAtomAsset(asset)) {
      return atomIcon
    }

    // LUNA
    if (isLunaAsset(asset)) {
      return lunaIcon
    }

    // UST
    if (isUstAsset(asset)) {
      return ustIcon
    }

    // All other Terra native assets
    if (isTerraNativeAsset(asset)) {
      return `https://assets.terra.money/icon/svg/Terra/${asset.ticker}.svg`
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

  const isSynth = isSynthAsset(asset)

  const renderIcon = useCallback(
    (src: string) => (
      <Styled.IconWrapper size={size} isSynth={isSynth} className={className}>
        <Styled.Icon src={src} isSynth={isSynth} size={size} />{' '}
      </Styled.IconWrapper>
    ),
    [className, isSynth, size]
  )

  const renderPendingIcon = useCallback(() => {
    return (
      <Styled.IconWrapper size={size} isSynth={isSynth} className={className}>
        <Styled.LoadingOutlined />
      </Styled.IconWrapper>
    )
  }, [size, isSynth, className])

  const renderFallbackIcon = useCallback(() => {
    const { ticker } = asset
    const numbers = getIntFromName(ticker)
    const backgroundImage = `linear-gradient(45deg,${rainbowStop(numbers[0])},${rainbowStop(numbers[1])})`

    return (
      <Styled.IconWrapper isSynth={isSynth} size={size} className={className}>
        <Styled.IconFallback isSynth={isSynth} size={size} style={{ backgroundImage }}>
          {ticker}
        </Styled.IconFallback>
      </Styled.IconWrapper>
    )
  }, [asset, isSynth, className, size])

  return RD.fold(() => <></>, renderPendingIcon, renderFallbackIcon, renderIcon)(remoteIconImage)
}
