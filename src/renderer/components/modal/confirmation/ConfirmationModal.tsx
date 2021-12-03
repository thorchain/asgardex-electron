import React, { useCallback } from 'react'

import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import * as Styled from './ConfirmationModal.styles'

type Props = {
  visible: boolean
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  title?: string
  okText?: string
  content: React.ReactNode
  className?: string
}

export const ConfirmationModal: React.FC<Props> = ({
  visible,
  onSuccess,
  onClose,
  title,
  okText,
  content,
  className
}) => {
  const intl = useIntl()
  const onOkHandler = useCallback(() => {
    onSuccess()
    onClose()
  }, [onSuccess, onClose])
  return (
    <Styled.Modal
      className={className}
      title={title || intl.formatMessage({ id: 'common.modal.confirmTitle' })}
      visible={visible}
      onOk={onOkHandler}
      onCancel={onClose}
      maskClosable={false}
      closable={false}
      okText={okText || intl.formatMessage({ id: 'common.confirm' })}
      okButtonProps={{ autoFocus: true }}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      {content}
    </Styled.Modal>
  )
}
