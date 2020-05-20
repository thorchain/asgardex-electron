import React from 'react'
import { CheckOutlined } from '@ant-design/icons'
import DynamicCoin from '../dynamicAsset'

import { AssetIconWrapper } from './assetIcon.style'
import { assetIconGroup } from '../../../icons/assetIcons'
import { Size } from './types'

export type Props = {
  type?: string
  size: Size
  className?: string
}

const AssetIcon: React.FC<Props> = (props: Props): JSX.Element => {
  const { type = 'bnb', size = 'big', className = '', ...otherProps } = props

  const renderAssetIcon = () => {
    const AssetIcon = assetIconGroup[type.toLowerCase()] || ''

    if (AssetIcon) {
      return <img src={AssetIcon} alt={type} />
    }
    if (type === 'blue') {
      return <div className="blue-circle" />
    }
    if (type === 'confirm') {
      return (
        <div className="confirm-circle">
          <CheckOutlined />
        </div>
      )
    }
    return <DynamicCoin type={type} size={size} />
  }

  return (
    <AssetIconWrapper size={size} className={`AssetIcon-wrapper ${className}`} {...otherProps}>
      {renderAssetIcon()}
    </AssetIconWrapper>
  )
}

export default AssetIcon
