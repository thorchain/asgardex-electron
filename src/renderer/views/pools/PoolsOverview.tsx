import React, { Fragment, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Tab } from '@headlessui/react'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { useKeystoreState } from '../../hooks/useKeystoreState'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { PoolType } from '../../services/midgard/types'
import { SaversOverview } from '../savers/SaversOverview'
import { ActivePools } from './ActivePools'
import { PendingPools } from './PendingPools'

type TabKey = PoolType | 'savers'
type TabContent = {
  key: TabKey
  label: string
  content: JSX.Element
}

export const PoolsOverview: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { locked: walletLocked } = useKeystoreState()

  const {
    service: {
      pools: { haltedChains$ }
    }
  } = useMidgardContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])

  const { mimirHalt } = useMimirHalt()

  const tabs = useMemo(
    (): TabContent[] => [
      {
        key: 'active',
        label: intl.formatMessage({ id: 'pools.available' }),
        content: <ActivePools haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={walletLocked} />
      },
      {
        key: 'pending',
        label: intl.formatMessage({ id: 'pools.pending' }),
        content: <PendingPools haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={walletLocked} />
      },
      {
        key: 'savers',
        label: intl.formatMessage({ id: 'common.savers' }),
        content: <SaversOverview haltedChains={haltedChains} mimirHalt={mimirHalt} walletLocked={walletLocked} />
      }
    ],
    [intl, haltedChains, mimirHalt, walletLocked]
  )

  return (
    <Tab.Group>
      <Tab.List className="mb-10px flex w-full flex-col md:flex-row">
        {FP.pipe(
          tabs,
          A.map(({ key, label }) => (
            <Tab key={key} as={Fragment}>
              {({ selected }) => (
                // label wrapper
                <div
                  className={`
              group
              flex cursor-pointer
              items-center
              justify-center`}>
                  {/* label */}
                  <span
                    className={`
                  border-y-[2px] border-solid border-transparent
              focus-visible:outline-none
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
          A.map(({ content, key }) => <Tab.Panel key={`content-${key}`}>{content}</Tab.Panel>)
        )}
      </Tab.Panels>
    </Tab.Group>
  )
}
