import React, { useMemo, useCallback } from 'react'

import { Asset, assetToString, baseAmount } from '@thorchain/asgardex-util'

import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import FilterMenu from '../../filterMenu'
import AssetData from '../assetData'

const filterFunction = (item: AssetPair, searchTerm: string) => {
  const { ticker } = item.asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0
}

type Props = {
  asset: Asset
  assetData: AssetPair[]
  priceIndex?: PriceDataIndex
  searchDisable: string[]
  withSearch: boolean
  onSelect: (value: string) => void
  closeMenu?: () => void
  searchPlaceholder?: string
}

const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const {
    searchPlaceholder,
    assetData,
    asset,
    priceIndex = {},
    withSearch,
    searchDisable = [],
    onSelect = () => {},
    closeMenu
  } = props

  const filteredData = useMemo(
    () => assetData.filter((item) => item.asset.ticker !== asset.ticker),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asset, assetData]
  )

  const cellRenderer = useCallback(
    (data: AssetPair) => {
      const { asset } = data
      const price = baseAmount(priceIndex[asset.ticker])
      const node = <AssetData asset={asset} price={price} />
      const key = assetToString(asset)
      return { key, node }
    },
    [priceIndex]
  )

  const disableItemFilterHandler = useCallback((item: AssetPair) => searchDisable.indexOf(item.asset.ticker) > -1, [
    searchDisable
  ])

  return (
    <FilterMenu
      placeholder={searchPlaceholder}
      closeMenu={closeMenu}
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(a: AssetPair) => disableItemFilterHandler(a)}
      onSelect={onSelect}
      data={filteredData}
    />
  )
}

export default AssetMenu
