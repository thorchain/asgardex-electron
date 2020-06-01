import React from 'react'

import { CheckOutlined } from '@ant-design/icons'

import { coinIconGroup } from '../../../icons/coinIcons'
import DynamicCoin from '../dynamicCoin'
import { CoinIconWrapper } from './CoinIcon.style'
import { Size } from './types'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  size?: Size
  type?: string
}

const CoinIcon: React.FC<Props> = ({ className = '', size = 'big', type = 'bnb', ...rest }: Props): JSX.Element => {
  const renderCoinIcon = () => {
    const coinIcon = coinIconGroup[type.toLowerCase()] || ''

    if (coinIcon) {
      return <img src={coinIcon} alt={type} />
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
    <CoinIconWrapper size={size} className={`coinIcon-wrapper ${className}`} {...rest}>
      {renderCoinIcon()}
    </CoinIconWrapper>
  )
}

export default CoinIcon
