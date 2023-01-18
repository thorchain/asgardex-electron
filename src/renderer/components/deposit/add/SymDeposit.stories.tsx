import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, baseAmount, Asset, assetToString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '../../../../shared/utils/asset'
import { WalletType } from '../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import { mockWalletBalance } from '../../../helpers/test/testWalletHelper'
import { INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { SymDepositState } from '../../../services/chain/types'
import { WalletBalance } from '../../../services/wallet/types'
import { SymDeposit, Props as SymDepositProps } from './SymDeposit'

const balanceRune: WalletBalance = mockWalletBalance({
  amount: assetToBase(assetAmount(100))
})

const balanceBNB: WalletBalance = mockWalletBalance({
  amount: assetToBase(assetAmount(200)),
  asset: AssetBNB,
  walletAddress: 'bnb-address'
})

const balanceBTC: WalletBalance = mockWalletBalance({
  asset: AssetBTC,
  amount: assetToBase(assetAmount(2)),
  walletAddress: 'btc-address'
})

const balanceTOMO: WalletBalance = mockWalletBalance({
  asset: AssetETH,
  amount: assetToBase(assetAmount(3)),
  walletAddress: ''
})

const defaultProps: SymDepositProps = {
  disableDepositAction: false,
  availableAssets: [AssetRuneNative, AssetBNB, AssetBTC],
  walletBalances: { balances: O.some([balanceRune, balanceBNB, balanceBTC, balanceTOMO]), loading: false },
  asset: { asset: AssetBNB, decimal: BNB_DECIMAL },
  poolDetails: [],
  pricePool: RUNE_PRICE_POOL,
  assetWalletType: 'keystore',
  runeWalletType: 'ledger',
  onChangeAsset: ({
    asset,
    assetWalletType,
    runeWalletType
  }: {
    asset: Asset
    assetWalletType: WalletType
    runeWalletType: WalletType
  }) => console.log('change asset', assetToString(asset), assetWalletType, runeWalletType),
  reloadFees: () => console.log('reload fees'),
  fees$: () =>
    Rx.of(
      RD.success({
        rune: {
          inFee: assetToBase(assetAmount(0.2)),
          outFee: assetToBase(assetAmount(0.6)),
          refundFee: assetToBase(assetAmount(0.6))
        },
        asset: {
          asset: AssetBNB,
          inFee: assetToBase(assetAmount(0.000075)),
          outFee: assetToBase(assetAmount(0.000225)),
          refundFee: assetToBase(assetAmount(0.000225))
        }
      })
    ),
  reloadApproveFee: () => console.log('reloadFees'),
  approveFee$: () => Rx.of(RD.success(baseAmount(10000000))),
  poolData: {
    assetBalance: baseAmount('1000'),
    runeBalance: baseAmount('2000')
  },
  poolAddress: O.none,
  reloadBalances: () => console.log('reloadBalances'),
  reloadShares: (delay = 0) => console.log('reloadShares ', delay),
  reloadSelectedPoolDetail: (delay = 0) => console.log('reloadSelectedPoolDetail ', delay),
  openAssetExplorerTxUrl: (txHash: TxHash) => {
    console.log(`Open asset explorer - tx hash ${txHash}`)
    return Promise.resolve(true)
  },
  openRuneExplorerTxUrl: (txHash: TxHash) => {
    console.log(`Open RUNE explorer - tx hash ${txHash}`)
    return Promise.resolve(true)
  },
  getAssetExplorerTxUrl: (txHash: TxHash) => O.some(`url/asset-${txHash}`),
  getRuneExplorerTxUrl: (txHash: TxHash) => O.some(`url/asset-${txHash}`),
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  // mock successfull result of sym. deposit$
  deposit$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('deposit$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<SymDepositState>({
          ...INITIAL_SYM_DEPOSIT_STATE,
          step: 4,
          depositTxs: { rune: RD.success('rune-tx-hash'), asset: RD.success('asset-tx-hash') },
          deposit: RD.success(true)
        })
      )
    ),
  network: 'testnet',
  approveERC20Token$: () => Rx.of(RD.success('txHash')),
  isApprovedERC20Token$: () => Rx.of(RD.success(true)),
  protocolLimitReached: false,
  poolsData: {
    [assetToString(AssetBNB)]: {
      assetBalance: baseAmount(30),
      runeBalance: baseAmount(10)
    }
  },
  symPendingAssets: RD.initial,
  hasAsymAssets: RD.initial,
  symAssetMismatch: RD.initial,
  openRecoveryTool: () => console.log('openRecoveryTool'),
  openAsymDepositTool: () => console.log('openAsymDepositTool'),
  hidePrivateData: false
}

export const Default: Story = () => <SymDeposit {...defaultProps} />

Default.storyName = 'default'

export const BalanceError: Story = () => {
  const props: SymDepositProps = {
    ...defaultProps,
    walletBalances: {
      balances: O.some([
        { ...balanceRune, balance: ZERO_BASE_AMOUNT },
        { ...balanceBNB, balance: ZERO_BASE_AMOUNT },
        balanceBTC,
        balanceTOMO
      ]),
      loading: false
    }
  }
  return <SymDeposit {...props} />
}
BalanceError.storyName = 'balance error'

export const BalanceLoading = () => {
  const props: SymDepositProps = {
    ...defaultProps,
    walletBalances: { balances: O.none, loading: true }
  }
  return <SymDeposit {...props} />
}
BalanceError.storyName = 'balance loading'

export const FeeError: Story = () => {
  const props: SymDepositProps = {
    ...defaultProps,
    fees$: () =>
      Rx.of(
        RD.success({
          rune: {
            inFee: assetToBase(assetAmount(2)),
            outFee: assetToBase(assetAmount(6)),
            refundFee: assetToBase(assetAmount(6))
          },
          asset: {
            asset: AssetBNB,
            inFee: assetToBase(assetAmount(1)),
            outFee: assetToBase(assetAmount(3)),
            refundFee: assetToBase(assetAmount(3))
          }
        })
      ),
    walletBalances: {
      balances: O.some([
        { ...balanceRune, balance: assetToBase(assetAmount(0.6)) },
        { ...balanceBNB, balance: assetToBase(assetAmount(0.5)) },
        balanceBTC,
        balanceTOMO
      ]),
      loading: false
    }
  }
  return <SymDeposit {...props} />
}
FeeError.storyName = 'fee error'

const meta: Meta = {
  component: SymDeposit,
  title: 'Components/Deposit/SymDeposit'
}

export default meta
