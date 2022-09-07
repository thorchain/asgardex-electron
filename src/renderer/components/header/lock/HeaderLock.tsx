import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Listbox } from '@headlessui/react'
import { PlusCircleIcon } from '@heroicons/react/outline'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { KeystoreId } from '../../../../shared/api/types'
import { truncateMiddle } from '../../../helpers/stringHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import * as walletRoutes from '../../../routes/wallet'
import {
  ChangeKeystoreWalletHandler,
  ChangeKeystoreWalletRD,
  KeystoreState,
  KeystoreWalletsUI
} from '../../../services/wallet/types'
import * as WU from '../../../services/wallet/util'
import { DownIcon, LockIcon, UnlockIcon } from '../../icons'
import { BaseButton } from '../../uielements/button'
import { Tooltip } from '../../uielements/common/Common.styles'

type WalletData = { id: KeystoreId; name: string }

export type Props = {
  wallets: KeystoreWalletsUI
  changeWalletHandler$: ChangeKeystoreWalletHandler
  keystoreState: KeystoreState
  lockHandler: FP.Lazy<void>
}

export const HeaderLock: React.FC<Props> = (props): JSX.Element => {
  const { keystoreState, wallets, changeWalletHandler$, lockHandler: onPress } = props

  const intl = useIntl()
  const navigate = useNavigate()

  const isLocked = useMemo(() => WU.isLocked(keystoreState), [keystoreState])

  const hasWallets = wallets.length

  // Data for Listbox
  const walletData = FP.pipe(
    wallets,
    A.map(({ id, name }) => ({ id, name }))
  )

  // Selected wallet for Listbox
  const oSelectedWallet: O.Option<WalletData> = useMemo(
    () =>
      FP.pipe(
        keystoreState,
        WU.getKeystoreId,
        O.chain((selectedId) =>
          FP.pipe(
            walletData,
            A.findFirst(({ id }) => id === selectedId)
          )
        )
      ),
    [keystoreState, walletData]
  )

  const { subscribe: subscribeChangeWalletState } = useSubscriptionState<ChangeKeystoreWalletRD>(RD.initial)

  const changeWalletHandler = useCallback(
    ({ id }: WalletData) => {
      // subscription is needed to run `changeWalletHandler$`
      subscribeChangeWalletState(changeWalletHandler$(id))
    },
    [changeWalletHandler$, subscribeChangeWalletState]
  )

  const renderWallets = useMemo(
    () =>
      FP.pipe(
        oSelectedWallet,
        O.fold(
          () => <>no selected wallet</>,
          (selectedWallet) => (
            <div className="flex h-[25px] items-center rounded-full bg-gray0 dark:bg-gray0d">
              <div
                className="rounded-full border-4 border-gray0 bg-gray0 dark:border-gray0d dark:bg-gray0d"
                onClick={() => onPress()}>
                {isLocked ? <LockIcon className="h-[28px] w-[28px]" /> : <UnlockIcon className="h-[28px] w-[28px]" />}
              </div>
              <Listbox value={selectedWallet} onChange={changeWalletHandler}>
                <div className="relative">
                  <Listbox.Button
                    as="div"
                    className={`
                  flex
                  cursor-pointer
                  items-center
                  pl-5px pr-10px
                  font-main
                  text-14
                   text-text1
                  transition duration-300
                  ease-in-out
                  dark:text-text1d
                  `}>
                    {({ open }) => (
                      <>
                        <span className="w-full">
                          {truncateMiddle(selectedWallet.name, { start: 3, end: 3, max: 6 })}
                        </span>
                        <DownIcon
                          className={`
                          ${open && 'rotate-180'}
                          transition
                          duration-500
                          `}
                        />
                      </>
                    )}
                  </Listbox.Button>
                  <Listbox.Options
                    className="
                    absolute
                    top-[35px]
                    left-[-100px]
                    z-[2000] mt-1 max-h-60
                    w-[200px]
                    overflow-auto
                    bg-bg0
                    drop-shadow-lg
                    focus:outline-none
                    dark:bg-bg0d
                    ">
                    {FP.pipe(
                      walletData,
                      A.map((wallet) => (
                        <Listbox.Option
                          disabled={wallet.id === selectedWallet.id}
                          className={({ selected }) => `select-none
                    px-20px py-10px
                    ${selected && 'text-gray2 dark:text-gray2d'}
                    ${selected ? 'cursor-disabled' : 'cursor-pointer'}
                    font-main text-14
                    text-text1
                    ${!selected && 'hover:bg-gray0 hover:text-gray2'}
                    dark:text-text1d
                    ${!selected && 'hover:dark:bg-gray0d hover:dark:text-gray2d'}
                    `}
                          key={wallet.id}
                          value={wallet}>
                          {truncateMiddle(wallet.name, { start: 9, end: 9, max: 20 })}
                        </Listbox.Option>
                      ))
                    )}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          )
        )
      ),

    [changeWalletHandler, isLocked, oSelectedWallet, onPress, walletData]
  )

  const renderAddWallet = useMemo(
    () => (
      <Tooltip title={intl.formatMessage({ id: 'wallet.add.label' })}>
        <BaseButton className="!p-0 text-warning0" onClick={() => navigate(walletRoutes.noWallet.path())}>
          <PlusCircleIcon className="ml-5px h-[28px] w-[28px]" />
        </BaseButton>
      </Tooltip>
    ),
    [intl, navigate]
  )

  return <div className="flex justify-center">{hasWallets ? renderWallets : renderAddWallet}</div>
}
