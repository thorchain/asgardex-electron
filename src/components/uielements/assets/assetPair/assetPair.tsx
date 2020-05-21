import React from 'react'

import { AssetPairWrapper } from './assetPair.style'
import AssetIcon from '../assetIcon'
import { Size } from './types'

export type Props = {
  from: string
  to: string
  size?: Size
  className?: string
}

const AssetPair: React.FC<Props> = (props: Props): JSX.Element => {
  const { from, to, size = 'big', className = '', ...otherProps } = props

  return (
    <AssetPairWrapper className={`assetPair-wrapper ${className}`} {...otherProps}>
      <div className="asset-data">
        <AssetIcon type={from} size={size} />
      </div>
      <div className="asset-data">
        <AssetIcon type={to} size={size} />
      </div>
    </AssetPairWrapper>
  )
}

export default AssetPair
