import React, { useMemo } from 'react'

import { Dropdown } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { WalletAddress, WalletAddresses } from '../../../shared/wallet/types'
import { truncateAddress } from '../../helpers/addressHelper'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqWalletAddress } from '../../helpers/fp/eq'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AssetIcon } from '../uielements/assets/assetIcon/AssetIcon'
import { Size as IconSize } from '../uielements/assets/assetIcon/AssetIcon.types'
import { WalletTypeLabel } from '../uielements/common/Common.styles'
import * as Styled from './AccountAddressSelector.styles'

type Props = {
  selectedAddress: O.Option<WalletAddress>
  addresses: WalletAddresses
  size?: IconSize
  network: Network
  onChangeAddress?: (address: WalletAddress) => void
  disabled?: boolean
}

export const AccountAddressSelector: React.FC<Props> = (props) => {
  const {
    selectedAddress: oSelectedAddress,
    addresses,
    size = 'small',
    network,
    onChangeAddress = FP.constVoid,
    disabled = false
  } = props

  const intl = useIntl()

  const menu = useMemo(() => {
    const isSelected = (address: WalletAddress) =>
      FP.pipe(
        oSelectedAddress,
        O.fold(
          () => false,
          (selectedAddress) => eqWalletAddress.equals(address, selectedAddress)
        )
      )

    return (
      <Styled.Menu
        items={FP.pipe(
          addresses,
          A.map((walletAddress) => {
            const { address, type, chain } = walletAddress
            const selected = isSelected(walletAddress)
            return {
              label: (
                <Styled.MenuItemWrapper onClick={() => onChangeAddress(walletAddress)}>
                  <Styled.AssetIcon asset={getChainAsset(chain)} size={size} network={network} />
                  <Styled.WalletAddress>{address}</Styled.WalletAddress>
                  {isLedgerWallet(type) && (
                    <Styled.WalletTypeLabel selected={selected}>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>
                  )}
                </Styled.MenuItemWrapper>
              ),
              key: address
            }
          })
        )}
      />
    )
  }, [addresses, intl, network, oSelectedAddress, onChangeAddress, size])

  const renderSelectedAddress = FP.pipe(
    oSelectedAddress,
    O.fold(
      () => <></>,
      ({ chain, type, address }) => (
        <>
          <AssetIcon asset={getChainAsset(chain)} size={'xsmall'} network={network} />
          <Styled.TruncatedAddress>{truncateAddress(address, chain, network)}</Styled.TruncatedAddress>
          {isLedgerWallet(type) && <WalletTypeLabel>{walletTypeToI18n(type, intl)}</WalletTypeLabel>}
          <Styled.CaretDownOutlined />
        </>
      )
    )
  )

  return (
    <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
      <Styled.DropdownSelectorWrapper disabled={disabled}>{renderSelectedAddress}</Styled.DropdownSelectorWrapper>
    </Dropdown>
  )
}
