import React from 'react'

import { Listbox } from '@headlessui/react'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { KeystoreId } from '../../../../shared/api/types'
import { KeystoreWalletsUI } from '../../../services/wallet/types'
import { DownIcon } from '../../icons'

export type Props = {
  wallets: KeystoreWalletsUI
  onChange: (id: KeystoreId) => void
  className?: string
  disabled?: boolean
}

export const WalletSelector: React.FC<Props> = (props): JSX.Element => {
  const { wallets, onChange, disabled = false, className = '' } = props

  const oSelectedWallet = FP.pipe(
    wallets,
    // get selected wallet
    A.findFirst(({ selected }) => selected),
    // use first if no wallet is selected
    O.alt(() => A.head(wallets))
  )

  return FP.pipe(
    oSelectedWallet,
    O.fold(
      () => <>No wallets</>,
      (selectedWallet) => (
        <Listbox
          value={selectedWallet}
          disabled={disabled}
          onChange={({ id }) => {
            console.log('on change listbox', id)
            onChange(id)
          }}>
          <div className={`relative ${className}`}>
            <Listbox.Button
              as="div"
              className={`flex

              cursor-pointer
                    items-center
                    bg-bg0
                    py-10px
                   pl-20px pr-10px
                   font-main
                    text-14
                    uppercase
                    text-text0
                    transition duration-300
                    ease-in-out
                    ${disabled && 'opacity-70'}
                    dark:bg-bg0d
                    dark:text-text0d
                    `}>
              {({ open }) => (
                <>
                  <span className="w-full">{selectedWallet.name}</span>
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
            z-[2000] mt-1 max-h-60
            w-full
            overflow-auto
             bg-bg0
            focus:outline-none
            dark:bg-bg0d
            ">
              {FP.pipe(
                wallets,
                A.map((wallet) => (
                  <Listbox.Option
                    disabled={wallet.id === selectedWallet.id}
                    className={({ selected }) =>
                      `w-full select-none py-10px
                      px-20px
                      ${selected && 'text-gray2 dark:text-gray2d'}
                      ${selected ? 'cursor-disabled' : 'cursor-pointer'}
                      font-main text-14 uppercase  text-text0
                      hover:bg-gray0 hover:text-gray2
                      dark:text-text0d hover:dark:bg-gray0d
                      hover:dark:text-gray2d
                      `
                    }
                    key={wallet.id}
                    value={wallet}>
                    {wallet.name}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </div>
        </Listbox>
      )
    )
  )
}
