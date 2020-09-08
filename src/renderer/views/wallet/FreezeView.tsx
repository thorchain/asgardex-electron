import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { initial } from '@devexperts/remote-data-ts'
import { assetFromString, assetToString, AssetAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'
import * as Rx from 'rxjs/operators'

import BackLink from '../../components/uielements/backLink'
import Freeze from '../../components/wallet/txs/Freeze'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { getBnbAmountFromBalances, getAssetWBByAsset } from '../../helpers/walletHelper'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { FreezeAction } from '../../services/binance/types'
import { AssetWithBalance } from '../../services/wallet/types'

type Props = {
  freezeAction: FreezeAction
}

const FreezeView: React.FC<Props> = ({ freezeAction }): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const { freeze: freezeService, assetsWB$, explorerUrl$, freezeFee$ } = useBinanceContext()
  const fee = useObservableState<O.Option<AssetAmount>>(() => freezeFee$.pipe(Rx.map(RD.toOption)), O.none)[0]
  const balancesState = useObservableState(assetsWB$, initial)
  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const oWalletBalance: O.Option<AssetWithBalance> = useMemo(() => getAssetWBByAsset(balancesState, oSelectedAsset), [
    balancesState,
    oSelectedAsset
  ])
  const bnbAmount = useMemo(() => FP.pipe(balancesState, RD.map(getBnbAmountFromBalances), RD.toOption, O.flatten), [
    balancesState
  ])
  return (
    <>
      {FP.pipe(
        oWalletBalance,
        O.fold(
          () => <></>,
          (wb) => (
            <>
              <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(wb.asset) })} />
              <Freeze
                freezeAction={freezeAction}
                selectedAsset={wb}
                freezeService={freezeService}
                explorerUrl={explorerUrl}
                fee={fee}
                bnbAmount={bnbAmount}
              />
            </>
          )
        )
      )}
    </>
  )
}

export default FreezeView
