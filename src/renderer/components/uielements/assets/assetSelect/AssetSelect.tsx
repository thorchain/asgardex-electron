import React, { useCallback, useState } from 'react'

import { delay, Asset, assetToString } from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { ordAsset } from '../../../../helpers/fp/ord'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetMenu } from '../assetMenu'
import {
  AssetSelectWrapper,
  AssetDropdownButton,
  AssetSelectMenuWrapper,
  DropdownIconHolder,
  DropdownIcon
} from './AssetSelect.style'
import { AssetSelectData } from './AssetSelectData'

type DropdownCarretProps = {
  open: boolean
  onClick?: FP.Lazy<void>
  disabled?: boolean
}

const DropdownCarret: React.FC<DropdownCarretProps> = (props: DropdownCarretProps): JSX.Element => {
  const { open, onClick = FP.constVoid, disabled = false } = props
  return (
    <DropdownIconHolder>
      <DropdownIcon open={open} onClick={onClick} disabled={disabled} />
    </DropdownIconHolder>
  )
}

type Props = {
  assets: Asset[]
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
    assets = [],
    priceIndex,
    withSearch = true,
    searchDisable = [],
    onSelect = (_: Asset) => {},
    children,
    className,
    minWidth,
    showAssetName,
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
      const changedAsset = assets.find((asset) => assetToString(asset) === assetId)
      if (changedAsset) {
        onSelect(changedAsset)
      }
    },
    [assets, onSelect]
  )

  const renderMenu = useCallback(() => {
    const sortedAssetData = assets.sort(ordAsset.compare)
    return (
      <AssetSelectMenuWrapper minWidth={minWidth}>
        <AssetMenu
          searchPlaceholder={intl.formatMessage({ id: 'swap.searchAsset' })}
          closeMenu={closeMenu}
          assets={sortedAssetData}
          asset={asset}
          priceIndex={priceIndex}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
          network={network}
        />
      </AssetSelectMenuWrapper>
    )
  }, [assets, intl, asset, closeMenu, handleChangeAsset, priceIndex, searchDisable, withSearch, minWidth, network])

  const renderDropDownButton = () => {
    const hideButton = assets.length === 0
    return (
      <AssetDropdownButton disabled={hideButton || disabled} onClick={handleDropdownButtonClicked}>
        {!hideButton ? <DropdownCarret open={openDropdown} disabled={disabled} /> : null}
      </AssetDropdownButton>
    )
  }

  return (
    <AssetSelectWrapper className={className}>
      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <>
          {children && children}
          <AssetSelectData showAssetName={showAssetName} asset={asset} network={network} />
          {renderDropDownButton()}
        </>
      </Dropdown>
    </AssetSelectWrapper>
  )
}
