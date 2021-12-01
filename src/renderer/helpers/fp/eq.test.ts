import * as RD from '@devexperts/remote-data-ts'
import { Balance } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  baseAmount,
  BCHChain,
  bn,
  BNBChain,
  Chain,
  THORChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { LedgerErrorId } from '../../../shared/api/types'
import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../shared/mock/address'
import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { WalletAddress } from '../../../shared/wallet/types'
import { SymDepositAddresses } from '../../services/chain/types'
import { PoolAddress, PoolShare } from '../../services/midgard/types'
import { INITIAL_LEDGER_ADDRESS_MAP } from '../../services/wallet/const'
import { ApiError, ErrorId, LedgerAddressMap } from '../../services/wallet/types'
import { AssetWithAmount } from '../../types/asgardex'
import { PricePool } from '../../views/pools/Pools.types'
import { mockWalletAddress } from '../test/testWalletHelper'
import {
  eqAsset,
  eqBaseAmount,
  eqBalance,
  eqBalances,
  eqAssetsWithAmount,
  eqAssetWithAmount,
  eqApiError,
  eqBigNumber,
  eqOAsset,
  eqChain,
  eqOChain,
  eqPoolShares,
  eqPoolShare,
  eqPoolAddresses,
  eqONullableString,
  eqAssetAmount,
  eqPricePool,
  eqOString,
  eqLedgerAddressMap,
  eqWalletAddress,
  eqOWalletAddress,
  eqSymDepositAddresses
} from './eq'

