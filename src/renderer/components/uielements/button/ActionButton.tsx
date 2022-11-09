import React, { useCallback } from 'react'

import { Popover } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import * as poolsRoutes from '../../../routes/pools'
import * as walletRoutes from '../../../routes/wallet'
import type { Props as ButtonProps } from './FlatButton'
import { TextButton, FlatButton } from './index'

export type Action =
  | { type: 'swap'; data: { target: Asset; source: Asset } }
  | { type: 'manage'; data: { asset: Asset } }
  | { type: 'savers'; data: { asset: Asset } }
  | { type: 'send'; data: { asset: Asset } }
  | { type: 'deposit'; data: { asset: Asset } }
  | { type: 'upgrade'; data: { asset: Asset } }

export type Props = Omit<ButtonProps, 'onClick'> & {
  actions: Action[]
  isTextView?: boolean
}

export const Actionbutton: React.FC<Props> = (props): JSX.Element => {
  const { size, actions, isTextView = true } = props

  const intl = useIntl()
  const navigate = useNavigate()

  const getPath = useCallback((action: Action): string => {
    const { type, data } = action
    switch (type) {
      case 'swap':
        return poolsRoutes.swap.path({ source: assetToString(data.source), target: assetToString(data.target) })
      case 'manage':
        return poolsRoutes.deposit.path({ asset: assetToString(data.asset) })
      case 'savers':
        return poolsRoutes.savers.path({ asset: assetToString(data.asset) })
      case 'send':
        // TODO(@veado) Update send path to accept an asset
        return walletRoutes.send.path()
      case 'upgrade':
        // TODO(@veado) Update upgrade path to accept an asset
        return walletRoutes.upgradeRune.path()
      case 'deposit':
        // TODO(@veado) Update interact path to accept an asset
        return walletRoutes.interact.path({ interactType: 'bond' })
    }
  }, [])

  return (
    <Popover className="relative">
      <Popover.Button as="div" className="group">
        {({ open }) => (
          <FlatButton size={size}>
            <span className={`${isTextView ? 'mr-10px' : 'hidden'}`}>
              {intl.formatMessage({ id: 'common.action' })}
            </span>
            <ChevronDownIcon className={`ease h-[20px] w-[20px] text-inherit ${open ? 'rotate-180' : 'rotate-0'}`} />
          </FlatButton>
        )}
      </Popover.Button>
      <Popover.Panel className="absolute left-[50%] z-[2000] min-w-[100%] translate-x-[-50%] bg-bg0 shadow-full dark:bg-bg0d dark:shadow-fulld ">
        {({ close }) => (
          <div>
            {FP.pipe(
              actions,
              A.map((action) => (
                <TextButton
                  size={size}
                  color="neutral"
                  className={`w-full hover:bg-bg2 dark:hover:bg-bg2d `}
                  key={action.type}
                  onClick={() => {
                    console.log('action:', action)
                    close()
                    navigate(getPath(action))
                  }}>
                  {/* TODO(@veado) i18n */}
                  {action.type}
                </TextButton>
              ))
            )}
          </div>
        )}
      </Popover.Panel>
    </Popover>
  )
}
