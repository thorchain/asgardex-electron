import React, { useEffect } from 'react'

import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import { Stake } from '../../components/stake/Stake'
import BackLink from '../../components/uielements/backLink'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { StakeRouteParams } from '../../routes/stake'
import { AddStakeView } from './AddStake/AddStakeView'
import { ShareView } from './Share/ShareView'

type Props = {}

const StakeView: React.FC<Props> = (_) => {
  const intl = useIntl()

  const { asset: assetParam } = useParams<StakeRouteParams>()
  const {
    service: {
      pools: { reloadPoolDetail },
      stake: { setAddress }
    }
  } = useMidgardContext()
  const { keystoreService } = useWalletContext()
  const { address$ } = useBinanceContext()

  // Important note:
  // DON'T use `INITIAL_KEYSTORE_STATE` as default value for `keystoreState`
  // Because `useObservableState` will set its state NOT before first rendering loop,
  // and `AddWallet` would be rendered for the first time,
  // before a check of `keystoreState` can be done
  const keystoreState = useObservableState(keystoreService.keystore$, undefined)

  const asset = assetFromString(assetParam.toUpperCase())

  const walletAddress = useObservableState(address$, O.none)

  useEffect(() => {
    const oAsset = O.fromNullable(asset)
    reloadPoolDetail(oAsset)
    setAddress(walletAddress)
  }, [asset, reloadPoolDetail, setAddress, walletAddress])

  // Special case: `keystoreState` is `undefined` in first render loop
  // (see comment at its definition using `useObservableState`)
  if (keystoreState === undefined) {
    return <></>
  }

  return (
    <>
      <BackLink />
      {!asset && (
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              asset
            }
          )}
        />
      )}
      {asset && <Stake asset={asset} keystoreState={keystoreState} ShareContent={ShareView} AddStake={AddStakeView} />}
    </>
  )
}

export default StakeView
