import React, { useCallback } from 'react'

import {
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { LoadingView } from '../../../components/shared/loading'
import { BackLink } from '../../../components/uielements/backLink'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'
import { SelectedWalletAsset } from '../../../services/wallet/types'
import {
  SendViewBNB,
  SendViewBCH,
  SendViewBTC,
  SendViewETH,
  SendViewDOGE,
  SendViewTHOR,
  SendViewLTC,
  SendViewCOSMOS
} from './index'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const intl = useIntl()

  const { selectedAsset$ } = useWalletContext()

  const oSelectedAsset = useObservableState(selectedAsset$, O.none)

  const renderSendView = useCallback(
    (asset: SelectedWalletAsset) => {
      const {
        asset: { chain }
      } = asset
      switch (chain) {
        case BNBChain:
          return <SendViewBNB asset={asset} />
        case BCHChain:
          return <SendViewBCH asset={asset} />
        case BTCChain:
          return <SendViewBTC asset={asset} />
        case ETHChain:
          return <SendViewETH asset={asset} />
        case THORChain:
          return <SendViewTHOR asset={asset} />
        case LTCChain:
          return <SendViewLTC asset={asset} />
        case DOGEChain:
          return <SendViewDOGE asset={asset} />
        case CosmosChain:
          return <SendViewCOSMOS asset={asset} />
        default:
          return (
            <h1>
              {intl.formatMessage(
                { id: 'wallet.errors.invalidChain' },
                {
                  chain
                }
              )}
            </h1>
          )
      }
    },
    [intl]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => <LoadingView size="large" />,
      (selectedAsset) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path()} />
          {renderSendView(selectedAsset)}
        </>
      )
    )
  )
}
