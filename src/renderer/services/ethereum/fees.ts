import { Chain } from '@xchainjs/xchain-util'

import * as C from '../clients'
import { FeesService, Client$ } from './types'

export const createFeesService: ({ client$, chain }: { client$: Client$; chain: Chain }) => FeesService =
  C.createFeesService
