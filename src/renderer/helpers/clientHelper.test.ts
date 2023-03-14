import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'

import { MOCK_PHRASE } from '../../shared/mock/wallet'
import { isBnbClient } from './clientHelper'

const sochainApiKey = ''

describe('helpers/clientHelper', () => {
  describe('isBnbClient', () => {
    it('returns true for BNB client', () => {
      const client = new BnbClient({ phrase: MOCK_PHRASE })
      expect(isBnbClient(client)).toBeTruthy()
    })
    it('returns false for BTC client', () => {
      const client = new BtcClient({ phrase: MOCK_PHRASE, sochainApiKey: sochainApiKey })
      expect(isBnbClient(client)).toBeFalsy()
    })
  })
})
