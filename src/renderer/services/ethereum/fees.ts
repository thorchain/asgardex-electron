import * as RD from '@devexperts/remote-data-ts'
import { Fees } from '@xchainjs/xchain-client'
import { Address, getFee, getDefaultFees } from '@xchainjs/xchain-ethereum'
import { Chain } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as C from '../clients'
import { client$ } from './common'
import { FeesService, Client$ } from './types'

export const createFeesService: ({ client$, chain }: { client$: Client$; chain: Chain }) => FeesService =
  C.createFeesService

export const callFees$ = (
  address: Address,
  abi: ethers.ContractInterface,
  func: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Array<any>
): C.FeesLD =>
  Rx.combineLatest([client$]).pipe(
    RxOp.switchMap(([oClient]) =>
      FP.pipe(
        oClient,
        O.fold(
          () => Rx.EMPTY,
          (client) => {
            console.log(address, abi, func, params)
            return Rx.combineLatest([client.estimateCall(address, abi, func, params), client.estimateGasPrices()]).pipe(
              RxOp.map(
                ([gasLimit, gasPrices]) =>
                  ({
                    type: 'byte',
                    average: getFee({ gasPrice: gasPrices.average, gasLimit }),
                    fast: getFee({ gasPrice: gasPrices.fast, gasLimit }),
                    fastest: getFee({ gasPrice: gasPrices.fastest, gasLimit })
                  } as Fees)
              )
            )
          }
        )
      )
    ),
    RxOp.map(RD.success),
    RxOp.catchError((_) => Rx.of(RD.success(getDefaultFees()))),
    RxOp.startWith(RD.pending)
  )
