import React from 'react'

import { storiesOf } from '@storybook/react'

import { ReloadButton } from './'

storiesOf('Components/ReloadButton', module)
  .add('default', () => <ReloadButton />)
  .add('with children', () => <ReloadButton>Reload child text here</ReloadButton>)
