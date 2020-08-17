import { isSendAction } from './types'

describe('services/binance/types', () => {
  describe('isSendAction', () => {
    it('returns true for known actions', () => {
      expect(isSendAction('send')).toBeTruthy()
      expect(isSendAction('freeze')).toBeTruthy()
      expect(isSendAction('unfreeze')).toBeTruthy()
    })

    it('returns false for unknown actions asset ', () => {
      expect(isSendAction('unknown-action')).toBeFalsy()
    })
  })
})
