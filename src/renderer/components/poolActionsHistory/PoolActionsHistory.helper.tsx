import React from 'react'

import { TxHash } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { FormattedDate, FormattedTime } from 'react-intl'

import { PoolAction, PoolActions, PoolActionsHistoryPage, Tx } from '../../services/midgard/types'
import { AssetWithAmount } from '../../types/asgardex'
import * as Styled from './PoolActionsHistory.styles'

export const getTxId = (action: PoolAction): O.Option<TxHash> => {
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

export const renderDate = (date: Date) => (
  <Styled.DateContainer>
    <FormattedDate year={'numeric'} month={'2-digit'} day={'2-digit'} value={date} />
    &nbsp;
    <FormattedTime hour="2-digit" minute="2-digit" hour12={false} value={date} />
  </Styled.DateContainer>
)

export const getRowKey = (action: PoolAction) =>
  FP.pipe(
    action,
    getTxId,
    O.map(FP.identity),
    O.getOrElse(() => `${action.date.toString()}-${action.type}`)
  )

export const emptyData: PoolActionsHistoryPage = { total: 0, actions: [] as PoolActions }
