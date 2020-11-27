import { getDepositMemo, getWithdrawMemo } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { selectedPoolAsset$ } from '../midgard/common'
import * as THOR from '../thorchain'
import { assetAddress$ } from './address'
import { SymDepositMemoRx, MemoRx } from './types'

/**
 * Memo of symmetrical deposit txs
 */
const symDepositTxMemo$: SymDepositMemoRx = Rx.combineLatest([selectedPoolAsset$, THOR.address$, assetAddress$]).pipe(
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
const asymDepositTxMemo$: MemoRx = selectedPoolAsset$.pipe(RxOp.map(O.map(getDepositMemo)))

/**
 * Unstake memo for txs
 */
const getWithdrawMemo$ = (withdrawPercent: number): MemoRx =>
  selectedPoolAsset$.pipe(
    RxOp.map((oPoolAsset) =>
      FP.pipe(
        oPoolAsset,
        // add address of base-chain wallet to memo
        /** getWithdrawMemo gets percents between 0 and 10000 */
        O.map((poolAsset) => getWithdrawMemo(poolAsset, withdrawPercent * 100))
      )
    )
  )

// TODO(@veado) Remove it later, but leave it for #537 https://github.com/thorchain/asgardex-electron/issues/537
symDepositTxMemo$.subscribe((value) => console.log('symDepositTxMemo:', value))
asymDepositTxMemo$.subscribe((value) => console.log('asymDepositTxMemo:', value))

export { symDepositTxMemo$, asymDepositTxMemo$, symDepositAssetTxMemo$, getWithdrawMemo$ }
