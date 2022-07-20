import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  assetToString,
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
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { WalletType } from '../../../../shared/wallet/types'
import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { getAssetWalletParams } from '../../../helpers/routeHelper'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
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
  const routeParams = useParams<SendParams>()
  const oRouteParams = getAssetWalletParams(routeParams)

  const intl = useIntl()

  const renderRouteError = useMemo(() => {
    const { asset, walletAddress, walletType, walletIndex } = routeParams
    return (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `asset: ${asset} , walletAddress: ${walletAddress}, walletType: ${walletType}, walletIndex: ${walletIndex}`
            }
          )}
        />
      </>
    )
  }, [intl, routeParams])

  const renderSendView = useCallback(
    ({
      asset,
      walletAddress,
      walletType,
      walletIndex
    }: {
      asset: Asset
      walletAddress: Address
      walletType: WalletType
      walletIndex: number
    }) => {
      switch (asset.chain) {
        case BNBChain:
          return (
            <SendViewBNB
              walletType={walletType}
              walletAddress={walletAddress}
              walletIndex={walletIndex}
              asset={asset}
            />
          )
        case BCHChain:
          return <SendViewBCH walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case BTCChain:
          return <SendViewBTC walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case ETHChain:
          return (
            <SendViewETH
              walletType={walletType}
              walletIndex={walletIndex}
              walletAddress={walletAddress}
              asset={asset}
            />
          )
        case THORChain:
          return <SendViewTHOR walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case LTCChain:
          return <SendViewLTC walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case DOGEChain:
          return <SendViewDOGE walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case CosmosChain:
          return <SendViewCOSMOS walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
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
    [intl]
  )

  return FP.pipe(
    oRouteParams,
    O.fold(
      () => renderRouteError,
      ({ asset, walletAddress, walletType, walletIndex }) => (
        <>
          <BackLink
            path={walletRoutes.assetDetail.path({
              asset: assetToString(asset),
              walletAddress,
              walletType,
              walletIndex: walletIndex.toString()
            })}
          />
          {renderSendView({ asset, walletAddress, walletType, walletIndex })}
        </>
      )
    )
  )
}
