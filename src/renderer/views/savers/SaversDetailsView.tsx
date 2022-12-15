import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { SaversDetails } from '../../components/savers/SaversDetails'
import { ErrorView } from '../../components/shared/error'
import { Spin } from '../../components/shared/loading'
import { FlatButton } from '../../components/uielements/button'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { SaverProviderRD } from '../../services/thorchain/types'

type Props = {
  asset: Asset
  address: Address
}

export const SaversDetailsView: React.FC<Props> = (props): JSX.Element => {
  const { asset, address } = props

  const intl = useIntl()

  const { getSaverProvider$, reloadSaverProvider } = useThorchainContext()

  const [saverProviderRD, updateSaverProvider$] = useObservableState<
    SaverProviderRD,
    { address: Address; asset: Asset }
  >(
    (updated$) =>
      FP.pipe(
        updated$,
        RxOp.debounceTime(300),
        RxOp.switchMap(({ address, asset }) => getSaverProvider$(asset, address))
      ),
    RD.initial
  )

  useEffect(() => {
    updateSaverProvider$({ address, asset })
  }, [address, asset, updateSaverProvider$])

  const renderNoSavings = useMemo(
    () => (
      <div className="flex h-full w-full items-center justify-center">
        {intl.formatMessage({
          id: 'deposit.pool.noShares'
        })}
      </div>
    ),
    [intl]
  )

  return FP.pipe(
    saverProviderRD,
    RD.fold(
      () => renderNoSavings,
      () => (
        <div className="flex h-full w-full items-center justify-center">
          <Spin size="default" />,
        </div>
      ),
      (error) => (
        <ErrorView
          title={intl.formatMessage({ id: 'common.error' })}
          subTitle={error?.message ?? error.toString()}
          extra={<FlatButton onClick={reloadSaverProvider}>{intl.formatMessage({ id: 'common.retry' })}</FlatButton>}
        />
      ),
      (_saverProvider) => <SaversDetails asset={asset} />
    )
  )
}
