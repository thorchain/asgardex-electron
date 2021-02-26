import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { Deposit } from '../../components/deposit/Deposit'
import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { DepositRouteParams } from '../../routes/deposit'
import { PoolSharesLD, PoolSharesRD } from '../../services/midgard/types'
import {} from '../../services/midgard/utils'
import { AsymDepositView } from './add/AsymDepositView'
import { SymDepositView } from './add/SymDepositView'
import { ShareView } from './share/ShareView'
import { AsymWithdrawView } from './withdraw/AsymWithdrawView'
import { WithdrawDepositView } from './withdraw/WithdrawDepositView'

type Props = {}

export const DepositView: React.FC<Props> = (_) => {
  const intl = useIntl()

  const { asset } = useParams<DepositRouteParams>()
  const {
    service: {
      setSelectedPoolAsset,
      shares: { shares$ }
    }
  } = useMidgardContext()
  const { keystoreService } = useWalletContext()

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset.toUpperCase())), [asset])

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oSelectedAsset)
  }, [oSelectedAsset, setSelectedPoolAsset])

  const { addressByChain$ } = useChainContext()

  const address$ = useMemo(
    () =>
      FP.pipe(
        oSelectedAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => addressByChain$(chain)
        )
      ),

    [addressByChain$, oSelectedAsset]
  )
  const oAssetWalletAddress = useObservableState(address$, O.none)

  /**
   * We have to get a new shares$ stream for every new address
   * @description /src/renderer/services/midgard/shares.ts
   */
  const poolShares$: PoolSharesLD = useMemo(
    () =>
      FP.pipe(
        oAssetWalletAddress,
        O.fold(() => Rx.EMPTY, shares$)
      ),
    [oAssetWalletAddress, shares$]
  )

  const poolSharesRD = useObservableState<PoolSharesRD>(poolShares$, RD.initial)

  // Important note:
  // DON'T use `INITIAL_KEYSTORE_STATE` as default value for `keystoreState`
  // Because `useObservableState` will set its state NOT before first rendering loop,
  // and `AddWallet` would be rendered for the first time,
  // before a check of `keystoreState` can be done
  const keystoreState = useObservableState(keystoreService.keystore$, undefined)

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
              asset={selectedAsset}
              shares={poolSharesRD}
              keystoreState={keystoreState}
              ShareContent={ShareView}
              SymDepositContent={SymDepositView}
              AsymDepositContent={AsymDepositView}
              WidthdrawContent={WithdrawDepositView}
              AsymWidthdrawContent={AsymWithdrawView}
            />
          )
        )
      )}
    </>
  )
}
