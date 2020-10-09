import React, { useCallback, useMemo } from 'react'

import { Asset, assetFromString, assetToString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import ErrorView from '../../../components/shared/error/ErrorView'
import BackLink from '../../../components/uielements/backLink'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../../services/wallet/const'
import SendViewBNB from './SendViewBNB'
import SendViewBTC from './SendViewBTC'
import SendViewETH from './SendViewETH'

type Props = {}

const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset } = useParams<SendParams>()
  const intl = useIntl()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const { assetsWBState$ } = useWalletContext()
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const { reloadFees } = useBitcoinContext()

  const renderAssetError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              asset
            }
          )}
        />
      </>
    ),
    [asset, intl]
  )

  const renderSendView = useCallback(
    (asset: Asset) => {
      switch (asset.chain) {
        case 'BNB':
          return <SendViewBNB selectedAsset={asset} assetsWB={assetsWB} />
        case 'BTC':
          return <SendViewBTC btcAsset={asset} assetsWB={assetsWB} reloadFeesHandler={reloadFees} />
        case 'ETH':
          return <SendViewETH />
        default:
          return (
            <h1>
              {intl.formatMessage(
                { id: 'wallet.errors.invalidChain' },
                {
                  chain: asset.chain
                }
              )}
            </h1>
          )
      }
    },
    [assetsWB, intl, reloadFees]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => renderAssetError,
      (asset) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(asset) })} />
          {renderSendView(asset)}
        </>
      )
    )
  )
}

export default SendView
