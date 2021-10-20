import React, { useCallback, useState, useMemo } from 'react'

import { delay, Asset, assetToString } from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { WalletType } from '../../../../../shared/wallet/types'
import { ordWalletBalanceByAsset } from '../../../../helpers/fp/ord'
import { WalletBalances } from '../../../../services/clients'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetData } from '../assetData'
import { AssetMenu } from '../assetMenu'
import * as Styled from './AssetSelect.styles'

export type Props = {
  asset: Asset
  assetWalletType?: WalletType
  balances: WalletBalances
  priceIndex?: PriceDataIndex
  withSearch?: boolean
  searchDisable?: string[]
  onSelect: (_: Asset) => void
  className?: string
  minWidth?: number
  showAssetName?: boolean
  disabled?: boolean
  network: Network
}

export const AssetSelect: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assetWalletType,
    balances = [],
    priceIndex,
    withSearch = true,
    searchDisable = [],
    onSelect = (_: Asset) => {},
    className,
    minWidth,
    showAssetName = true,
    disabled = false,
    network
  } = props

  const [openDropdown, setOpenDropdown] = useState<boolean>(false)
  const intl = useIntl()

  const closeMenu = useCallback(() => {
    openDropdown && setOpenDropdown(false)
  }, [setOpenDropdown, openDropdown])

  const handleDropdownButtonClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    // toggle dropdown state
    setOpenDropdown(!openDropdown)
  }

  const handleChangeAsset = useCallback(
    async (assetId: string) => {
      setOpenDropdown(false)

      // Wait for the dropdown to close
      await delay(500)
      const changedAsset = balances.find((balance) => assetToString(balance.asset) === assetId)
      if (changedAsset) {
        onSelect(changedAsset.asset)
      }
    },
    [balances, onSelect]
  )

  const renderMenu = useMemo(() => {
    const sortedBalanceData = balances.sort(ordWalletBalanceByAsset.compare)
    return (
      <Styled.AssetSelectMenuWrapper minWidth={minWidth}>
        <AssetMenu
          searchPlaceholder={intl.formatMessage({ id: 'common.searchAsset' })}
          closeMenu={closeMenu}
          balances={sortedBalanceData}
          asset={asset}
          priceIndex={priceIndex}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
          network={network}
        />
      </Styled.AssetSelectMenuWrapper>
    )
  }, [balances, minWidth, intl, closeMenu, asset, priceIndex, withSearch, searchDisable, handleChangeAsset, network])

  const hideButton = balances.length === 0
  const disableButton = disabled || hideButton

  return (
    <Styled.AssetSelectWrapper
      className={`${className} ${openDropdown ? 'selected' : ''}`}
      disabled={disableButton}
      onClick={handleDropdownButtonClicked}>
      <Dropdown overlay={renderMenu} trigger={[]} visible={openDropdown} placement="bottomCenter">
        <>
          <AssetData
            noTicker={!showAssetName}
            className={'asset-data'}
            asset={asset}
            walletType={assetWalletType}
            network={network}
          />
          <Styled.AssetDropdownButton>
            {!hideButton ? (
              <Styled.DropdownIconHolder>
                <Styled.DropdownIcon open={openDropdown} disabled={disableButton} />
              </Styled.DropdownIconHolder>
            ) : null}
          </Styled.AssetDropdownButton>
        </>
      </Dropdown>
    </Styled.AssetSelectWrapper>
  )
}
