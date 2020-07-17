import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs, Tx, Address } from '@thorchain/asgardex-binance'
import { Asset, assetAmount, assetToString, formatAssetAmountCurrency, bnOrZero } from '@thorchain/asgardex-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl, FormattedDate, FormattedTime } from 'react-intl'

import { TxsRD } from '../../services/binance/types'
import ErrorView from '../shared/error/ErrorView'
import * as Styled from './TransactionTable.style'

type Props = {
  txsRD: TxsRD
  address: O.Option<Address>
  asset: O.Option<Asset>
  clickTxLinkHandler: (txHash: string) => void
}
const TransactionsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD, asset: oAsset, clickTxLinkHandler } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const renderTypeColumn = useCallback(({ txType }: Tx) => <Styled.Text>{txType}</Styled.Text>, [])
  const typeColumn: ColumnType<Tx> = {
    key: 'txType',
    title: intl.formatMessage({ id: 'common.type' }),
    align: 'left',
    render: renderTypeColumn
  }

  const renderFromColumn = useCallback(({ fromAddr }: Tx) => <Styled.Text>{fromAddr}</Styled.Text>, [])
  const fromColumn: ColumnType<Tx> = {
    key: 'fromAddr',
    title: intl.formatMessage({ id: 'common.from' }),
    align: 'left',
    render: renderFromColumn
  }

  const renderToColumn = useCallback(({ toAddr }: Tx) => <Styled.Text>{toAddr}</Styled.Text>, [])
  const toColumn: ColumnType<Tx> = {
    key: 'toAddr',
    title: intl.formatMessage({ id: 'common.to' }),
    align: 'left',
    render: renderToColumn
  }

  const renderDateColumn = useCallback(({ timeStamp }: Tx) => {
    const date = new Date(timeStamp)
    return (
      <>
        <FormattedDate value={date} />
        <FormattedTime value={date} />
      </>
    )
  }, [])
  const dateColumn: ColumnType<Tx> = {
    key: 'timeStamp',
    title: intl.formatMessage({ id: 'common.date' }),
    align: 'left',
    render: renderDateColumn
  }

  const renderAmountColumn = useCallback(
    ({ value }: Tx) =>
      FP.pipe(
        oAsset,
        O.fold(
          () => <></>,
          (asset) => {
            const amount = assetAmount(bnOrZero(value))
            const label = formatAssetAmountCurrency(amount, assetToString(asset), 3)
            return <Styled.Text>{label}</Styled.Text>
          }
        )
      ),
    [oAsset]
  )
  const amountColumn: ColumnType<Tx> = {
    key: 'value',
    title: intl.formatMessage({ id: 'common.amount' }),
    align: 'left',
    render: renderAmountColumn
  }

  const renderLinkColumn = useCallback(
    ({ txHash }: Tx) => <Styled.Link onClick={() => clickTxLinkHandler(txHash)}>LINK</Styled.Link>,
    [clickTxLinkHandler]
  )
  const linkColumn: ColumnType<Tx> = {
    key: 'txHash',
    title: '',
    align: 'left',
    render: renderLinkColumn
  }

  const desktopColumns: ColumnsType<Tx> = [typeColumn, fromColumn, toColumn, dateColumn, amountColumn, linkColumn]

  const mobileColumns: ColumnsType<Tx> = [amountColumn, dateColumn, linkColumn]

  const renderTable = useCallback(
    (txs: Txs, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return <Styled.Table columns={columns} dataSource={txs} loading={loading} rowKey="key" />
    },
    [desktopColumns, isDesktopView, mobileColumns]
  )

  const renderContent = useMemo(
    () => (
      <>
        {RD.fold(
          () => renderTable([], true),
          () => renderTable([], true),
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          (txs: Txs): JSX.Element => renderTable(txs)
        )(txsRD)}
      </>
    ),
    [txsRD, renderTable]
  )

  return renderContent
}
export default TransactionsTable
