import React, { useMemo, useCallback } from 'react'

import { Asset, assetToString, baseAmount } from '@thorchain/asgardex-util'

import { eqAsset } from '../../../../helpers/fp/eq'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { FilterMenu } from '../../filterMenu'
import { AssetData } from '../assetData/AssetData'

const filterFunction = (asset: Asset, searchTerm: string) => {
  const { ticker } = asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0
}

type Props = {
  asset: Asset
  assets: Asset[]
  priceIndex?: PriceDataIndex
  searchDisable: string[]
  withSearch: boolean
  onSelect: (value: string) => void
  closeMenu?: () => void
  searchPlaceholder?: string
}

export const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const {
    searchPlaceholder,
    assets,
    asset,
    priceIndex = {},
    withSearch,
    searchDisable = [],
    onSelect = () => {},
    closeMenu
  } = props

  const filteredData = useMemo((): Asset[] => assets.filter((a: Asset) => !eqAsset.equals(a, asset)), [asset, assets])

  const cellRenderer = useCallback(
    (asset: Asset) => {
      const price = baseAmount(priceIndex[asset.ticker])
      const node = <AssetData asset={asset} price={price} />
      const key = assetToString(asset)
      return { key, node }
    },
    [priceIndex]
  )

  const disableItemFilterHandler = useCallback((asset: Asset) => searchDisable.indexOf(asset.ticker) > -1, [
    searchDisable
  ])

  return (
    <FilterMenu
      placeholder={searchPlaceholder}
      closeMenu={closeMenu}
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(a: Asset) => disableItemFilterHandler(a)}
      onSelect={onSelect}
      data={filteredData}
    />
  )
}
