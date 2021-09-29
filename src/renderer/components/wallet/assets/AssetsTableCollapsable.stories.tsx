import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetLTC,
  AssetRune67C,
  AssetETH,
  AssetRuneNative,
  assetToString,
  baseAmount,
  BNBChain,
  BTCChain,
  Chain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { getMockRDValueFactory, RDStatus } from '../../../../shared/mock/rdByStatus'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import { WalletBalances } from '../../../services/clients'
import { ApiError, ChainBalances, ErrorId, WalletType } from '../../../services/wallet/types'
import { AssetsTableCollapsable } from './index'

const apiError: ApiError = { errorId: ErrorId.GET_BALANCES, msg: 'error message' }

const selectAssetHandler = ({
  asset,
  walletType,
  walletAddress
}: {
  asset: Asset
  walletAddress: Address
  walletType: WalletType
}) => console.log('selectAssetHandler params ', assetToString(asset), walletType, walletAddress)

const balances: Partial<Record<Chain, ChainBalances>> = {
  [BNBChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('bnb keystore'),
      walletIndex: 0,
      chain: BNBChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetBNB,
          walletAddress: 'BNB wallet address'
        },
        {
          walletType: 'keystore',
          amount: baseAmount('300000000'),
          asset: AssetRune67C,
          walletAddress: 'BNB wallet address'
        }
      ])
    }
  ],
  [BTCChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('btc keystore'),
      walletIndex: 0,
      chain: BTCChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetBTC,
          walletAddress: 'BNB wallet address'
        }
      ])
    }
  ],
  [ETHChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('eth keystore'),
      walletIndex: 0,
      chain: ETHChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('300000000'),
          asset: AssetETH,
          walletAddress: 'ETH wallet address'
        }
      ])
    }
  ],
  [THORChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('thor keystore'),
      walletIndex: 0,
      chain: THORChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetRuneNative,
          walletAddress: 'BNB wallet address'
        }
      ])
    }
  ],
  [LTCChain]: [
    {
      walletType: 'keystore',
      walletAddress: O.some('ltc keystore'),
      walletIndex: 0,
      chain: LTCChain,
      balances: RD.success([
        {
          walletType: 'keystore',
          amount: baseAmount('1000000'),
          asset: AssetLTC,
          walletAddress: 'LTC wallet address'
        }
      ])
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

export default {
  component: AssetsTableCollapsable,
  title: 'Wallet/AssetsTableCollapsable',
  argTypes
}

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

export const Default: Story<Partial<Record<Chain, RDStatus>>> = (args) => {
  return (
    <AssetsTableCollapsable
      selectAssetHandler={selectAssetHandler}
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
      pricePool={RUNE_PRICE_POOL}
      network="testnet"
      mimirHalt={RD.initial}
    />
  )
}

Default.args = argTypes
