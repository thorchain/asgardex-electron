import React, { useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { Dropdown, Menu } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { truncateAddress } from '../../helpers/addressHelper'
import { getChainAsset } from '../../helpers/chainHelper'
import { WalletType } from '../../services/wallet/types'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AssetIcon } from '../uielements/assets/assetIcon/AssetIcon'
import { Size as IconSize } from '../uielements/assets/assetIcon/AssetIcon.types'
import { WalletTypeLabel } from '../uielements/common/Common.styles'
import * as Styled from './AccountAddressSelector.styles'

type WalletAddress = {
  walletAddress: Address
  walletType: WalletType
  chain: Chain
}

type Props = {
  selectedAddress: WalletAddress
  addresses: WalletAddress[]
  size?: IconSize
  network: Network
}

export const AccountAddressSelector: React.FC<Props> = (props) => {
  const { selectedAddress, addresses, size = 'small', network } = props

  const intl = useIntl()
  const [chosenAddress, setChosenAddress] = useState(selectedAddress.walletAddress)
  const truncatedAddress = useMemo(
    () => truncateAddress(chosenAddress, selectedAddress.chain, network),
    [chosenAddress, network, selectedAddress.chain]
  )

  const menu = useMemo(
    () => (
      <Menu>
        {addresses.map(({ walletAddress, walletType, chain }) => (
          <Menu.Item key={walletAddress} onClick={() => setChosenAddress(walletAddress)}>
            <Styled.MenuItemWrapper>
              <AssetIcon asset={getChainAsset(chain)} size={size} network={network} />
              <Styled.WalletAddress>{walletAddress}</Styled.WalletAddress>
              {isLedgerWallet(walletType) && <WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</WalletTypeLabel>}
            </Styled.MenuItemWrapper>
          </Menu.Item>
        ))}
      </Menu>
    ),
    [addresses, intl, network, size]
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Styled.DropdownSelectorWrapper>
        <AssetIcon asset={getChainAsset(selectedAddress.chain)} size={'xsmall'} network={network} />
        <Styled.TruncatedAddress>{truncatedAddress}</Styled.TruncatedAddress>
        {isLedgerWallet(selectedAddress.walletType) && (
          <WalletTypeLabel>{walletTypeToI18n(selectedAddress.walletType, intl)}</WalletTypeLabel>
        )}
        <Styled.CaretDownOutlined />
      </Styled.DropdownSelectorWrapper>
    </Dropdown>
  )
}
