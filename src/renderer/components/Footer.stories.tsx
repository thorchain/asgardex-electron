import React from 'react'

import { storiesOf } from '@storybook/react'

import Footer from './Footer'

storiesOf('Footer', module).add('default', () => {
  return (
    <Footer
      commitHash="e69bea54b8228aff6d6bcf4bca6c1de07ac07c90"
      openExternal={(url: string) => Promise.resolve(console.log(`open external ${url}`))}
    />
  )
})
