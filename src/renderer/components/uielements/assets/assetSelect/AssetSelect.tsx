import React, { useCallback, useState } from 'react'

import { delay, Asset, assetToString } from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { ordWalletBalanceByAsset } from '../../../../helpers/fp/ord'
import { WalletBalances } from '../../../../services/clients'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetData } from '../assetData'
import { AssetMenu } from '../assetMenu'
import * as Styled from './AssetSelect.style'

type DropdownCarretProps = {
  open: boolean
  onClick?: FP.Lazy<void>
  disabled?: boolean
}

const DropdownCarret: React.FC<DropdownCarretProps> = (props: DropdownCarretProps): JSX.Element => {
  const { open, onClick = FP.constVoid, disabled = false } = props
  return (
    <Styled.DropdownIconHolder>
      <Styled.DropdownIcon open={open} onClick={onClick} disabled={disabled} />
    </Styled.DropdownIconHolder>
  )
}

export type Props = {
  balances: WalletBalances
  asset: Asset
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
    balances = [],
    priceIndex,
    withSearch = true,
    searchDisable = [],
    onSelect = (_: Asset) => {},
    children,
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

  const renderMenu = useCallback(() => {
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

  const renderDropDownButton = () => {
    const hideButton = balances.length === 0
    return (
      <Styled.AssetDropdownButton disabled={hideButton || disabled} onClick={handleDropdownButtonClicked}>
        {!hideButton ? <DropdownCarret open={openDropdown} disabled={disabled} /> : null}
      </Styled.AssetDropdownButton>
    )
  }

  return (
    <Styled.AssetSelectWrapper className={className}>
      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <>
          {children && children}
          <AssetData noTicker={!showAssetName} className={'asset-data'} asset={asset} network={network} />
          {renderDropDownButton()}
        </>
      </Dropdown>
    </Styled.AssetSelectWrapper>
  )
}