describe('helpers/fp/eq', () => {
  describe('eqOString', () => {
    it('same some(string) are equal', () => {
      const a = O.some('hello')
      const b = O.some('hello')
      expect(eqOString.equals(a, b)).toBeTruthy()
    })
    it('different some(asset) are not equal', () => {
      const a = O.some('hello')
      const b = O.some('world')
      expect(eqOString.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b = O.some('hello')
      expect(eqOString.equals(O.none, b)).toBeFalsy()
    })
    it('none/none are equal', () => {
      expect(eqOString.equals(O.none, O.none)).toBeTruthy()
    })
  })

  describe('eqBigNumber', () => {
    it('is equal', () => {
      expect(eqBigNumber.equals(bn(1.01), bn(1.01))).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqBigNumber.equals(bn(1), bn(1.01))).toBeFalsy()
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
      expect(eqChain.equals(THORChain, THORChain)).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqChain.equals(THORChain, BNBChain)).toBeFalsy()
    })
  })

  describe('eqOChain', () => {
    it('same some(chain) are equal', () => {
      const a: O.Option<Chain> = O.some(THORChain)
      expect(eqOChain.equals(a, a)).toBeTruthy()
    })
    it('different some(chain) are not equal', () => {
      const a: O.Option<Chain> = O.some(THORChain)
      const b: O.Option<Chain> = O.some(BNBChain)
      expect(eqOChain.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b: O.Option<Chain> = O.some(BNBChain)
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

  describe('eqAssetAmount', () => {
    it('is equal', () => {
      const a = assetAmount(100, 18)
      expect(eqAssetAmount.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a = assetAmount(100, 18)
      const b = assetAmount(222, 18)
      expect(eqAssetAmount.equals(a, b)).toBeFalsy()
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

  describe('eqAssetWithAmount', () => {
    it('is equal', () => {
      const a: AssetWithAmount = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      expect(eqAssetWithAmount.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: AssetWithAmount = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      // b = same as a, but another amount
      const b: AssetWithAmount = {
        ...a,
        amount: baseAmount('2')
      }
      // c = same as a, but another asset
      const c: AssetWithAmount = {
        ...a,
        asset: AssetRuneNative
      }
      expect(eqAssetWithAmount.equals(a, b)).toBeFalsy()
      expect(eqAssetWithAmount.equals(a, c)).toBeFalsy()
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

  describe('eqBalances', () => {
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

  describe('eqAssetsWithAmount', () => {
    const a: AssetWithAmount = {
      amount: baseAmount('1'),
      asset: AssetRuneNative
    }
    const b: AssetWithAmount = {
      ...a,
      asset: AssetBNB
    }
    const c: AssetWithAmount = {
      ...a,
      asset: ASSETS_TESTNET.BOLT
    }
    it('is equal', () => {
      expect(eqAssetsWithAmount.equals([a, b], [a, b])).toBeTruthy()
    })
    it('is not equal with different elements', () => {
      expect(eqAssetsWithAmount.equals([a, b], [b, c])).toBeFalsy()
    })
    it('is not equal if elements has been flipped', () => {
      expect(eqAssetsWithAmount.equals([a, b], [b, a])).toBeFalsy()
    })
  })

  describe('eqPoolShare', () => {
    it('is equal', () => {
      const a: PoolShare = {
        type: 'asym',
        units: bn(1),
        asset: AssetRuneNative,
        runeAddress: O.some(RUNE_ADDRESS_TESTNET),
        assetAddress: O.none,
        assetAddedAmount: baseAmount(1)
      }
      expect(eqPoolShare.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: PoolShare = {
        type: 'asym',
        units: bn(1),
        asset: AssetRuneNative,
        runeAddress: O.some(RUNE_ADDRESS_TESTNET),
        assetAddress: O.none,
        assetAddedAmount: baseAmount(1)
      }
      // b = same as a, but another units
      const b: PoolShare = {
        ...a,
        units: bn(2)
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
      units: bn(1),
      asset: AssetRuneNative,
      runeAddress: O.some(RUNE_ADDRESS_TESTNET),
      assetAddress: O.none,
      assetAddedAmount: baseAmount(1)
    }
    const b: PoolShare = {
      type: 'sym',
      units: bn(1),
      asset: AssetBNB,
      assetAddress: O.some(BNB_ADDRESS_TESTNET),
      runeAddress: O.some(RUNE_ADDRESS_TESTNET),
      assetAddedAmount: baseAmount(0.5)
    }
    const c: PoolShare = {
      type: 'all',
      units: bn(1),
      asset: AssetBTC,
      assetAddress: O.some('btc-address'),
      runeAddress: O.some(RUNE_ADDRESS_TESTNET),
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
      chain: BCHChain,
      address: 'addressA',
      router: O.none,
      halted: false
    }
    const b: PoolAddress = {
      chain: BNBChain,
      address: 'addressB',
      router: O.some('routerB'),
      halted: false
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

  describe('eqPricePool', () => {
    const a: PricePool = {
      asset: AssetRuneNative,
      poolData: {
        runeBalance: baseAmount(1),
        assetBalance: baseAmount(1)
      }
    }
    const b: PricePool = {
      asset: AssetRuneNative,
      poolData: {
        runeBalance: baseAmount(2),
        assetBalance: baseAmount(1)
      }
    }
    const c: PricePool = {
      asset: AssetBNB,
      poolData: {
        runeBalance: baseAmount(2),
        assetBalance: baseAmount(1)
      }
    }

    it('is equal', () => {
      expect(eqPricePool.equals(a, a)).toBeTruthy()
      expect(eqPricePool.equals(b, b)).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqPricePool.equals(a, b)).toBeFalsy()
      expect(eqPricePool.equals(b, c)).toBeFalsy()
    })
  })

  describe('eqLedgerAddressMap', () => {
    const a: LedgerAddressMap = INITIAL_LEDGER_ADDRESS_MAP
    const b: LedgerAddressMap = {
      ...INITIAL_LEDGER_ADDRESS_MAP,
      mainnet: RD.pending
    }
    const c: LedgerAddressMap = {
      ...INITIAL_LEDGER_ADDRESS_MAP,
      testnet: RD.failure({ errorId: LedgerErrorId.DENIED, msg: '' })
    }

    it('is equal', () => {
      expect(eqLedgerAddressMap.equals(a, a)).toBeTruthy()
      expect(eqLedgerAddressMap.equals(b, b)).toBeTruthy()
      expect(eqLedgerAddressMap.equals(c, c)).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqLedgerAddressMap.equals(a, b)).toBeFalsy()
      expect(eqLedgerAddressMap.equals(b, a)).toBeFalsy()
      expect(eqLedgerAddressMap.equals(a, c)).toBeFalsy()
      expect(eqLedgerAddressMap.equals(c, b)).toBeFalsy()
    })
  })

  describe('eqWalletAddress', () => {
    const a: WalletAddress = mockWalletAddress()

    it('is equal', () => {
      expect(eqWalletAddress.equals(a, a)).toBeTruthy()
    })

    it('is not equal', () => {
      expect(eqWalletAddress.equals(a, { ...a, address: 'another' })).toBeFalsy()
      expect(eqWalletAddress.equals(a, { ...a, type: 'ledger' })).toBeFalsy()
      expect(eqWalletAddress.equals(a, { ...a, chain: BNBChain })).toBeFalsy()
      expect(eqWalletAddress.equals(a, { ...a, walletIndex: 1 })).toBeFalsy()
    })
  })

  describe('eqOWalletAddress', () => {
    const a: WalletAddress = mockWalletAddress()

    it('is equal', () => {
      expect(eqOWalletAddress.equals(O.some(a), O.some(a))).toBeTruthy()
      expect(eqOWalletAddress.equals(O.none, O.none)).toBeTruthy()
    })

    it('is not equal', () => {
      expect(eqOWalletAddress.equals(O.some(a), O.some({ ...a, address: 'another' }))).toBeFalsy()
      expect(eqOWalletAddress.equals(O.some(a), O.some({ ...a, type: 'ledger' }))).toBeFalsy()
      expect(eqOWalletAddress.equals(O.some(a), O.some({ ...a, chain: BNBChain }))).toBeFalsy()
      expect(eqOWalletAddress.equals(O.some(a), O.some({ ...a, walletIndex: 1 }))).toBeFalsy()
    })
  })

  describe('eqSymDepositAddresses', () => {
    const rune: WalletAddress = mockWalletAddress()
    const oRune: O.Option<WalletAddress> = O.some(rune)
    const asset: WalletAddress = mockWalletAddress({ chain: BNBChain })
    const oAsset: O.Option<WalletAddress> = O.some(asset)
    const addresses: SymDepositAddresses = { rune: oRune, asset: oAsset }

    it('are equal', () => {
      expect(eqSymDepositAddresses.equals(addresses, addresses)).toBeTruthy()
    })

    it('are not equal', () => {
      expect(
        eqSymDepositAddresses.equals(addresses, { asset: oAsset, rune: O.some({ ...rune, address: 'another' }) })
      ).toBeFalsy()
      expect(
        eqSymDepositAddresses.equals(addresses, { asset: oAsset, rune: O.some({ ...rune, type: 'ledger' }) })
      ).toBeFalsy()
      expect(
        eqSymDepositAddresses.equals(addresses, { asset: oAsset, rune: O.some({ ...rune, chain: BNBChain }) })
      ).toBeFalsy()
      expect(
        eqSymDepositAddresses.equals(addresses, { asset: oAsset, rune: O.some({ ...rune, walletIndex: 1 }) })
      ).toBeFalsy()
      expect(eqSymDepositAddresses.equals(addresses, { asset: oAsset, rune: O.none })).toBeFalsy()
      expect(eqSymDepositAddresses.equals(addresses, { asset: O.none, rune: oRune })).toBeFalsy()
      expect(eqSymDepositAddresses.equals(addresses, { asset: O.none, rune: O.none })).toBeFalsy()
    })
  })
})
