import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString, AssetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'
import * as Rx from 'rxjs/operators'

import { BackLink } from '../../components/uielements/backLink'
import { Freeze } from '../../components/wallet/txs/freeze/'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getBnbAmountFromBalances, getAssetWBByAsset } from '../../helpers/walletHelper'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { FreezeAction } from '../../services/binance/types'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'
import { AssetWithBalance } from '../../services/wallet/types'

type Props = {
  freezeAction: FreezeAction
}

export const FreezeView: React.FC<Props> = ({ freezeAction }): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  const { freeze: freezeService, explorerUrl$, freezeFee$ } = useBinanceContext()
  const { assetsWBState$ } = useWalletContext()
  const fee = useObservableState<O.Option<AssetAmount>>(() => freezeFee$.pipe(Rx.map(RD.toOption)), O.none)[0]
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)
  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const oWalletBalance: O.Option<AssetWithBalance> = useMemo(() => getAssetWBByAsset(assetsWB, oSelectedAsset), [
    assetsWB,
    oSelectedAsset
  ])
  const bnbAmount = useMemo(() => FP.pipe(assetsWB, O.chain(getBnbAmountFromBalances)), [assetsWB])
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
