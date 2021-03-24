import React, { useEffect, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { PoolActionsHistoryPage } from '../../services/midgard/types'
import { PoolActionsHistoryList } from './PoolActionsHistoryList'
import { PoolActionsHistoryTable } from './PoolActionsHistoryTable'
import { Props } from './types'

export const PoolActionsHistory: React.FC<Props> = (props) => {
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  useEffect(() => {
    FP.pipe(
      props.actionsPageRD,
      RD.map((data) => {
        previousTxs.current = O.some(data)
        return true
      })
    )
  }, [props])

  return isDesktopView ? (
    <PoolActionsHistoryTable prevActionsPage={previousTxs.current} {...props} />
  ) : (
    <PoolActionsHistoryList prevActionsPage={previousTxs.current} {...props} />
  )
}
