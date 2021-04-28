import React from 'react'

import { useIntl } from 'react-intl'

import { Modal } from '../uielements/modal'

export type AppUpdateModalProps =
  | {
      isOpen: true
      goToUpdates: () => void
      version: string
      close: () => void
    }
  | {
      isOpen: false
    }

export const AppUpdateModal: React.FC<AppUpdateModalProps> = (props) => {
  const intl = useIntl()
  return props.isOpen ? (
    <Modal
      title={intl.formatMessage({ id: 'app.update.available' })}
      visible={props.isOpen}
      okText={intl.formatMessage({ id: 'common.go' })}
      onOk={props.goToUpdates}
      onCancel={props.close}>
      {intl.formatMessage({ id: 'update.description' }, { version: props.version })}
    </Modal>
  ) : (
    <Modal visible={props.isOpen} />
  )
}
