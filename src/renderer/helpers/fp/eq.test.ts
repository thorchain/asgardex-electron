import { Balance } from '@xchainjs/xchain-client'
import {
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneERC20,
  AssetRuneNative,
  baseAmount,
  bn,
  Chain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { SymDepositFeesParams } from '../../services/chain/types'
import { PoolAddress, PoolShare } from '../../services/midgard/types'
import { ApiError, ErrorId } from '../../services/wallet/types'
import {
  eqAsset,
  eqBaseAmount,
  eqBalance,
  eqBalances,
  eqApiError,
  egBigNumber,
  eqOAsset,
  eqChain,
  eqOChain,
  eqPoolShares,
  eqPoolShare,
  eqPoolAddresses,
  eqONullableString
} from './eq'

describe('helpers/fp/eq', () => {
  describe('egBigNumber', () => {
    it('is equal', () => {
      expect(egBigNumber.equals(bn(1.01), bn(1.01))).toBeTruthy()
    })
    it('is not equal', () => {
      expect(egBigNumber.equals(bn(1), bn(1.01))).toBeFalsy()
    })
  })

  describe('eqAsset', () => {
    it('is equal', () => {
      const a = AssetRuneNative
      expect(eqAsset.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a = AssetRuneNative
      const b = AssetBNB
      expect(eqAsset.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqOAsset', () => {
    it('same some(asset) are equal', () => {
      const a = O.some(AssetRuneNative)
      expect(eqOAsset.equals(a, a)).toBeTruthy()
    })
    it('different some(asset) are not equal', () => {
      const a = O.some(AssetRuneNative)
      const b = O.some(AssetBNB)
      expect(eqOAsset.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b = O.some(AssetBNB)
      expect(eqOAsset.equals(O.none, b)).toBeFalsy()
    })
    it('none/none are equal', () => {
      expect(eqOAsset.equals(O.none, O.none)).toBeTruthy()
    })
  })

  describe('eqChain', () => {
    it('is equal', () => {
      expect(eqChain.equals('THOR', 'THOR')).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqChain.equals('THOR', 'BNB')).toBeFalsy()
    })
  })

  describe('eqOChain', () => {
    it('same some(chain) are equal', () => {
      const a: O.Option<Chain> = O.some('THOR')
      expect(eqOChain.equals(a, a)).toBeTruthy()
    })
    it('different some(chain) are not equal', () => {
      const a: O.Option<Chain> = O.some('THOR')
      const b: O.Option<Chain> = O.some('BNB')
      expect(eqOChain.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b: O.Option<Chain> = O.some('BNB')
      expect(eqOChain.equals(O.none, b)).toBeFalsy()
    })
    it('none/none are equal', () => {
      expect(eqOChain.equals(O.none, O.none)).toBeTruthy()
    })
  })

  describe('eqBaseAmount', () => {
    it('is equal', () => {
      const a = baseAmount(100, 18)
      expect(eqBaseAmount.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a = baseAmount(100, 18)
      const b = baseAmount(222, 18)
      expect(eqBaseAmount.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqApiError', () => {
    const a: ApiError = {
      errorId: ErrorId.GET_BALANCES,
      msg: 'msg'
    }
    it('is equal', () => {
      expect(eqApiError.equals(a, a)).toBeTruthy()
    })
    it('is not equal with different msg', () => {
      const b: ApiError = {
        ...a,
        msg: 'anotherMsg'
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
    it('is not equal with different msg', () => {
      const b: ApiError = {
        ...a,
        errorId: ErrorId.SEND_TX
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqBalance', () => {
    it('is equal', () => {
      const a: Balance = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      expect(eqBalance.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: Balance = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      // b = same as a, but another amount
      const b: Balance = {
        ...a,
        amount: baseAmount('2')
      }
      // c = same as a, but another asset
      const c: Balance = {
        ...a,
        asset: AssetRuneNative
      }
      expect(eqBalance.equals(a, b)).toBeFalsy()
      expect(eqBalance.equals(a, c)).toBeFalsy()
    })
  })

  describe('eqONullableString', () => {
    it('is equal', () => {
      expect(eqONullableString.equals(O.some('MEMO'), O.some('MEMO'))).toBeTruthy()
      expect(eqONullableString.equals(O.none, O.none)).toBeTruthy()
      expect(eqONullableString.equals(undefined, undefined)).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqONullableString.equals(O.none, O.some('MEMO'))).toBeFalsy()
      expect(eqONullableString.equals(O.some('MEMO'), O.none)).toBeFalsy()
      expect(eqONullableString.equals(O.some('MEMO'), undefined)).toBeFalsy()
      expect(eqONullableString.equals(undefined, O.some('MEMO'))).toBeFalsy()
      expect(eqONullableString.equals(undefined, O.none)).toBeFalsy()
      expect(eqONullableString.equals(O.none, undefined)).toBeFalsy()
    })
  })

  describe('eqDepositFeesParams', () => {
    it('is equal', () => {
      const a: SymDepositFeesParams = {
        memos: O.none,
        recipient: O.none,
        type: 'sym',
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      expect(eqBalance.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: SymDepositFeesParams = {
        memos: O.none,
        recipient: O.none,
        type: 'sym',
        amount: baseAmount('1'),
        asset: AssetETH
      }
      // b = same as a, but another amount
      const b: SymDepositFeesParams = {
        ...a,
        asset: AssetRuneERC20
      }
      // c = same as a, but another asset
      const c: SymDepositFeesParams = {
        ...a,
        asset: AssetRuneNative
      }
      expect(eqBalance.equals(a, b)).toBeFalsy()
      expect(eqBalance.equals(a, c)).toBeFalsy()
    })
    it('is not equal', () => {
      const a: SymDepositFeesParams = {
        memos: O.none,
        recipient: O.none,
        type: 'sym',
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      // b = same as a, but another amount
      const b: SymDepositFeesParams = {
        ...a,
        amount: baseAmount('2')
      }
      // c = same as a, but another asset
      const c: SymDepositFeesParams = {
        ...a,
        asset: AssetRuneNative
      }
      expect(eqBalance.equals(a, b)).toBeFalsy()
      expect(eqBalance.equals(a, c)).toBeFalsy()
    })
  })

  describe('eqAssetsWithBalance', () => {
    const a: Balance = {
      amount: baseAmount('1'),
      asset: AssetRuneNative
    }
    const b: Balance = {
      ...a,
      asset: AssetBNB
    }
    const c: Balance = {
      ...a,
      asset: ASSETS_TESTNET.BOLT
    }
    it('is equal', () => {
      expect(eqBalances.equals([a, b], [a, b])).toBeTruthy()
    })
    it('is not equal with different elements', () => {
      expect(eqBalances.equals([a, b], [b, c])).toBeFalsy()
    })
    it('is not equal if elements has been flipped', () => {
      expect(eqBalances.equals([a, b], [b, a])).toBeFalsy()
    })
  })

  describe('eqPoolShare', () => {
    it('is equal', () => {
      const a: PoolShare = {
        type: 'asym',
        units: baseAmount(1),
        asset: AssetRuneNative,
        assetAddedAmount: baseAmount(1)
      }
      expect(eqPoolShare.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: PoolShare = {
        type: 'asym',
        units: baseAmount(1),
        asset: AssetRuneNative,
        assetAddedAmount: baseAmount(1)
      }
      // b = same as a, but another units
      const b: PoolShare = {
        ...a,
        units: baseAmount(2)
      }
      // c = same as a, but another asset
      const c: PoolShare = {
        ...a,
        asset: AssetBNB
      }
      expect(eqPoolShare.equals(a, b)).toBeFalsy()
      expect(eqPoolShare.equals(a, c)).toBeFalsy()
    })
  })

  describe('eqPoolShares', () => {
    const a: PoolShare = {
      type: 'asym',
      units: baseAmount(1),
      asset: AssetRuneNative,
      assetAddedAmount: baseAmount(1)
    }
    const b: PoolShare = {
      type: 'sym',
      units: baseAmount(1),
      asset: AssetBNB,
      assetAddedAmount: baseAmount(0.5)
    }
    const c: PoolShare = {
      type: 'all',
      units: baseAmount(1),
      asset: AssetBTC,
      assetAddedAmount: baseAmount(1)
    }
    it('is equal', () => {
      expect(eqPoolShares.equals([a, b], [a, b])).toBeTruthy()
    })
    it('is not equal with different elements', () => {
      expect(eqPoolShares.equals([a, b], [b, c])).toBeFalsy()
    })
    it('is not equal if elements has been flipped', () => {
      expect(eqPoolShares.equals([a, b], [b, a])).toBeFalsy()
    })
  })
  describe('eqPoolAddresses', () => {
    const a: PoolAddress = {
      chain: 'BCH',
      address: 'addressA',
      router: O.none
    }
    const b: PoolAddress = {
      chain: 'BNB',
      address: 'addressB',
      router: O.some('routerB')
    }
    it('is equal', () => {
      expect(eqPoolAddresses.equals(a, a)).toBeTruthy()
      expect(eqPoolAddresses.equals(b, b)).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqPoolAddresses.equals(a, b)).toBeFalsy()
      expect(eqPoolAddresses.equals(b, a)).toBeFalsy()
    })
  })
})
