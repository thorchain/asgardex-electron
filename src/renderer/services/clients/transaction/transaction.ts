import { XChainClient$ } from '../types'
import * as H from './history'
import { createTransferService } from './transfer'

export const transactionServiceFactory = <T extends XChainClient$<any>>(client$: T) => {
  return {
    txs$: H.txs$(client$),
    ...createTransferService(client$)
  }
}
