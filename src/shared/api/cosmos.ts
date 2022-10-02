import axios from 'axios'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'

import { mapIOErrors } from '../utils/fp'

const latestBlockIO = t.type({
  block: t.type({ header: t.type({ chain_id: t.string }) })
})

export type LatestBlockIO = t.TypeOf<typeof latestBlockIO>

/**
 * Get chain id
 * via Tendermint RPC - endpoint `blocks/latest`
 * https://v1.cosmos.network/rpc/v0.45.1
 * */
export const getChainId = (url: string): TE.TaskEither<Error, string> =>
  FP.pipe(
    TE.tryCatch(() => axios.get(`${url}/blocks/latest`), E.toError),
    TE.map((response) => response.data),
    TE.chain(FP.flow(latestBlockIO.decode, E.mapLeft(mapIOErrors), TE.fromEither)),
    TE.map((data) => data.block.header.chain_id)
  )
