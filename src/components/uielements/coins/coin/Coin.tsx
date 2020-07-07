import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import CoinIcon from '../coinIcon'
import { Size as CoinSize } from '../coinIcon/types'
import { CoinWrapper, CoinsWrapper } from './Coin.style'

type Props = {
  asset: Asset
  target?: Asset
  size?: CoinSize
  className?: string
}

const Coin: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, target, size = 'big' } = props

  if (target) {
    return (
      <CoinsWrapper size={size}>
        <div className="coin-bottom">
          <CoinIcon asset={asset} size={size} />
        </div>
        <div className="coin-over">
          <CoinIcon asset={target} size={size} />
        </div>
      </CoinsWrapper>
    )
  }

  return (
    <CoinWrapper size={size}>
      <CoinIcon asset={asset} size={size} />
    </CoinWrapper>
  )
}

export default Coin
