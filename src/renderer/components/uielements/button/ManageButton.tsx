import React, { useCallback } from 'react'

import { PlusIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { DEFAULT_WALLET_TYPE } from '../../../const'
import * as poolsRoutes from '../../../routes/pools'
import { BorderButton } from './'
import type { Props as BorderButtonProps } from './BorderButton'

export type Props = BorderButtonProps & {
  className?: string
  asset: Asset
  isTextView: boolean
}
export const ManageButton: React.FC<Props> = ({ asset, isTextView, ...otherProps }) => {
  const intl = useIntl()
  const navigate = useNavigate()

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      event.stopPropagation()
      navigate(
        poolsRoutes.deposit.path({
          asset: assetToString(asset),
          assetWalletType: DEFAULT_WALLET_TYPE,
          runeWalletType: DEFAULT_WALLET_TYPE
        })
      )
    },
    [asset, navigate]
  )

  return (
    <BorderButton onClick={onClick} {...otherProps}>
      <PlusIcon className={`h-[16px] w-[16px] text-inherit lg:h-20px lg:w-20px ${isTextView ? `mr-[8px]` : ''}`} />
      <span className={`${isTextView ? 'mr-10px' : 'hidden'}`}>{intl.formatMessage({ id: 'common.manage' })}</span>
    </BorderButton>
  )
}
