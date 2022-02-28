import React, { useMemo } from 'react'

import { Dropdown, Row } from 'antd'

import { WalletType } from '../../../../shared/wallet/types'
import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { WalletTypeLabel } from './WalletTypeLabel'

type Props = {
  selectedWalletType: WalletType | 'custom'
  walletTypes: Array<WalletType | 'custom'>
  onChange: (walletType: WalletType) => void
  className?: string
}

export const WalletTypeSelector: React.FC<Props> = (props): JSX.Element => {
  const { walletTypes, selectedWalletType, className } = props

  const overlay = useMemo(() => {
    return (
      <>
        {walletTypes.map((walletType) => (
          <Row style={{ alignItems: 'center' }} key={walletType}>
            <p>{walletType}</p>
          </Row>
        ))}
      </>
    )
  }, [walletTypes])

  return (
    <Dropdown overlay={overlay} trigger={['click']} placement="bottomCenter" className={className}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <WalletTypeLabel>{selectedWalletType}</WalletTypeLabel>
        <DownIcon />
      </div>
    </Dropdown>
  )
}
