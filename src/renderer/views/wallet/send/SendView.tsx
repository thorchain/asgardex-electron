import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
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
  TerraChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { WalletType } from '../../../../shared/wallet/types'
import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { sequenceTOption } from '../../../helpers/fpHelpers'
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
  SendViewTERRA
} from './index'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress, walletType, walletIndex: walletIndexRoute = '0' } = useParams<SendParams>()

  const oWalletAddress: O.Option<Address> = O.fromNullable(walletAddress)
  const oWalletType: O.Option<WalletType> = O.fromNullable(walletType)

  const walletIndex = parseInt(walletIndexRoute)
  const intl = useIntl()

  const oSelectedAsset: O.Option<Asset> = useMemo(
    () => FP.pipe(O.fromNullable(asset), O.map(assetFromString), O.chain(O.fromNullable)),
    [asset]
  )

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
    ({ asset, walletAddress, walletType }: { asset: Asset; walletAddress: Address; walletType: WalletType }) => {
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
        case TerraChain:
          return (
            <SendViewTERRA
              walletType={walletType}
              walletIndex={walletIndex}
              walletAddress={walletAddress}
              asset={asset}
            />
          )
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
    [walletIndex, intl]
  )

  return FP.pipe(
    sequenceTOption(oSelectedAsset, oWalletAddress, oWalletType),
    O.fold(
      () => renderAssetError,
      ([asset, walletAddress, walletType]) => (
        <>
          <BackLink
            path={walletRoutes.assetDetail.path({
              asset: assetToString(asset),
              walletAddress,
              walletType,
              walletIndex: walletIndexRoute
            })}
          />
          {renderSendView({ asset, walletAddress, walletType })}
        </>
      )
    )
  )
}
