import React, { useMemo } from 'react'

import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { AddressValidation } from '../../../services/bitcoin/types'
import { NonEmptyAssetsWithBalance } from '../../../services/wallet/types'

type Props = {
  selectedAsset: Asset
  assetsWB: O.Option<NonEmptyAssetsWithBalance>
}

const SendViewBTC: React.FC<Props> = (props: Props): JSX.Element => {
  const { selectedAsset, assetsWB } = props
  const { fees$, pushTx, reloadFees, txRD$, client$ } = useBitcoinContext()

  const _wip = {
    selectedAsset,
    assetsWB,
    pushTx,
    reloadFees,
    txRD$
  }
  const client = useObservableState<O.Option<BitcoinClient>>(client$, O.none)
  const _fees = useObservableState(fees$)

  const _addressValidation = useMemo(
    () =>
      FP.pipe(
        client,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [client]
  )

  return <h1>Send BTC - coming soon ...</h1>
}

export default SendViewBTC
