import React, { useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { BorderButton } from '../uielements/button'
import type { Props as BorderButtonProps } from '../uielements/button/BorderButton'

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
      navigate(poolsRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [asset, navigate]
  )

  return (
    <BorderButton onClick={onClick} {...otherProps}>
      <PlusOutlined className={isTextView ? `mr-[8px]` : ''} />
      {isTextView && intl.formatMessage({ id: 'common.manage' })}
    </BorderButton>
  )
}
