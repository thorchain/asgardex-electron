import React, { useCallback } from 'react'

import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain } from '@xchainjs/xchain-thorchain'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { isEnabledChain } from '../../../../shared/utils/chain'
import { LoadingView } from '../../../components/shared/loading'
import { BackLinkButton } from '../../../components/uielements/button'
import { useWalletContext } from '../../../contexts/WalletContext'
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

      if (!isEnabledChain(chain)) {
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
        case GAIAChain:
          return <SendViewCOSMOS asset={asset} />
      }
    },
    [intl]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => <LoadingView size="large" />,
      (selectedAsset) => (
        <div>
          <BackLinkButton />
          {renderSendView(selectedAsset)}
        </div>
      )
    )
  )
}
