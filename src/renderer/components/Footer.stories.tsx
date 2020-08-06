import React from 'react'

import { storiesOf } from '@storybook/react'

import Footer from './Footer'

const CHash = 'e69bea54b8228aff6d6bcf4bca6c1de07ac07c90'
const clickHandler = (url: string) => Promise.resolve(console.log(`open external ${url}`))
storiesOf('Footer', module)
  .add('default', () => {
    return <Footer commitHash={CHash} openExternal={clickHandler} isDev />
  })
  .add('isDev == false (hide playground icon)', () => {
    return <Footer commitHash={CHash} openExternal={clickHandler} isDev={false} />
  })
  .add('no Github hash (hide branch icon)', () => {
    return <Footer openExternal={clickHandler} isDev />
  })
