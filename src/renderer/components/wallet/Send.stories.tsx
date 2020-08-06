import React from 'react'

import { storiesOf } from '@storybook/react'

// import Send from './Send'

storiesOf('Wallet/Send', module).add('default', () => {
  // `Send` breaks storybook https://github.com/thorchain/asgardex-electron/issues/323
  // return <Send />
  return <> </>
})
