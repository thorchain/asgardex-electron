import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import ErrorView from '../../components/shared/error/ErrorView'
import BackLink from '../../components/uielements/backLink'
import Freeze from '../../components/wallet/txs/Freeze'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { FreezeAction } from '../../services/binance/types'
import { toAssetWithBalances, getAssetWithBalance } from '../../services/binance/utils'

type Props = {
  freezeAction: FreezeAction
}

const FreezeView: React.FC<Props> = ({ freezeAction }): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const intl = useIntl()

  const { freeze: freezeService, balancesState$, explorerUrl$ } = useBinanceContext()
  const balancesState = useObservableState(balancesState$, initial)
  const explorerUrl = useObservableState(explorerUrl$, O.none)
  const balances = useMemo(() => toAssetWithBalances(balancesState, intl), [balancesState, intl])
  const oSelectedAssetWB = useMemo(() => getAssetWithBalance(balances, oSelectedAsset), [oSelectedAsset, balances])

  return (
    <>
      {FP.pipe(
        oSelectedAssetWB,
        O.fold(
          () => (
            <>
              <BackLink />
              <ErrorView title={`Parsing asset ${asset} from route failed`} />
            </>
          ),
          (selectedAsset) => (
            <>
              <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(selectedAsset.asset) })} />
              <Freeze
                freezeAction={freezeAction}
                selectedAsset={selectedAsset}
                freezeService={freezeService}
                explorerUrl={explorerUrl}
              />
            </>
          )
        )
      )}
    </>
  )
}

export default FreezeView
