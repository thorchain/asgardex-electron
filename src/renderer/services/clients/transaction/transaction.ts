import { XChainClient$ } from '../types'
import * as H from './history'
import { createTransferService } from './transfer'

export const transactionServiceFactory = <T = void>(client$: XChainClient$<T>) => {
  return {
    txs$: H.txsByClient$(client$),
    tx$: H.txByClient$(client$),
    ...createTransferService(client$)
  }
}
