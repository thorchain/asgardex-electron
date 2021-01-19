import React from 'react'

import { storiesOf } from '@storybook/react'

import { PhraseCopyModal } from './PhraseCopyModal'

const onClose = () => console.log('onClose')
const sample_phrase = 'rural bright ball negative already grass good grant nation screen model pizza'

storiesOf('Phrase/Copy', module).add('default', () => {
  return <PhraseCopyModal phrase={sample_phrase} visible={true} onClose={onClose} />
})
