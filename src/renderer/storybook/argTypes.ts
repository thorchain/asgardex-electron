import * as O from 'fp-ts/lib/Option'

import { MOCK_PHRASE } from '../../shared/mock/wallet'

export const keystore = {
  options: ['empty', 'locked', 'unlocked'],
  mapping: {
    empty: O.none,
    locked: O.some({ id: 1 }),
    unlocked: O.some({ id: 1, phrase: MOCK_PHRASE })
  }
}

export const network = {
  name: 'Network',
  control: {
    type: 'radio',
    options: ['mainnet', 'stagenet', 'testnet']
  }
}
