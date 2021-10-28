import React, { useMemo, useCallback } from 'react'

import { Asset, assetToString } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'

import { Network } from '../../../../../shared/api/types'
import { eqAsset } from '../../../../helpers/fp/eq'
import { FilterMenu } from '../../filterMenu'
import { AssetData } from '../assetData/AssetData'

const filterFunction = (asset: Asset, searchTerm: string) => {
  const { ticker } = asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
}

export type Props = {
  asset: Asset
  assets: Asset[]
  searchDisable: string[]
  withSearch: boolean
  onSelect: (value: Asset) => void
  closeMenu?: () => void
  searchPlaceholder?: string
  network: Network
}

export const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const { searchPlaceholder, assets, asset, withSearch, searchDisable = [], onSelect, closeMenu, network } = props

  const filteredData = useMemo(
    (): Asset[] => assets.filter((assetToFilter: Asset) => !eqAsset.equals(assetToFilter, asset)),
    [asset, assets]
  )

  const cellRenderer = useCallback(
    (asset: Asset) => {
      const key = assetToString(asset)
      const node = (
        <Row align={'middle'} onClick={() => onSelect(asset)}>
          <Col>
            <AssetData asset={asset} network={network} />
          </Col>
        </Row>
      )
      return { key, node }
    },
    [network, onSelect]
  )

  const disableItemFilterHandler = useCallback(
    (asset: Asset) => searchDisable.indexOf(asset.ticker) > -1,
    [searchDisable]
  )

  return (
    <FilterMenu
      placeholder={searchPlaceholder}
      closeMenu={closeMenu}
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(asset: Asset) => disableItemFilterHandler(asset)}
      data={filteredData}
    />
  )
}
