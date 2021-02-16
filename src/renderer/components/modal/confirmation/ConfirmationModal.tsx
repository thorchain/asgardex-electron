import React, { useCallback } from 'react'

import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import * as Styled from './ConfirmationModal.styles'

type Props = {
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  message: React.ReactNode
  className?: string
}

export const ConfirmationModal: React.FC<Props> = ({ onSuccess: onSuccessProp, onClose, message, className }) => {
  const intl = useIntl()
  const onSuccess = useCallback(() => {
    onSuccessProp()
    onClose()
  }, [onSuccessProp, onClose])
  return (
    <Styled.Modal
      className={className}
      title={intl.formatMessage({ id: 'common.modal.confirmTitle' })}
      visible={true}
      onOk={onSuccess}
      onCancel={onClose}
      maskClosable={false}
      closable={false}
      okText={intl.formatMessage({ id: 'common.confirm' })}
      okButtonProps={{ autoFocus: true }}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      {message}
    </Styled.Modal>
  )
}
