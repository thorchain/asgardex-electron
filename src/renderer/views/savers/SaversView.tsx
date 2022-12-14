import { Fragment, useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Tab } from '@headlessui/react'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useMatch, useNavigate, useParams } from 'react-router-dom'

import { AddSavers } from '../../components/savers/AddSavers'
import { WithdrawSavers } from '../../components/savers/WithdrawSavers'
import { ErrorView } from '../../components/shared/error'
import { Spin } from '../../components/shared/loading'
import { BackLinkButton, FlatButton, RefreshButton } from '../../components/uielements/button'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getAssetFromNullableString } from '../../helpers/assetHelper'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { useNetwork } from '../../hooks/useNetwork'
import * as poolsRoutes from '../../routes/pools'
import { SaversRouteParams } from '../../routes/pools/savers'
import * as saversRoutes from '../../routes/pools/savers'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'

type TabType = 'add' | 'withdraw'

type TabData = {
  index: number
  key: TabType
  label: string
}

/* <div className="flex w-full justify-center border-b border-gray1 dark:border-gray1d">
<div className="border-b-[2px] border-turquoise py-10px px-10px font-mainSemiBold text-[16px] uppercase text-turquoise ">
  {intl.formatMessage({ id: 'common.swap' })}
</div>
</div> */

type Props = { asset: Asset }

const Content: React.FC<Props> = ({ asset }): JSX.Element => {
  const intl = useIntl()

  const navigate = useNavigate()

  const { network } = useNetwork()

  const reloadHandler = useCallback(() => {}, [])

  const { assetWithDecimal$ } = useChainContext()

  const assetDecimal$: AssetWithDecimalLD = useMemo(
    () => assetWithDecimal$(asset, network),
    [assetWithDecimal$, network, asset]
  )

  const assetRD: AssetWithDecimalRD = useObservableState(assetDecimal$, RD.initial)

  const {
    service: {
      pools: { poolsState$, reloadPools }
    }
  } = useMidgardContext()

  const poolsState = useObservableState(poolsState$, RD.initial)

  const renderError = useCallback(
    (e: Error) => (
      <ErrorView
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

  const matchAddRoute = useMatch({ path: saversRoutes.earn.path({ asset: assetToString(asset) }), end: false })
  const matchWithdrawRoute = useMatch({ path: saversRoutes.withdraw.path({ asset: assetToString(asset) }), end: false })

  const selectedIndex: number = useMemo(() => {
    if (matchAddRoute) {
      return 0
    } else if (matchWithdrawRoute) {
      return 1
    } else {
      return 0
    }
  }, [matchAddRoute, matchWithdrawRoute])

  const tabs = useMemo(
    (): TabData[] => [
      {
        index: 0,
        key: 'add',
        label: intl.formatMessage({ id: 'common.add' })
      },
      {
        index: 1,
        key: 'withdraw',
        label: intl.formatMessage({ id: 'common.withdraw' })
      }
    ],
    [intl]
  )

  return (
    <>
      <div className=" relative mb-20px flex items-center justify-between">
        <BackLinkButton className="absolute !m-0" path={poolsRoutes.savers.path()} />
        <h2 className="m-0 w-full text-center font-mainSemiBold text-16 uppercase text-turquoise">
          {intl.formatMessage({ id: 'common.earn' })}
        </h2>
        <RefreshButton className="absolute right-0" clickHandler={reloadHandler} />
      </div>

      <div className="flex h-screen flex-col items-center justify-center ">
        {FP.pipe(
          sequenceTRD(poolsState, assetRD),
          RD.fold(
            () => <></>,
            () => (
              <div className="flex min-h-full items-center justify-center">
                <Spin size="large" />
              </div>
            ),
            renderError,
            ([_, assetWD]) => {
              const getTabContentByIndex = (index: number) => {
                switch (index) {
                  case 0:
                    return <AddSavers network={network} asset={assetWD} />
                  case 1:
                    return <WithdrawSavers network={network} asset={assetWD} />
                  default:
                    return null
                }
              }
              return (
                <div className="flex min-h-full w-full">
                  <div className="flex min-h-full w-full flex-col md:flex-row">
                    <div className="min-h-auto flex w-full flex-col bg-bg0 dark:bg-bg0d md:min-h-full md:w-2/3">
                      <Tab.Group
                        selectedIndex={selectedIndex}
                        onChange={(index) => {
                          switch (index) {
                            case 0:
                              navigate(saversRoutes.earn.path({ asset: assetToString(asset) }))
                              break
                            case 1:
                              navigate(saversRoutes.withdraw.path({ asset: assetToString(asset) }))
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
                        <Tab.Panels className="mt-2 w-full">
                          {FP.pipe(
                            tabs,
                            A.map(({ index }) => (
                              <Tab.Panel key={`content-${index}`}>{getTabContentByIndex(index)}</Tab.Panel>
                            ))
                          )}
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                    <div className="min-h-auto ml-0 flex w-full bg-bg0 dark:bg-bg0d md:ml-20px md:min-h-full md:w-1/3">
                      Earnings
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
  const { asset } = useParams<SaversRouteParams>()
  const oAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(asset), [asset])

  const intl = useIntl()

  return FP.pipe(
    oAsset,
    O.fold(
      () => (
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `asset: ${asset}`
            }
          )}
        />
      ),
      (asset) => <Content asset={asset} />
    )
  )
}
