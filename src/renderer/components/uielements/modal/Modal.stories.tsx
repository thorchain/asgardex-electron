import React from 'react'

import { storiesOf } from '@storybook/react'

import Modal from './Modal'

storiesOf('Components/Modal', module).add('default', () => {
  return (
    <Modal title="Sample Modal" visible>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Modal>
  )
})
