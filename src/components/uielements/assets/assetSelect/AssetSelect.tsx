import React, { RefObject, useRef, useState } from 'react'

import { tokenAmount } from '@thorchain/asgardex-token'
import { bn, delay } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import { sortBy as _sortBy } from 'lodash'

import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import {
  AssetSelectWrapper,
  AssetDropdownButton,
  AssetSelectMenuWrapper,
  DropdownIconHolder,
  DropdownIcon
} from './AssetSelect.style'
import AssetSelectData from './AssetSelectData'
import AssetSelectMenu from './AssetSelectMenu'

type DropdownCarretProps = {
  className?: string
  open: boolean
  onClick?: () => void
}

const DropdownCarret: React.FC<DropdownCarretProps> = (props: DropdownCarretProps): JSX.Element => {
  const { open, onClick = () => {}, className = '' } = props
  return (
    <DropdownIconHolder>
      <DropdownIcon open={open} className={className} onClick={onClick} />
    </DropdownIconHolder>
  )
}

type Props = {
  assetData: AssetPair[]
  asset: string
  price: BigNumber
  priceIndex: PriceDataIndex
  priceUnit?: string
  withSearch?: boolean
  searchDisable?: string[]
  onSelect: (_: number) => void
  onChangeAsset?: (asset: string) => void
  className?: string
}

const AssetSelect: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset = 'bnb',
    assetData = [],
    price = bn(0),
    priceIndex,
    priceUnit = '$',
    withSearch = false,
    searchDisable = [],
    // onSelect = (_: number) => {},
    onChangeAsset = (_: string) => {},
    className = ''
  } = props

  const [openDropdown, setOpenDropdown] = useState<boolean>(false)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleDropdownButtonClicked = () => {
    // toggle dropdown state
    setOpenDropdown((value) => !value)
  }

  const handleChangeAsset = async (asset: string) => {
    setOpenDropdown(false)

    // Wait for the dropdown to close
    await delay(500)
    onChangeAsset(asset)
  }

  const renderMenu = () => {
    const sortedAssetData = _sortBy(assetData, ['asset'])

    return (
      <AssetSelectMenuWrapper>
        <AssetSelectMenu
          assetData={sortedAssetData}
          asset={asset}
          priceIndex={priceIndex}
          unit={priceUnit}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
        />
      </AssetSelectMenuWrapper>
    )
  }

  const renderDropDownButton = () => {
    const disabled = assetData.length === 0
    return (
      <AssetDropdownButton disabled={disabled} onClick={handleDropdownButtonClicked}>
        {!disabled ? <DropdownCarret className="caret-down" open={openDropdown} /> : null}
      </AssetDropdownButton>
    )
  }

  return (
    <AssetSelectWrapper ref={ref} className={`assetSelect-wrapper ${className}`}>
      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <>
          <AssetSelectData asset={asset} assetValue={tokenAmount(price)} priceUnit={priceUnit} />
          {renderDropDownButton()}
        </>
      </Dropdown>
    </AssetSelectWrapper>
  )
}

export default AssetSelect
