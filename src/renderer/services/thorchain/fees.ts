import { Chain } from '../../../shared/utils/chain'
import * as C from '../clients'
import { Client$, FeesService } from './types'

export const createFeesService: ({ client$, chain }: { client$: Client$; chain: Chain }) => FeesService =
  C.createFeesService
