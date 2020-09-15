import React, { useRef, useState, RefObject } from 'react'

import { bn, delay, formatBN, Asset, assetFromString, BaseAmount } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import { sortBy as _sortBy } from 'lodash'

import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import Label from '../../label'
import Selection from '../../selection'
import AssetMenu from '../assetMenu'
import * as Styled from './AssetCard.style'

type Props = {
  asset: Asset
  assetData?: AssetPair[]
  amount: BaseAmount
  price: BigNumber
  priceIndex?: PriceDataIndex
  unit?: string
  slip?: number
  title: string
  searchDisable?: string[]
  withSelection?: boolean
  withSearch?: boolean
  onSelect?: (value: number) => void
  onChange?: (value: BigNumber) => void
  onChangeAsset?: (asset: Asset) => void
  className?: string
  dataTestWrapper?: string
  dataTestInput?: string
  children?: React.ReactNode
}

const AssetCard: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset,
    amount,
    assetData = [],
    price = bn(0),
    priceIndex,
    slip,
    unit = 'RUNE',
    className = '',
    title = '',
    withSelection = false,
    withSearch = false,
    searchDisable = [],
    onSelect = (_: number) => {},
    onChange = (_: BigNumber) => {},
    onChangeAsset = (_: Asset) => {},
    children = null
  } = props

  const [openDropdown, setOpenDropdown] = useState(false)
  const [percentButtonSelected, setPercentButtonSelected] = useState(0)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleResetPercentButtons = () => {
    setPercentButtonSelected(0)
  }

  const handleDropdownButtonClicked = () => {
    // toggle open state
    setOpenDropdown((value) => !value)
  }

  const handlePercentSelected = (percentButtonSelected: number) => {
    setPercentButtonSelected(percentButtonSelected)
    onSelect(percentButtonSelected)
  }

  const handleChangeAsset = async (assetString: string) => {
    setOpenDropdown(false)

    // Wait for the dropdown to close
    await delay(500)
    handleResetPercentButtons()
    const asset = assetFromString(assetString)
    if (asset) {
      onChangeAsset(asset)
    }
  }

  function renderMenu() {
    const sortedAssetData = _sortBy(assetData, ['asset'])

    return (
      <AssetMenu
        assetData={sortedAssetData}
        asset={asset}
        priceIndex={priceIndex}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
      />
    )
  }

  return (
    <Styled.AssetCardWrapper ref={ref} className={`AssetCard-wrapper ${className}`}>
      {title && <Label className="title-label">{title}</Label>}

      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <Styled.CardBorderWrapper>
          <Styled.AssetNameLabel>{asset?.ticker ?? 'unknown'}</Styled.AssetNameLabel>
          <Styled.CardTopRow>
            <Styled.AssetSelect
              showAssetName={false}
              assetData={assetData}
              asset={asset}
              onSelect={handleDropdownButtonClicked}>
              <Styled.AssetData>
                <Styled.InputBigNumber size="middle" value={amount.amount()} onChange={onChange} />
                <Styled.AssetCardFooter>
                  <Styled.FooterLabel>{`${unit} ${formatBN(amount.amount().multipliedBy(price))}`}</Styled.FooterLabel>
                  {slip !== undefined && (
                    <Styled.FooterLabel className="asset-slip-label">SLIP: {slip.toFixed(0)} %</Styled.FooterLabel>
                  )}
                </Styled.AssetCardFooter>
              </Styled.AssetData>
            </Styled.AssetSelect>
          </Styled.CardTopRow>
        </Styled.CardBorderWrapper>
      </Dropdown>
      {withSelection && <Selection selected={percentButtonSelected} onSelect={handlePercentSelected} />}
      {children}
    </Styled.AssetCardWrapper>
  )
}

export default AssetCard
