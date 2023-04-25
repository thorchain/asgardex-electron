import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'

import { MOCK_PHRASE } from '../../shared/mock/wallet'
import { isBnbClient } from './clientHelper'

describe('helpers/clientHelper', () => {
  describe('isBnbClient', () => {
    it('returns true for BNB client', () => {
      const client = new BnbClient({ phrase: MOCK_PHRASE })
      expect(isBnbClient(client)).toBeTruthy()
    })
    it('returns false for BTC client', () => {
      const btcInitParams = {
        ...defaultBTCParams,
        phrase: MOCK_PHRASE
      }
      const client = new BtcClient(btcInitParams)
      expect(isBnbClient(client)).toBeFalsy()
    })
  })
})
