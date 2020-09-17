import React, { useCallback, useMemo } from 'react'

import { Asset } from '@thorchain/asgardex-util'
import { Collapse } from 'antd'
import { ColumnType } from 'antd/lib/table'
// import * as O from 'fp-ts/lib/Option'

// import { RUNE_PRICE_POOL } from '../../../const'
import { PoolDetails } from '../../../services/midgard/types'
import { AssetWithBalance, AssetsWBChains } from '../../../services/wallet/types'
import { PricePool } from '../../../views/pools/types'
import AssetIcon from '../../uielements/assets/assetIcon'
import * as Styles from './AssetsTableCollapsable.style'

const { Panel } = Collapse

type Props = {
  assetsWBChains: AssetsWBChains
  pricePool?: PricePool
  poolDetails: PoolDetails
  selectAssetHandler?: (asset: Asset) => void
}

const AssetsTableCollapsable: React.FC<Props> = (props: Props): JSX.Element => {
  const { assetsWBChains = [], selectAssetHandler = (_) => {} } = props

  const iconColumn: ColumnType<AssetWithBalance> = useMemo(
    () => ({
      title: '',
      render: ({ asset }: AssetWithBalance) => <AssetIcon asset={asset} size="normal" />
    }),
    []
  )

  const columns = [iconColumn]

  const onRow = useCallback(
    ({ asset }: AssetWithBalance) => {
      return {
        onClick: () => selectAssetHandler(asset)
      }
    },
    [selectAssetHandler]
  )

  const renderAssetsTable = useCallback(
    (tableData) => {
      return (
        <Styles.TableWrapper
          showHeader={false}
          dataSource={tableData}
          loading={false}
          rowKey={({ asset }) => asset.symbol}
          onRow={onRow}
          columns={columns}
        />
      )
    },
    [onRow, columns]
  )

  return (
    <Collapse expandIconPosition="right">
      {assetsWBChains.map(({ chainName, assetsWB }, i) => (
        <Panel header={chainName} key={i}>
          {renderAssetsTable(assetsWB)}
        </Panel>
      ))}
    </Collapse>
  )
}

export default AssetsTableCollapsable
