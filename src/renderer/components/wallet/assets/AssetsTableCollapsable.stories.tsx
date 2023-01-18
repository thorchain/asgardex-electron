import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta } from '@storybook/react'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { getMockRDValueFactory, RDStatus } from '../../../../shared/mock/rdByStatus'
import { AssetBNB, AssetBTC, AssetETH, AssetLTC, AssetRune67C, AssetRuneNative } from '../../../../shared/utils/asset'
import { BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '../../../../shared/utils/chain'
import { WalletType } from '../../../../shared/wallet/types'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import { WalletBalances } from '../../../services/clients'
import { ApiError, ChainBalances, ErrorId, SelectedWalletAsset } from '../../../services/wallet/types'
import { AssetsTableCollapsable } from './index'

const apiError: ApiError = { errorId: ErrorId.GET_BALANCES, msg: 'error message' }

const selectAssetHandler = ({ asset, walletType, walletAddress }: SelectedWalletAsset) =>
  console.log('selectAssetHandler params ', assetToString(asset), walletType, walletAddress)

const assetHandler = ({ asset, walletType, walletAddress }: SelectedWalletAsset) =>
  console.log('assetHandler params ', assetToString(asset), walletType, walletAddress)

const balances: Partial<Record<Chain, ChainBalances>> = {
  [BNBChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('bnb keystore'),

      chain: BNBChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetBNB,
          walletAddress: 'BNB wallet address',
          walletIndex: 0,
          hdMode: 'default'
        },
        {
          walletType: 'keystore',
          amount: baseAmount('300000000'),
          asset: AssetRune67C,
          walletAddress: 'BNB wallet address',
          walletIndex: 0,
          hdMode: 'default'
        }
      ]),
      balancesType: 'all'
    }
  ],
  [BTCChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('btc keystore'),
      chain: BTCChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetBTC,
          walletAddress: 'BNB wallet address',
          walletIndex: 0,
          hdMode: 'default'
        }
      ]),
      balancesType: 'all'
    }
  ],
  [ETHChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('eth keystore'),
      chain: ETHChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('300000000'),
          asset: AssetETH,
          walletAddress: 'ETH wallet address',
          walletIndex: 0,
          hdMode: 'default'
        }
      ]),
      balancesType: 'all'
    }
  ],
  [THORChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('thor keystore'),
      chain: THORChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetRuneNative,
          walletAddress: 'BNB wallet address',
          walletIndex: 0,
          hdMode: 'default'
        }
      ]),
      balancesType: 'all'
    }
  ],
  [LTCChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('ltc keystore'),
      chain: LTCChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetLTC,
          walletAddress: 'LTC wallet address',
          walletIndex: 0,
          hdMode: 'default'
        }
      ]),
      balancesType: 'all'
    }
  ]
}

const argTypes = Object.keys(balances).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: { control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] } }
  }),
  {}
)

const getBalance = (chain: Chain, status: RDStatus | undefined, walletType: WalletType) =>
  getMockRDValueFactory(
    () =>
      FP.pipe(
        balances[chain],
        O.fromNullable,
        O.chain(A.findFirst((chainBalance) => chainBalance.walletType === walletType)),
        O.map(({ balances }) => balances),
        O.chain(RD.toOption),
        O.getOrElse((): WalletBalances => [])
      ),
    () => ({ ...apiError, msg: `${chain} error` })
  )(status)

const Template = (args: Partial<Record<Chain, RDStatus>>) => {
  return (
    <AssetsTableCollapsable
      selectAssetHandler={selectAssetHandler}
      assetHandler={assetHandler}
      chainBalances={FP.pipe(
        Object.entries(balances),
        A.map(([chain, chainBalances]) =>
          FP.pipe(
            chainBalances || [],
            A.map((chainBalance) => ({
              ...chainBalance,
              balances: getBalance(chain as Chain, args[chain as Chain], chainBalance.walletType)
            }))
          )
        ),
        A.flatten
      )}
      poolDetails={[]}
      poolsData={{}}
      pricePool={RUNE_PRICE_POOL}
      network="testnet"
      mimirHalt={RD.initial}
      hidePrivateData={false}
    />
  )
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Wallet/AssetsTableCollapsable',
  argTypes,
  args: argTypes
}
export default meta
