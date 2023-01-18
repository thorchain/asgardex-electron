import { Fragment, useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Tab } from '@headlessui/react'
import { Address, Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Chain } from '../../../shared/utils/chain'
import { isLedgerWallet, isWalletType } from '../../../shared/utils/guard'
import { WalletType } from '../../../shared/wallet/types'
import { AddSavers } from '../../components/savers/AddSavers'
import { WithdrawSavers } from '../../components/savers/WithdrawSavers'
import { ErrorView } from '../../components/shared/error'
import { Spin } from '../../components/shared/loading'
import { BackLinkButton, FlatButton, RefreshButton } from '../../components/uielements/button'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getAssetFromNullableString } from '../../helpers/assetHelper'
import { eqChain, eqNetwork, eqWalletType } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { addressFromOptionalWalletAddress } from '../../helpers/walletHelper'
import { useNetwork } from '../../hooks/useNetwork'
import { usePricePool } from '../../hooks/usePricePool'
import * as poolsRoutes from '../../routes/pools'
import { SaversRouteParams } from '../../routes/pools/savers'
import * as saversRoutes from '../../routes/pools/savers'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { ledgerAddressToWalletAddress } from '../../services/wallet/util'
import { BaseAmountRD } from '../../types'
import { SaversDetailsView } from './SaversDetailsView'

enum TabIndex {
  ADD = 0,
  WITHDRAW = 1
}

type TabData = {
  index: TabIndex
  label: string
}

type UpdateAddress = {
  walletType: WalletType
  chain: Chain
  network: Network /* network is needed to re-trigger stream in case of network changes */
}

const eqUpdateAddress = Eq.struct<UpdateAddress>({
  walletType: eqWalletType,
  chain: eqChain,
  network: eqNetwork
})

type Props = { asset: Asset; walletType: WalletType }

