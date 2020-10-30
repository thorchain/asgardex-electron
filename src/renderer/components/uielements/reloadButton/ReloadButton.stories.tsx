import React from 'react'

import { storiesOf } from '@storybook/react'

import { ReloadButton } from './'

storiesOf('Components/ReloadButton', module)
  .add('default', () => <ReloadButton />)
  .add('withh children', () => (
    <ReloadButton>
      <>Reaload child text here</>
    </ReloadButton>
  ))
