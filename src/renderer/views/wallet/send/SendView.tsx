import React, { useCallback, useMemo } from 'react'

import {
  Asset,
  assetFromString,
  assetToString,
  BCHChain,
  BNBChain,
  BTCChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
import { SendViewBNB, SendViewBCH, SendViewBTC, SendViewETH, SendViewDOGE, SendViewTHOR, SendViewLTC } from './index'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress, walletType, walletIndex: walletIndexRoute } = useParams<SendParams>()

  const walletIndex = parseInt(walletIndexRoute)
  const intl = useIntl()

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

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
          return <SendViewBCH walletAddress={walletAddress} walletType={walletType} walletIndex={walletIndex} />
        case BTCChain:
          return <SendViewBTC walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case ETHChain:
          return <SendViewETH walletType={walletType} walletIndex={walletIndex} asset={asset} />
        case THORChain:
          return <SendViewTHOR walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />
        case LTCChain:
          return <SendViewLTC walletType={walletType} walletIndex={walletIndex} asset={asset} />
        case DOGEChain:
          return <SendViewDOGE walletType={walletType} walletIndex={walletIndex} asset={asset} />
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
    [walletType, walletAddress, walletIndex, intl]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => renderAssetError,
      (asset) => (
        <>
          <BackLink
            path={walletRoutes.assetDetail.path({
              asset: assetToString(asset),
              walletAddress,
              walletType,
              walletIndex: walletIndexRoute
            })}
          />
          {renderSendView(asset)}
        </>
      )
    )
  )
}
