/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { TxHash } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { GetRowKey } from 'rc-table/lib/interface'
import { FormattedDateParts, FormattedTime } from 'react-intl'

import { Action, Actions, ActionsPage, Tx } from '../../services/midgard/types'
import { AssetWithAmount } from '../../types/asgardex'
import * as Styled from './PoolActionsHistory.styles'
import { Filter } from './types'

export const getTxId = (action: Action): O.Option<TxHash> => {
  return FP.pipe(
    action.in,
    A.head,
    O.alt(() => FP.pipe(action.out, A.head)),
    O.map(({ txID }) => txID),
    // Filter out empty strings
    O.filter((id) => !!id)
  )
}

export const getValues = (txs: Tx[]): AssetWithAmount[] =>
  FP.pipe(
    txs,
    A.map(({ values }) => values),
    A.flatten
  )

export const CustomFormattedDate = (props: any) => (
  <FormattedDateParts value={props.date}>
    {(parts: any[]) => {
      const day = parts.filter((part) => part.type === 'day')[0].value
      const month = parts.filter((part) => part.type === 'month')[0].value
      const year = parts.filter((part) => part.type === 'year')[0].value
      return (
        <>
          {day}.{month}.{year}
        </>
      )
    }}
  </FormattedDateParts>
)

export const renderDate = (date: Date) => (
  <Styled.DateContainer>
    <CustomFormattedDate date={date} />
    &nbsp;
    <FormattedTime hour="2-digit" minute="2-digit" hour12={false} value={date} />
  </Styled.DateContainer>
)

export const getRowKey: GetRowKey<Action> = (action, index) =>
  FP.pipe(
    action,
    getTxId,
    O.map((txHash) => `${txHash}-${index}`),
    O.getOrElse(() => `${action.date.toString()}-${action.type}-${index}`)
  )

export const emptyData: ActionsPage = { total: 0, actions: [] as Actions }

export const historyFilterToViewblockFilter = (filter: Filter) => {
  switch (filter) {
    case 'DEPOSIT':
      return 'addLiquidity'
    case 'SWAP':
      return 'swap'
    case 'WITHDRAW':
      return 'withdrawLiquidity'
    case 'DONATE':
      return 'donate'
    case 'SWITCH':
      return 'switch'
    // 'ALL' and others will be matched to viewblock's 'all'
    case 'ALL':
    case 'REFUND': // does not exist at viewblock
    case 'UNKNOWN':
      return 'all'
  }
}
