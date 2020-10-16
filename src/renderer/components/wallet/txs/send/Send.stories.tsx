import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'

import { ApiError, ErrorId } from '../../../../services/wallet/types'
import { Send } from './index'

const sendForm: JSX.Element = <h1>Send Form</h1>

storiesOf('Wallet/Send', module)
  .add('initial', () => {
    return (
      <Send txRD={RD.initial} sendForm={sendForm} inititalActionHandler={() => console.log('initial action handler')} />
    )
  })
  .add('progress', () => {
    return <Send txRD={RD.pending} sendForm={<h1>Send Form pending</h1>} />
  })
  .add('send error', () => {
    return (
      <Send
        txRD={RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Sending tx failed' } as ApiError)}
        sendForm={sendForm}
        errorActionHandler={() => console.log('error action handler')}
      />
    )
  })
  .add('success', () => {
    return (
      <Send
        txRD={RD.success('0xabc123')}
        sendForm={sendForm}
        successActionHandler={(hash: string) => console.log(`success action handler: ${hash}`)}
      />
    )
  })
