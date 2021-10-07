import React, { useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { truncateAddress } from '../../helpers/addressHelper'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqString } from '../../helpers/fp/eq'
import { WalletType } from '../../services/wallet/types'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AssetIcon } from '../uielements/assets/assetIcon/AssetIcon'
import { Size as IconSize } from '../uielements/assets/assetIcon/AssetIcon.types'
import { WalletTypeLabel } from '../uielements/common/Common.styles'
import * as Styled from './AccountAddressSelector.styles'

export type WalletAddress = {
  walletAddress: Address
  walletType: WalletType
  chain: Chain
}

type Props = {
  selectedAddress: WalletAddress
  addresses: WalletAddress[]
  size?: IconSize
  network: Network
  onChangeAddress?: (address: Address) => void
}

export const AccountAddressSelector: React.FC<Props> = (props) => {
  const { selectedAddress, addresses, size = 'small', network, onChangeAddress = FP.constVoid } = props

  const intl = useIntl()
  const truncatedAddress = useMemo(
    () => truncateAddress(selectedAddress.walletAddress, selectedAddress.chain, network),
    [network, selectedAddress.chain, selectedAddress.walletAddress]
  )

  const menu = useMemo(
    () => (
      <Styled.Menu>
        {addresses.map(({ walletAddress, walletType, chain }) => (
          <Styled.MenuItem key={walletAddress} onClick={() => onChangeAddress(walletAddress)}>
            <Styled.MenuItemWrapper highlighted={eqString.equals(selectedAddress.walletAddress, walletAddress)}>
              <Styled.AssetIcon asset={getChainAsset(chain)} size={size} network={network} />
              <Styled.WalletAddress>{walletAddress}</Styled.WalletAddress>
              {isLedgerWallet(walletType) && (
                <Styled.WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</Styled.WalletTypeLabel>
              )}
            </Styled.MenuItemWrapper>
          </Styled.MenuItem>
        ))}
      </Styled.Menu>
    ),
    [addresses, intl, network, onChangeAddress, selectedAddress.walletAddress, size]
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
