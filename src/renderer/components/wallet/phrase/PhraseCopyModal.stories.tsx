import React from 'react'

import { storiesOf } from '@storybook/react'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { PhraseCopyModal } from './PhraseCopyModal'

const onClose = () => console.log('onClose')
const sample_phrase = 'rural bright ball negative already grass good grant nation screen model pizza'

storiesOf('Phrase/Copy', module).add('default', () => {
  return (
    <PhraseCopyModal
      validatePassword$={mockValidatePassword$}
      phrase={sample_phrase}
      visible={true}
      onClose={onClose}
    />
  )
})
