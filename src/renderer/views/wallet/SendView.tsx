import React, { useMemo } from 'react'

import { initial } from '@devexperts/remote-data-ts'
import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import ErrorView from '../../components/shared/error/ErrorView'
import { LoadingView } from '../../components/shared/loading/LoadingView'
import BackLink from '../../components/uielements/backLink'
import Send from '../../components/wallet/txs/Send'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { SendParams } from '../../routes/wallet'
import * as walletRoutes from '../../routes/wallet'
import { toAssetWithBalances, getAssetWithBalance } from '../../services/binance/utils'

type Props = {}

const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const intl = useIntl()

  const { transaction: transactionService, balancesState$ } = useBinanceContext()
  const balancesState = useObservableState(balancesState$, initial)
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
              {FP.pipe(
                balances,
                RD.fold(
                  () => <></>,
                  () => <LoadingView />,
                  (e) => <ErrorView title={e.message} />,
                  (balances) => (
                    <Send selectedAsset={selectedAsset} transactionService={transactionService} balances={balances} />
                  )
                )
              )}
            </>
          )
        )
      )}
    </>
  )
}

export default SendView
