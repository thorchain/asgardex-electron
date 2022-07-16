import React, { useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { Button, ButtonProps, ButtonSize } from '../uielements/button'

export type Props = ButtonProps & {
  className?: string
  asset: Asset
  sizevalue?: ButtonSize
  isTextView: boolean
  disabled?: boolean
}
export const ManageButton: React.FC<Props> = ({
  disabled,
  className,
  asset,
  sizevalue = 'normal',
  isTextView,
  ...otherProps
}) => {
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
    <Button
      disabled={disabled}
      round="true"
      typevalue="outline"
      sizevalue={sizevalue}
      className={className}
      onClick={onClick}
      style={{ height: 30 }}
      {...otherProps}>
      <PlusOutlined />
      {isTextView && intl.formatMessage({ id: 'common.manage' })}
    </Button>
  )
}
