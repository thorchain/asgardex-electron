import React, { Fragment, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Tab } from '@headlessui/react'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useMatch, useNavigate } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { Chain } from '../../../shared/utils/chain'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useKeystoreState } from '../../hooks/useKeystoreState'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import * as poolsRoutes from '../../routes/pools'
import { PoolType } from '../../services/midgard/types'
import { SaversOverview } from '../savers/SaversOverview'
import { ActivePools } from './ActivePools'
import { PendingPools } from './PendingPools'

type TabType = PoolType | 'savers'

const TAB_INDEX: Record<TabType, number> = {
  active: 0,
  pending: 1,
  savers: 2
}

type TabContent = {
  index: number
  label: string
  content: JSX.Element
}

export const PoolsOverview: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const navigate = useNavigate()

  const { locked: walletLocked } = useKeystoreState()

  const {
    service: {
      pools: { haltedChains$ }
    }
  } = useMidgardContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])

  const { mimirHalt } = useMimirHalt()

  const matchPoolsPendingRoute = useMatch({ path: poolsRoutes.pending.path(), end: false })
  const matchPoolsSaversRoute = useMatch({ path: poolsRoutes.savers.path(), end: false })

  const selectedIndex: number = useMemo(() => {
    if (matchPoolsSaversRoute) {
      return TAB_INDEX['savers']
    } else if (matchPoolsPendingRoute) {
      return TAB_INDEX['pending']
    } else {
      return TAB_INDEX['active']
    }
  }, [matchPoolsPendingRoute, matchPoolsSaversRoute])

  const tabs = useMemo(
    (): TabContent[] => [
      {
        index: TAB_INDEX['active'],
        label: intl.formatMessage({ id: 'pools.available' }),
        content: <ActivePools />
      },
      {
        index: TAB_INDEX['pending'],
        label: intl.formatMessage({ id: 'pools.pending' }),
        content: <PendingPools />
      },
      {
        index: TAB_INDEX['savers'],
        label: intl.formatMessage({ id: 'common.savers' }),
        content: <SaversOverview haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={walletLocked} />
      }
    ],
    [intl, haltedChains, mimirHalt, walletLocked]
  )

  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      onChange={(index) => {
        switch (index) {
          case TAB_INDEX['active']:
            navigate(poolsRoutes.active.path())
            break
          case TAB_INDEX['pending']:
            navigate(poolsRoutes.pending.path())
            break
          case TAB_INDEX['savers']:
            navigate(poolsRoutes.savers.path())
            break
          default:
          // nothing to do
        }
      }}>
      <Tab.List className="mb-10px flex w-full flex-col md:flex-row">
        {FP.pipe(
          tabs,
          A.map(({ index, label }) => (
            <Tab key={index} as={Fragment}>
              {({ selected }) => (
                // label wrapper
                <div
                  className={`
                  group
                  flex cursor-pointer
                  items-center
                  justify-center focus-visible:outline-none`}>
                  {/* label */}
                  <span
                    className={`
                    border-y-[2px] border-solid border-transparent
                    group-hover:border-b-turquoise
                    ${selected ? 'border-b-turquoise' : 'border-b-transparent'}
                    ease mr-0 px-5px
                    font-mainSemiBold text-[16px]
                    uppercase md:mr-10px
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
          A.map(({ content, index }) => <Tab.Panel key={`content-${index}`}>{content}</Tab.Panel>)
        )}
      </Tab.Panels>
    </Tab.Group>
  )
}
