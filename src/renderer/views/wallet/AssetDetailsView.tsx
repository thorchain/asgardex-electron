import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import AssetDetails from '../../components/wallet/assets/AssetDetails'
import TxsHistoryBNB from '../../components/wallet/txs/history/TxsHistoryBNB'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { txsSelectedAsset$, explorerUrl$, setSelectedAsset } = useBinanceContext()
  const { assetsWBState$, reloadBalancesByChain } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const selectedAsset = O.fromNullable(assetFromString(asset))

  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const reloadBalancesHandler = FP.pipe(
    selectedAsset,
    O.map(({ chain }) => () => reloadBalancesByChain(chain)),
    O.toUndefined
  )

  // Set selected asset to trigger dependent streams to get all needed data (such as its transactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(selectedAsset), [])

  const renderTxsHistoryBNB = useMemo(() => {
    return <TxsHistoryBNB txsRD={txsRD} explorerUrl={explorerUrl} />
  }, [explorerUrl, txsRD])

  const renderTxHistory = useMemo(
    () =>
      FP.pipe(
        selectedAsset,
        O.map(({ chain }) => {
          switch (chain) {
            case 'BNB':
              return renderTxsHistoryBNB
            case 'BTC':
              return <h1>Txs history BTC</h1>
            case 'ETH':
              return <h1>Txs history ETH</h1>
            default:
              return (
                <h1>
                  {intl.formatMessage(
                    { id: 'wallet.errors.invalidChain' },
                    {
                      chain: chain
                    }
                  )}
                </h1>
              )
          }
        }),
        O.getOrElse(() => <></>)
      ),
    [intl, renderTxsHistoryBNB, selectedAsset]
  )

  return (
    <>
      <AssetDetails assetsWB={assetsWB} asset={selectedAsset} reloadBalancesHandler={reloadBalancesHandler} />
      {renderTxHistory}
    </>
  )
}
export default AssetDetailsView
