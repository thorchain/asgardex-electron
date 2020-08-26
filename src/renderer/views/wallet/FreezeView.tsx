import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { initial } from '@devexperts/remote-data-ts'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import BackLink from '../../components/uielements/backLink'
import Freeze from '../../components/wallet/txs/Freeze'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { getBnbAmount } from '../../helpers/binanceHelper'
import { useSingleTxFee } from '../../hooks/useSingleTxFee'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { FreezeAction, AssetsWithBalance } from '../../services/binance/types'
import { toAssetWithBalances, getAssetWithBalance } from '../../services/binance/utils'

type Props = {
  freezeAction: FreezeAction
}

const FreezeView: React.FC<Props> = ({ freezeAction }): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const intl = useIntl()

  const { freeze: freezeService, balancesState$, explorerUrl$, transferFees$ } = useBinanceContext()
  const fee = useSingleTxFee(transferFees$)
  const balancesState = useObservableState(balancesState$, initial)
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const assetsWB = useMemo(
    () =>
      FP.pipe(
        toAssetWithBalances(balancesState, intl),
        RD.getOrElse(() => [] as AssetsWithBalance)
      ),
    [balancesState, intl]
  )
  const oSelectedAssetWB = useMemo(() => getAssetWithBalance(assetsWB, oSelectedAsset), [oSelectedAsset, assetsWB])
  const bnbAmount = useMemo(() => FP.pipe(assetsWB, getBnbAmount), [assetsWB])
  return (
    <>
      {FP.pipe(
        oSelectedAssetWB,
        O.fold(
          () => <></>,
          (selectedAsset) => (
            <>
              <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(selectedAsset.asset) })} />
              <Freeze
                freezeAction={freezeAction}
                selectedAsset={selectedAsset}
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
