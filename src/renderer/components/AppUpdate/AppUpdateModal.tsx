import React from 'react'

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
  return props.isOpen ? (
    <Modal
      title={'New Version is available'}
      visible={props.isOpen}
      okText={'Download'}
      onOk={props.goToUpdates}
      onCancel={props.close}>
      There is a new version {props.version} available. Here is a link or download it right here
    </Modal>
  ) : (
    <Modal visible={props.isOpen} />
  )
}
