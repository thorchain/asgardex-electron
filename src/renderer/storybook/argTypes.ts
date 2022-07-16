import * as O from 'fp-ts/lib/Option'

import { MOCK_PHRASE } from '../../shared/mock/wallet'

export const keystore = {
  options: ['empty', 'locked', 'unlocked'],
  mapping: {
    empty: O.none,
    locked: O.some(O.none),
    unlocked: O.some(O.some({ phrase: MOCK_PHRASE }))
  }
}

export const network = {
  name: 'Network',
  control: {
    type: 'radio',
    options: ['mainnet', 'stagenet', 'testnet']
  }
}
