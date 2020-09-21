import React, { useCallback, useState } from 'react'

import { delay, Asset, assetToString } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import { sortBy as _sortBy } from 'lodash'
import { useIntl } from 'react-intl'

import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import AssetMenu from '../assetMenu'
import {
  AssetSelectWrapper,
  AssetDropdownButton,
  AssetSelectMenuWrapper,
  DropdownIconHolder,
  DropdownIcon
} from './AssetSelect.style'
import AssetSelectData from './AssetSelectData'

type DropdownCarretProps = {
  open: boolean
  onClick?: () => void
}

const DropdownCarret: React.FC<DropdownCarretProps> = (props: DropdownCarretProps): JSX.Element => {
  const { open, onClick = () => {} } = props
  return (
    <DropdownIconHolder>
      <DropdownIcon open={open} onClick={onClick} />
    </DropdownIconHolder>
  )
}

type Props = {
  assetData: AssetPair[]
  asset: Asset
  priceIndex?: PriceDataIndex
  withSearch?: boolean
  searchDisable?: string[]
  onSelect: (_: Asset) => void
  className?: string
  minWidth?: number
  showAssetName?: boolean
}

const AssetSelect: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assetData = [],
    priceIndex,
    withSearch = true,
    searchDisable = [],
    onSelect = (_: Asset) => {},
    children,
    className,
    minWidth,
    showAssetName
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
      const changedAsset = assetData.find((asset) => assetToString(asset.asset) === assetId)
      if (changedAsset) {
        onSelect(changedAsset.asset)
      }
    },
    [assetData, onSelect]
  )

  const renderMenu = useCallback(() => {
    const sortedAssetData = _sortBy(assetData, ['asset'])
    return (
      <AssetSelectMenuWrapper minWidth={minWidth}>
        <AssetMenu
          searchPlaceholder={intl.formatMessage({ id: 'swap.searchAsset' })}
          closeMenu={closeMenu}
          assetData={sortedAssetData}
          asset={asset}
          priceIndex={priceIndex}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
        />
      </AssetSelectMenuWrapper>
    )
  }, [assetData, intl, asset, closeMenu, handleChangeAsset, priceIndex, searchDisable, withSearch, minWidth])

  const renderDropDownButton = () => {
    const disabled = assetData.length === 0
    return (
      <AssetDropdownButton disabled={disabled} onClick={handleDropdownButtonClicked}>
        {!disabled ? <DropdownCarret open={openDropdown} /> : null}
      </AssetDropdownButton>
    )
  }

  return (
    <AssetSelectWrapper className={className}>
      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <>
          {children && children}
          <AssetSelectData showAssetName={showAssetName} asset={asset} />
          {renderDropDownButton()}
        </>
      </Dropdown>
    </AssetSelectWrapper>
  )
}

export default AssetSelect
