import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Tx, Txs, TxsPage } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmount } from '@xchainjs/xchain-util'
import { Grid, Col, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { ordString } from 'fp-ts/lib/Ord'
import { useIntl, FormattedDate, FormattedTime } from 'react-intl'

import { ZERO_BN } from '../../../../const'
import { TxsPageRD } from '../../../../services/clients'
import { MAX_ITEMS_PER_PAGE } from '../../../../services/const'
import { ApiError } from '../../../../services/wallet/types'
import { ErrorView } from '../../../shared/error'
import * as CommonStyled from '../../../uielements/common/Common.style'
import { Pagination } from '../../../uielements/pagination'
import * as Styled from './TxsTable.style'

type Props = {
  txsPageRD: TxsPageRD
  clickTxLinkHandler: (txHash: string) => void
  changePaginationHandler: (page: number) => void
}

export const TxsTable: React.FC<Props> = (props): JSX.Element => {
  const { txsPageRD, clickTxLinkHandler, changePaginationHandler } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<TxsPage>>(O.none)

  // Helper to render a text with a line break
  // That's needed to have multline texts in ant's table cell
  // and still an option to render ellipsis if a text do not fit in a cell
  const renderTextWithBreak = useCallback(
    (text: string, key: string) => (
      <Styled.Text key={key}>
        {text}
        <br key={`${key}-br`} />
      </Styled.Text>
    ),
    []
  )

  const renderTypeColumn = useCallback((_, { type }: Tx) => {
    switch (type) {
      case 'transfer':
        return <Styled.TransferIcon />
      default:
        return <></>
    }
  }, [])

  const typeColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'txType',
      title: '',
      align: 'center',
      width: 60,
      render: renderTypeColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [renderTypeColumn]
  )

  const renderFromColumn = useCallback(
    (_, { from }: Tx) =>
      from.map(({ from }, index) => {
        const key = `${from}-${index}`
        return renderTextWithBreak(from, key)
      }),
    [renderTextWithBreak]
  )

  const fromColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'fromAddr',
      title: intl.formatMessage({ id: 'common.from' }),
      align: 'left',
      ellipsis: true,
      render: renderFromColumn,
      sorter: ({ from: fromA }: Tx, { from: fromB }: Tx) =>
        // For simplicity we sort first item only
        // TODO (@Veado) Play around to get a user-friendly sort option
        ordString.compare(fromA[0]?.from ?? '', fromB[0]?.from ?? ''),
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderFromColumn]
  )

  const renderToColumn = useCallback(
    (_, { to }: Tx) =>
      to.map(({ to }, index) => {
        const key = `${to}-${index}`
        return renderTextWithBreak(to, key)
      }),
    [renderTextWithBreak]
  )

  const toColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'toAddr',
      title: intl.formatMessage({ id: 'common.to' }),
      align: 'left',
      ellipsis: true,
      render: renderToColumn,
      sorter: ({ to: toA }: Tx, { to: toB }: Tx) =>
        // For simplicity we sort first item only
        // TODO (@Veado) Play around to get a user-friendly sort option
        ordString.compare(toA[0]?.to ?? '', toB[0]?.to ?? ''),
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderToColumn]
  )

  const renderDateColumn = useCallback(
    (_, { date }: Tx) => (
      <Row gutter={[8, 0]}>
        <Col>
          <Styled.Text>
            <FormattedDate
              year={isDesktopView ? 'numeric' : '2-digit'}
              month={isDesktopView ? '2-digit' : 'numeric'}
              day={isDesktopView ? '2-digit' : 'numeric'}
              value={date}
            />
          </Styled.Text>
        </Col>
        <Col>
          <Styled.Text>
            <FormattedTime hour="2-digit" minute="2-digit" second="2-digit" hour12={false} value={date} />
          </Styled.Text>
        </Col>
      </Row>
    ),
    [isDesktopView]
  )

  const dateColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'timeStamp',
      title: intl.formatMessage({ id: 'common.date' }),
      align: 'left',
      width: isDesktopView ? 200 : 180,
      render: renderDateColumn,
      sorter: (a: Tx, b: Tx) => a.date.getTime() - b.date.getTime(),
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend'
    }),
    [intl, isDesktopView, renderDateColumn]
  )

  const renderAmountColumn = useCallback(
    (_, { to }: Tx) =>
      to.map(({ amount, to }, index) => {
        const key = `${to}-${index}`
        const text = formatAssetAmount({ amount: baseToAsset(amount), trimZeros: true })
        return renderTextWithBreak(text, key)
      }),
    [renderTextWithBreak]
  )

  const amountColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'value',
      title: intl.formatMessage({ id: 'common.amount' }),
      align: 'left',
      width: 200,
      render: renderAmountColumn,
      sorter: ({ to: toA }: Tx, { to: toB }: Tx) =>
        // For simplicity we sort first item only
        // TODO (@Veado) Play around to get a user-friendly sort option
        (toA[0]?.amount.amount() ?? ZERO_BN).comparedTo(toB[0]?.amount.amount() ?? ZERO_BN),
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderAmountColumn]
  )

  const renderLinkColumn = useCallback(
    ({ hash }: Tx) => <CommonStyled.ExternalLinkIcon onClick={() => clickTxLinkHandler(hash)} />,
    [clickTxLinkHandler]
  )
  const linkColumn: ColumnType<Tx> = useMemo(
    () => ({
      key: 'txHash',
      title: '',
      align: 'center',
      width: 60,
      render: renderLinkColumn
    }),
    [renderLinkColumn]
  )

  const desktopColumns: ColumnsType<Tx> = useMemo(
    () => [typeColumn, fromColumn, toColumn, amountColumn, dateColumn, linkColumn],
    [typeColumn, fromColumn, toColumn, amountColumn, dateColumn, linkColumn]
  )

  const mobileColumns: ColumnsType<Tx> = useMemo(() => [typeColumn, amountColumn, dateColumn, linkColumn], [
    typeColumn,
    amountColumn,
    dateColumn,
    linkColumn
  ])

  const renderTable = useCallback(
    ({ total, txs }: TxsPage, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return (
        <>
          <Styled.Table columns={columns} dataSource={txs} loading={loading} rowKey="hash" />
          {total > 0 && (
            <Pagination
              defaultCurrent={1}
              total={total}
              defaultPageSize={MAX_ITEMS_PER_PAGE}
              showSizeChanger={false}
              onChange={changePaginationHandler}
            />
          )}
        </>
      )
    },
    [desktopColumns, isDesktopView, mobileColumns, changePaginationHandler]
  )

  const emptyTableData = useMemo((): TxsPage => ({ total: 0, txs: [] as Txs }), [])

  const renderContent = useMemo(
    () => (
      <>
        {RD.fold(
          () => renderTable(emptyTableData, true),
          () => {
            const data = FP.pipe(
              previousTxs.current,
              O.getOrElse(() => emptyTableData)
            )
            return renderTable(data, true)
          },
          ({ msg }: ApiError) => <ErrorView title={msg} />,
          (data: TxsPage): JSX.Element => {
            previousTxs.current = O.some(data)
            return renderTable(data)
          }
        )(txsPageRD)}
      </>
    ),
    [txsPageRD, renderTable, emptyTableData]
  )

  return renderContent
}
