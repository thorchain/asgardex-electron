import * as RD from '@devexperts/remote-data-ts'
import { Fees } from '@xchainjs/xchain-client'
import { getFee, getDefaultFees, FeesParams } from '@xchainjs/xchain-ethereum'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isEthAsset } from '../../helpers/assetHelper'
import * as C from '../clients'
import { FeesService, Client$, CallFeeParams } from './types'

export const ETH_OUT_TX_GAS_LIMIT = ethers.BigNumber.from('35609')
export const ERC20_OUT_TX_GAS_LIMIT = ethers.BigNumber.from('49610')

export const createFeesService = ({ client$, chain }: { client$: Client$; chain: Chain }): FeesService => {
  const common = C.createFeesService<FeesParams>({ client$, chain })

  const callFees$ = ({ address, abi, func, params }: CallFeeParams): C.FeesLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) =>
              Rx.combineLatest([client.estimateCall(address, abi, func, params), client.estimateGasPrices()]).pipe(
                RxOp.map(
                  ([gasLimit, gasPrices]) =>
                    ({
                      type: 'byte',
                      average: getFee({ gasPrice: gasPrices.average, gasLimit }),
                      fast: getFee({ gasPrice: gasPrices.fast, gasLimit }),
                      fastest: getFee({ gasPrice: gasPrices.fastest, gasLimit })
                    } as Fees)
                ),
                RxOp.map(RD.success),
                RxOp.catchError((_) => Rx.of(RD.success(getDefaultFees()))),
                RxOp.startWith(RD.pending)
              )
          )
        )
      )
    )

  const outTxFee$ = (asset: Asset): C.FeesLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => {
              const gasLimit = isEthAsset(asset) ? ETH_OUT_TX_GAS_LIMIT : ERC20_OUT_TX_GAS_LIMIT
              return Rx.from(client.estimateGasPrices()).pipe(
                RxOp.map(
                  (gasPrices) =>
                    ({
                      type: 'byte',
                      average: getFee({ gasPrice: gasPrices.average, gasLimit }),
                      fast: getFee({ gasPrice: gasPrices.fast, gasLimit }),
                      fastest: getFee({ gasPrice: gasPrices.fastest, gasLimit })
                    } as Fees)
                ),
                RxOp.map(RD.success),
                RxOp.catchError((_) => Rx.of(RD.success(getDefaultFees()))),
                RxOp.startWith(RD.pending)
              )
            }
          )
        )
      )
    )

  return {
    ...common,
    callFees$,
    outTxFee$
  }
}
