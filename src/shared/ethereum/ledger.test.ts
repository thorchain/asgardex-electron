import { getDerivationPath } from './ledger'

describe('shared/eth/ledger', () => {
  describe('getDerivationPath', () => {
    it('metamask', () => {
      expect(getDerivationPath(0, 'metamask')).toEqual(`m/44'/60'/0'/0/0`)
      expect(getDerivationPath(1, 'metamask')).toEqual(`m/44'/60'/0'/0/1`)
    })
    it('ledger live', () => {
      expect(getDerivationPath(0, 'ledgerlive')).toEqual(`m/44'/60'/0'/0/0`)
      expect(getDerivationPath(1, 'ledgerlive')).toEqual(`m/44'/60'/1'/0/0`)
    })
    it('legacy', () => {
      expect(getDerivationPath(0, 'legacy')).toEqual(`m/44'/60'/0'/0`)
      expect(getDerivationPath(1, 'legacy')).toEqual(`m/44'/60'/0'/1`)
    })
  })
})
