import React, { RefObject, useRef, useState } from 'react'

import { tokenAmount } from '@thorchain/asgardex-token'
import { bn, delay, Asset } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import { sortBy as _sortBy } from 'lodash'

import { useClickOutside } from '../../../../hooks/useOutsideClick'
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
  price: BigNumber
  priceIndex: PriceDataIndex
  priceUnit?: string
  withSearch?: boolean
  searchDisable?: string[]
  onSelect: (_: number) => void
  onChangeAsset?: (asset: string) => void
}

const AssetSelect: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset,
    assetData = [],
    price = bn(0),
    priceIndex,
    priceUnit = '$',
    withSearch = false,
    searchDisable = [],
    onChangeAsset = (_: string) => {}
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
        <AssetMenu
          assetData={sortedAssetData}
          asset={asset}
          priceIndex={priceIndex}
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
        {!disabled ? <DropdownCarret open={openDropdown} /> : null}
      </AssetDropdownButton>
    )
  }

  return (
    <AssetSelectWrapper ref={ref}>
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
