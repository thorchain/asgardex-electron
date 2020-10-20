import React from 'react'

import { storiesOf } from '@storybook/react'

import { Footer } from './index'

const CHash = 'e69bea54b8228aff6d6bcf4bca6c1de07ac07c90'
storiesOf('Footer', module)
  .add('default', () => {
    return <Footer commitHash={CHash} isDev />
  })
  .add('isDev == false (hide playground icon)', () => {
    return <Footer commitHash={CHash} isDev={false} />
  })
  .add('no Github hash (hide branch icon)', () => {
    return <Footer isDev />
  })
