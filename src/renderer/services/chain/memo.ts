import { getDepositMemo } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { selectedPoolAsset$ } from '../midgard/common'
import { runeAddress$, assetAddress$ } from './address'
import { AsymDepositMemoRx, MemoRx } from './types'

/**
 * Memo of symmetrical deposit txs
 */
const symDepositTxMemo$: AsymDepositMemoRx = Rx.combineLatest([selectedPoolAsset$, runeAddress$, assetAddress$]).pipe(
  RxOp.map(([oPoolAsset, oRuneAddress, oAssetAddress]) =>
    FP.pipe(
      sequenceTOption(oPoolAsset, oRuneAddress, oAssetAddress),
      // add address of base-chain wallet to memo
      O.map(([poolAsset, runeAddress, assetAddress]) => ({
        rune: getDepositMemo(poolAsset, assetAddress),
        asset: getDepositMemo(poolAsset, runeAddress)
      }))
    )
  )
)

const symDepositAssetTxMemo$: MemoRx = symDepositTxMemo$.pipe(RxOp.map(FP.flow(O.map(({ asset }) => asset))))

/**
 * Memo of asymmetrical deposit txs
 */
const asymDepositTxMemo$: MemoRx = selectedPoolAsset$.pipe(
  RxOp.map((oPoolAsset) =>
    FP.pipe(
      oPoolAsset,
      O.map((poolAsset) => getDepositMemo(poolAsset))
    )
  )
)

// TODO(@veado) Remove it later, but leave it for #537 https://github.com/thorchain/asgardex-electron/issues/537
symDepositTxMemo$.subscribe((value) => console.log('symDepositTxMemo:', value))
asymDepositTxMemo$.subscribe((value) => console.log('asymDepositTxMemo:', value))

export { symDepositTxMemo$, asymDepositTxMemo$, symDepositAssetTxMemo$ }