const Content: React.FC<Props> = (props): JSX.Element => {
  const { asset, walletType } = props
  const intl = useIntl()

  const navigate = useNavigate()

  const { network } = useNetwork()

  const { reloadSaverProvider } = useThorchainContext()
  const { assetWithDecimal$, addressByChain$ } = useChainContext()
  const { reloadBalancesByChain, getLedgerAddress$ } = useWalletContext()

  const assetDecimal$: AssetWithDecimalLD = useMemo(
    () => assetWithDecimal$(asset, network),
    [assetWithDecimal$, network, asset]
  )

  const assetRD: AssetWithDecimalRD = useObservableState(assetDecimal$, RD.initial)

  const [addressRD, updateAddress$] = useObservableState<RD.RemoteData<Error, Address>, UpdateAddress>(
    (updated$) =>
      FP.pipe(
        updated$,
        RxOp.debounceTime(300),
        RxOp.distinctUntilChanged(eqUpdateAddress.equals),
        RxOp.switchMap(({ walletType, chain }) =>
          isLedgerWallet(walletType)
            ? FP.pipe(getLedgerAddress$(chain), RxOp.map(O.map(ledgerAddressToWalletAddress)))
            : addressByChain$(chain)
        ),
        RxOp.map(addressFromOptionalWalletAddress),
        RxOp.map((oAddress) => RD.fromOption(oAddress, () => new Error(`Could not get address for ${walletType}`)))
      ),
    RD.initial
  )

  useEffect(() => {
    updateAddress$({ chain: asset.chain, network, walletType })
  }, [network, asset.chain, walletType, updateAddress$])

  const {
    service: {
      pools: { poolsState$, reloadPools }
    }
  } = useMidgardContext()

  const pricePool = usePricePool()

  const poolsStateRD = useObservableState(poolsState$, RD.initial)

  // TODO(@veado) Get fees
  const feesRD: BaseAmountRD = RD.success(baseAmount(123000))

  const reloadHandler = useCallback(() => {
    reloadBalancesByChain(asset.chain)
    reloadSaverProvider()
  }, [asset.chain, reloadBalancesByChain, reloadSaverProvider])

  const renderError = useCallback(
    (e: Error) => (
      <ErrorView
        className="flex h-full w-full justify-center"
        title={intl.formatMessage({ id: 'common.error' })}
        subTitle={e?.message ?? e.toString()}
        extra={
          <FlatButton size="normal" onClick={reloadPools}>
            {intl.formatMessage({ id: 'common.retry' })}
          </FlatButton>
        }
      />
    ),
    [intl, reloadPools]
  )

  const matchAddRoute = useMatch({
    path: saversRoutes.earn.path({ asset: assetToString(asset), walletType }),
    end: false
  })
  const matchWithdrawRoute = useMatch({
    path: saversRoutes.withdraw.path({ asset: assetToString(asset), walletType }),
    end: false
  })

  const selectedIndex: number = useMemo(() => {
    if (matchAddRoute) {
      return TabIndex.ADD
    } else if (matchWithdrawRoute) {
      return TabIndex.WITHDRAW
    } else {
      return TabIndex.ADD
    }
  }, [matchAddRoute, matchWithdrawRoute])

  const tabs = useMemo(
    (): TabData[] => [
      {
        index: TabIndex.ADD,
        label: intl.formatMessage({ id: 'common.earn' })
      },
      {
        index: TabIndex.WITHDRAW,
        label: intl.formatMessage({ id: 'common.withdraw' })
      }
    ],
    [intl]
  )

  const renderLoading = useMemo(
    () => (
      <div className="flex min-h-full items-center justify-center">
        <Spin size="large" />
      </div>
    ),
    []
  )

  return (
    <>
      <div className=" relative mb-20px flex items-center justify-between">
        <BackLinkButton className="absolute !m-0" path={poolsRoutes.savers.path()} />
        <h2 className="m-0 w-full text-center font-mainSemiBold text-16 uppercase text-turquoise">
          {intl.formatMessage({ id: 'common.earn' })}
        </h2>
        <RefreshButton className="absolute right-0" onClick={reloadHandler} />
      </div>

      <div className="flex h-screen flex-col items-center justify-center ">
        {FP.pipe(
          sequenceTRD(poolsStateRD, assetRD, addressRD),
          RD.fold(
            () => renderLoading,
            () => renderLoading,
            renderError,
            ([{ poolDetails }, assetWD, address]) => {
              const getTabContentByIndex = (index: number) => {
                switch (index) {
                  case TabIndex.ADD:
                    return (
                      <AddSavers
                        network={network}
                        asset={assetWD}
                        pricePool={pricePool}
                        fees={feesRD}
                        address={address}
                      />
                    )
                  case TabIndex.WITHDRAW:
                    return (
                      <WithdrawSavers
                        network={network}
                        asset={assetWD}
                        pricePool={pricePool}
                        fees={feesRD}
                        address={address}
                      />
                    )
                  default:
                    return <>`Unknown tab content (index ${index})`</>
                }
              }
              return (
                <div className="flex min-h-full w-full">
                  <div className="flex min-h-full w-full flex-col xl:flex-row">
                    <div className="min-h-auto flex w-full flex-col bg-bg0 dark:bg-bg0d xl:min-h-full xl:w-2/3">
                      <Tab.Group
                        selectedIndex={selectedIndex}
                        onChange={(index) => {
                          switch (index) {
                            case TabIndex.ADD:
                              navigate(saversRoutes.earn.path({ asset: assetToString(asset), walletType }))
                              break
                            case TabIndex.WITHDRAW:
                              navigate(saversRoutes.withdraw.path({ asset: assetToString(asset), walletType }))
                              break
                            default:
                            // nothing to do
                          }
                        }}>
                        <Tab.List className="mb-10px flex w-full justify-center border-b border-gray1 dark:border-gray1d">
                          {FP.pipe(
                            tabs,
                            A.map(({ index, label }) => (
                              <Tab key={index} as={Fragment}>
                                {({ selected }) => (
                                  <div
                                    className="
                                      group
                                      flex
                                      cursor-pointer
                                      items-center
                                      justify-center
                                      last:ml-20px
                                      focus-visible:outline-none
                                      ">
                                    <span
                                      className={`
                                        border-y-[2px] border-solid border-transparent
                                        group-hover:border-b-turquoise
                                        ${selected ? 'border-b-turquoise' : 'border-b-transparent'}
                                        ease px-20px
                                        py-[16px]
                                        font-mainSemiBold text-[16px]
                                        uppercase

                                        ${selected ? 'text-turquoise' : 'text-text2 dark:text-text2d'}
                                      hover:text-turquoise`}>
                                      {label}
                                    </span>
                                  </div>
                                )}
                              </Tab>
                            ))
                          )}
                        </Tab.List>
                        <Tab.Panels className="mt-2 flex w-full justify-center">
                          {FP.pipe(
                            tabs,
                            A.map(({ index }) => (
                              <Tab.Panel key={`content-${index}`}>{getTabContentByIndex(index)}</Tab.Panel>
                            ))
                          )}
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                    <div className="min-h-auto mt-20px ml-0 flex w-full bg-bg0 dark:bg-bg0d xl:mt-0 xl:ml-20px xl:min-h-full xl:w-1/3">
                      <SaversDetailsView asset={asset} address={address} poolDetails={poolDetails} />
                    </div>
                  </div>
                </div>
              )
            }
          )
        )}
      </div>
    </>
  )
}

export const SaversView: React.FC = (): JSX.Element => {
  const { asset, walletType } = useParams<SaversRouteParams>()

  const oWalletType = useMemo(() => FP.pipe(walletType, O.fromPredicate(isWalletType)), [walletType])
  const oAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(asset), [asset])

  const intl = useIntl()

  return FP.pipe(
    sequenceTOption(oAsset, oWalletType),
    O.fold(
      () => (
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `asset: ${asset}, walletType: ${walletType}`
            }
          )}
        />
      ),
      ([asset, walletType]) => <Content asset={asset} walletType={walletType} />
    )
  )
}
