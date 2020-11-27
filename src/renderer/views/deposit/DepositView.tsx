import React, { useEffect, useMemo } from 'react'

import { assetFromString, Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Deposit } from '../../components/deposit/Deposit'
import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getDefaultRuneAsset } from '../../helpers/assetHelper'
import { StakeRouteParams } from '../../routes/stake'
import { AddDepositView } from './add/AddDepositView'
import { ShareView } from './share/ShareView'
import { WithdrawDepositView } from './withdraw/WithdrawDepositView'

type Props = {}

export const DepositView: React.FC<Props> = (_) => {
  const intl = useIntl()

  const { asset } = useParams<StakeRouteParams>()
  const {
    service: {
      setSelectedPoolAsset,
      stake: { setAddress },
      pools: { runeAsset$ }
    }
  } = useMidgardContext()
  const { keystoreService } = useWalletContext()
  const { address$ } = useBinanceContext()

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset.toUpperCase())), [asset])

  const runeAsset = useObservableState(
    runeAsset$,
    getDefaultRuneAsset(
      FP.pipe(
        oSelectedAsset,
        O.map((asset) => asset.chain),
        // In this case we don't care about deafult value as invalid
        // asset will be processed in a separate branch of O.fold
        O.getOrElse((): Chain => 'BNB')
      )
    )
  )

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oSelectedAsset)
  }, [oSelectedAsset, setSelectedPoolAsset])

  // Important note:
  // DON'T use `INITIAL_KEYSTORE_STATE` as default value for `keystoreState`
  // Because `useObservableState` will set its state NOT before first rendering loop,
  // and `AddWallet` would be rendered for the first time,
  // before a check of `keystoreState` can be done
  const keystoreState = useObservableState(keystoreService.keystore$, undefined)

  const walletAddress = useObservableState(address$, O.none)

  useEffect(() => {
    setAddress(walletAddress)
  }, [setAddress, walletAddress])

  // Special case: `keystoreState` is `undefined` in first render loop
  // (see comment at its definition using `useObservableState`)
  if (keystoreState === undefined) {
    return <></>
  }

  return (
    <>
      <BackLink />
      {FP.pipe(
        oSelectedAsset,
        O.fold(
          () => (
            <ErrorView
              title={intl.formatMessage(
                { id: 'routes.invalid.asset' },
                {
                  asset
                }
              )}
            />
          ),
          (selectedAsset) => (
            <Deposit
              runeAsset={runeAsset}
              asset={selectedAsset}
              keystoreState={keystoreState}
              ShareContent={ShareView}
              DepositContent={AddDepositView}
              WidthdrawContent={WithdrawDepositView}
            />
          )
        )
      )}
    </>
  )
}
