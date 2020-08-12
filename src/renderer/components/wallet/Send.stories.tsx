import React from 'react'

import { failure, initial, pending, RemoteData, success } from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { EMPTY, Observable, of } from 'rxjs'

import Send from './Send'

// eslint-disable-next-line
const createServiceProp = (value: Observable<RemoteData<Error, any>>) => ({
  transaction$: value,
  pushTx: () => of(initial).subscribe(),
  resetTx: () => null
})

storiesOf('Wallet/Send', module)
  .add('send', () => {
    return <Send transactionService={createServiceProp(EMPTY)} />
  })
  .add('freeze', () => {
    return <Send transactionService={createServiceProp(EMPTY)} sendAction="freeze" />
  })
  .add('unfreeze', () => {
    return <Send transactionService={createServiceProp(EMPTY)} sendAction="unfreeze" />
  })
  .add('pending', () => {
    return <Send transactionService={createServiceProp(of(pending))} />
  })
  .add('error', () => {
    return <Send transactionService={createServiceProp(of(failure(Error('error example'))))} />
  })
  .add('success', () => {
    return (
      <Send
        transactionService={createServiceProp(
          of(
            success({
              code: 200,
              hash: '',
              log: '',
              ok: true
            })
          )
        )}
      />
    )
  })
