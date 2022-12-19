import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, Asset, baseAmount } from '@xchainjs/xchain-util'
import * as Eq from 'fp-ts/lib/Eq'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { SaversDetails } from '../../components/savers/SaversDetails'
import { ErrorView } from '../../components/shared/error'
import { Spin } from '../../components/shared/loading'
import { FlatButton } from '../../components/uielements/button'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { eqAsset, eqString } from '../../helpers/fp/eq'
import * as PoolHelpers from '../../helpers/poolHelper'
import { useNetwork } from '../../hooks/useNetwork'
import { usePricePool } from '../../hooks/usePricePool'
import { PoolDetails } from '../../services/midgard/types'
import { SaverProviderRD } from '../../services/thorchain/types'

type Props = {
  asset: Asset
  address: Address
  poolDetails: PoolDetails
}

type UpdateSaverProvider = { address: Address; asset: Asset }

const eqUpdateSaverProvider = Eq.struct<UpdateSaverProvider>({
  address: eqString,
  asset: eqAsset
})

export const SaversDetailsView: React.FC<Props> = (props): JSX.Element => {
  const { asset, address, poolDetails } = props

  const intl = useIntl()

  const { network } = useNetwork()

  const pricePool = usePricePool()
  const { getSaverProvider$, reloadSaverProvider } = useThorchainContext()

  const [saverProviderRD, updateSaverProvider$] = useObservableState<
    SaverProviderRD,
    { address: Address; asset: Asset }
  >(
    (updated$) =>
      FP.pipe(
        updated$,
        RxOp.debounceTime(300),
        RxOp.distinctUntilChanged(eqUpdateSaverProvider.equals),
        RxOp.switchMap(({ address, asset }) => getSaverProvider$(asset, address))
      ),
    RD.initial
  )

  useEffect(() => {
    updateSaverProvider$({ address, asset })
  }, [address, asset, updateSaverProvider$])

  const renderLoading = () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spin size="default" />,
    </div>
  )

  return FP.pipe(
    saverProviderRD,
    RD.fold(
      () => renderLoading(),
      () => renderLoading(),
      (error) => (
        <ErrorView
          title={intl.formatMessage({ id: 'common.error' })}
          subTitle={error?.message ?? error.toString()}
          extra={<FlatButton onClick={reloadSaverProvider}>{intl.formatMessage({ id: 'common.retry' })}</FlatButton>}
        />
      ),
      ({ depositValue, redeemValue, growthPercent }) => {
        const depositPrice = FP.pipe(
          PoolHelpers.getPoolPriceValue({
            balance: { asset, amount: depositValue },
            poolDetails,
            pricePool,
            network
          }),
          O.getOrElse(() => baseAmount(0, depositValue.decimal))
        )

        const redeemPrice = FP.pipe(
          PoolHelpers.getPoolPriceValue({
            balance: { asset, amount: redeemValue },
            poolDetails,
            pricePool,
            network
          }),
          O.getOrElse(() => baseAmount(0, depositValue.decimal))
        )

        return (
          <SaversDetails
            asset={asset}
            priceAsset={pricePool.asset}
            deposit={{ amount: depositValue, price: depositPrice }}
            redeem={{ amount: redeemValue, price: redeemPrice }}
            percent={growthPercent}
          />
        )
      }
    )
  )
}
