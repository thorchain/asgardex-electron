import React, { useMemo, useCallback } from 'react'

import { Asset, assetToString, baseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'

import { Network } from '../../../../../shared/api/types'
import { eqAsset } from '../../../../helpers/fp/eq'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { WalletBalance, WalletBalances } from '../../../../services/wallet/types'
import { FilterMenu } from '../../filterMenu'
import { AssetData } from '../assetData/AssetData'

const filterFunction = ({ asset }: WalletBalance, searchTerm: string) => {
  const { ticker } = asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
}

export type Props = {
  asset: Asset
  balances: WalletBalances
  priceIndex?: PriceDataIndex
  searchDisable: string[]
  withSearch: boolean
  onSelect: (value: string) => void
  closeMenu?: () => void
  searchPlaceholder?: string
  network: Network
}

export const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const {
    searchPlaceholder,
    balances,
    asset,
    priceIndex = {},
    withSearch,
    searchDisable = [],
    onSelect = () => {},
    closeMenu,
    network
  } = props

  const filteredData = useMemo(
    (): WalletBalances => balances.filter((balance: WalletBalance) => !eqAsset.equals(balance.asset, asset)),
    [asset, balances]
  )

  const cellRenderer = useCallback(
    ({ asset, amount }: WalletBalance) => {
      const price = baseAmount(priceIndex[asset.ticker])
      const key = assetToString(asset)
      const node = (
        <Row align={'middle'} gutter={[8, 0]} onClick={() => onSelect(key)}>
          <Col>
            <AssetData asset={asset} price={price} network={network} />
          </Col>
          <Col>{formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: 3 })}</Col>
        </Row>
      )
      return { key, node }
    },
    [network, onSelect, priceIndex]
  )

  const disableItemFilterHandler = useCallback(
    ({ asset }: WalletBalance) => searchDisable.indexOf(asset.ticker) > -1,
    [searchDisable]
  )

  return (
    <FilterMenu
      placeholder={searchPlaceholder}
      closeMenu={closeMenu}
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(balance: WalletBalance) => disableItemFilterHandler(balance)}
      data={filteredData}
    />
  )
}
