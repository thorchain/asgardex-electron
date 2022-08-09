import React from 'react'

import { FileOutlined, FileProtectOutlined } from '@ant-design/icons'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import './NoWalletView.css'
import { Label } from '../../../components/uielements/label'
import * as walletRoutes from '../../../routes/wallet'

export const NoWalletView = () => {
  const navigate = useNavigate()
  const intl = useIntl()

  return (
    <div className="flex h-full w-full flex-col bg-bg1 dark:bg-bg1d md:h-full md:flex-row ">
      <div
        className="
        group
        flex
        h-1/2 w-full cursor-pointer flex-col items-center justify-center
        transition duration-500
         ease-in-out hover:bg-turquoise
         md:h-full md:w-1/2
         "
        onClick={() => navigate(walletRoutes.create.phrase.path())}>
        <FileOutlined
          className="nowalletview-createicon mb-[30px] transition duration-500 ease-in-out
  group-hover:scale-110 group-hover:drop-shadow-lg md:mb-[70px]"
        />
        <p
          className="text-16px mb-20px w-[180px] rounded-full
          border-2
            border-turquoise
            bg-white
            px-20px
            py-5px
            text-center
            font-main
            uppercase
            text-turquoise
            filter-none
            transition
            duration-500
            ease-in-out
            group-hover:scale-110
            group-hover:border-white
            group-hover:bg-turquoise
            group-hover:text-white
              group-hover:drop-shadow-lg dark:border-white
               dark:text-text0
             md:mb-30px
            ">
          {intl.formatMessage({ id: 'wallet.action.create' })}
        </p>
        <Label
          className="
          translate-y-0
          transition
          duration-500 ease-in-out group-hover:translate-y-[-2px] group-hover:text-white
          "
          align="center"
          color="gray"
          size="big"
          textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.create' })}
        </Label>
      </div>

      <div
        className="group
        flex h-1/2 w-full cursor-pointer flex-col items-center justify-center
        transition duration-500 ease-in-out
         hover:bg-turquoise
         md:h-full md:w-1/2"
        onClick={() => navigate(walletRoutes.imports.base.path())}>
        <FileProtectOutlined
          className="nowalletview-addicon mb-[30px] transition duration-500 ease-in-out
  group-hover:scale-110 group-hover:drop-shadow-lg md:mb-[70px]"
        />
        <p
          className="text-16px mb-20px w-[180px] rounded-full
          bg-turquoise
        px-20px
         py-5px text-center
         font-main
         uppercase
        text-white
         filter-none
        transition
        duration-500 ease-in-out
        group-hover:scale-110
         group-hover:bg-white group-hover:text-turquoise group-hover:drop-shadow-lg
         md:mb-30px">
          {intl.formatMessage({ id: 'wallet.action.import' })}
        </p>
        <Label
          className="
          translate-y-0
          transition
          duration-500 ease-in-out group-hover:translate-y-[-2px] group-hover:text-white"
          align="center"
          color="gray"
          size="big"
          textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.import' })}
        </Label>
      </div>
    </div>
  )
}
