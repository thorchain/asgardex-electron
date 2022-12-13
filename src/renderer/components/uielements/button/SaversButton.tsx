import React, { useCallback } from 'react'

import { BanknotesIcon } from '@heroicons/react/24/outline'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import * as saversRoutes from '../../../routes/pools/savers'
import { FlatButton } from './FlatButton'
import type { Props as ButtonProps } from './FlatButton'

export type Props = Omit<ButtonProps, 'onClick'> & {
  asset: Asset
  isTextView: boolean
}
export const SaversButton: React.FC<Props> = ({ asset, isTextView, ...otherProps }) => {
  const intl = useIntl()
  const navigate = useNavigate()

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      event.stopPropagation()
      navigate(saversRoutes.earn.path({ asset: assetToString(asset) }))
    },
    [asset, navigate]
  )

  return (
    <FlatButton onClick={onClick} {...otherProps}>
      <BanknotesIcon className={`h-[16px] w-[16px] text-inherit lg:h-20px lg:w-20px ${isTextView ? `mr-[8px]` : ''}`} />
      <span className={`${isTextView ? 'mr-10px' : 'hidden'}`}>{intl.formatMessage({ id: 'common.savers' })}</span>
    </FlatButton>
  )
}
