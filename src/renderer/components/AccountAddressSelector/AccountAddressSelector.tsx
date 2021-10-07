import React, { useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { truncateAddress } from '../../helpers/addressHelper'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqString } from '../../helpers/fp/eq'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AssetIcon } from '../uielements/assets/assetIcon/AssetIcon'
import { Size as IconSize } from '../uielements/assets/assetIcon/AssetIcon.types'
import { WalletTypeLabel } from '../uielements/common/Common.styles'
import * as Styled from './AccountAddressSelector.styles'
import { AccountAddressSelectorType } from './AccountAddressSelector.types'

type Props = {
  selectedAddress: O.Option<AccountAddressSelectorType>
  addresses: AccountAddressSelectorType[]
  size?: IconSize
  network: Network
  onChangeAddress?: (address: Address) => void
}

export const AccountAddressSelector: React.FC<Props> = (props) => {
  const {
    selectedAddress: oSelectedAddress,
    addresses,
    size = 'small',
    network,
    onChangeAddress = FP.constVoid
  } = props

  const intl = useIntl()

  const menu = useMemo(() => {
    const highlight = (walletAddress: Address) =>
      FP.pipe(
        oSelectedAddress,
        O.fold(
          () => false,
          ({ walletAddress: selectedWalletAddress }) => eqString.equals(walletAddress, selectedWalletAddress)
        )
      )

    return (
      <Styled.Menu>
        {addresses.map(({ walletAddress, walletType, chain }) => (
          <Styled.MenuItem key={walletAddress} onClick={() => onChangeAddress(walletAddress)}>
            <Styled.MenuItemWrapper highlighted={highlight(walletAddress)}>
              <Styled.AssetIcon asset={getChainAsset(chain)} size={size} network={network} />
              <Styled.WalletAddress>{walletAddress}</Styled.WalletAddress>
              {isLedgerWallet(walletType) && (
                <Styled.WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</Styled.WalletTypeLabel>
              )}
            </Styled.MenuItemWrapper>
          </Styled.MenuItem>
        ))}
      </Styled.Menu>
    )
  }, [addresses, intl, network, oSelectedAddress, onChangeAddress, size])

  const renderSelectedAddress = FP.pipe(
    oSelectedAddress,
    O.fold(
      () => <></>,
      ({ chain, walletType, walletAddress }) => (
        <>
          <AssetIcon asset={getChainAsset(chain)} size={'xsmall'} network={network} />
          <Styled.TruncatedAddress>{truncateAddress(walletAddress, chain, network)}</Styled.TruncatedAddress>
          <WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</WalletTypeLabel>
          <Styled.CaretDownOutlined />
        </>
      )
    )
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Styled.DropdownSelectorWrapper>{renderSelectedAddress}</Styled.DropdownSelectorWrapper>
    </Dropdown>
  )
}
