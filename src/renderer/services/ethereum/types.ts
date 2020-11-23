import { Client } from '@thorchain/asgardex-ethereum'

import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
