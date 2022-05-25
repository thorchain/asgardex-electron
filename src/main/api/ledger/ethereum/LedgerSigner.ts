/**
 * LedgerSigner
 *
 * Heavily based on https://github.com/ethers-io/ethers.js/blob/master/packages/hardware-wallets/src.ts/ledger.ts
 *
 */

import EthApp from '@ledgerhq/hw-app-eth'
import ledgerService from '@ledgerhq/hw-app-eth/lib/services/ledger'
import type { LedgerEthTransactionResolution } from '@ledgerhq/hw-app-eth/lib/services/types'
import { delay } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { isError } from '../../../../shared/utils/guard'

type TransportError = Error & {
  name: 'TransportError'
  id: string
}

export const isTransportError = (u: unknown): u is TransportError =>
  isError(u) && (u as TransportError).name === 'TransportError' && !!(u as TransportError).id

export class LedgerSigner extends ethers.Signer {
  readonly provider: ethers.providers.Provider
  readonly path: string
  readonly app: EthApp

  constructor({ provider, path, app }: { provider: ethers.providers.Provider; path: string; app: EthApp }) {
    super()

    this.provider = provider
    this.path = path
    this.app = app

    ethers.utils.defineReadOnly(this, 'path', path)
    ethers.utils.defineReadOnly(this, 'provider', provider)
    ethers.utils.defineReadOnly(this, 'app', app)
  }

  _retry<T>(callback: (eth: EthApp) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) =>
      // Use IIFE to make lint happy (instead of `new Promise(async ...)`)
      (async () => {
        // Wait up to 5 seconds (delay 100 * 50)
        for (let i = 0; i < 50; i++) {
          try {
            const result = await callback(this.app)
            return resolve(result)
          } catch (error) {
            if (isTransportError(error) && error.id !== 'TransportLocked') {
              return reject(error)
            }
          }
          await delay(100)
        }

        return Promise.reject(Error('timeout'))
      })()
    )
  }

  async getAddress(): Promise<string> {
    const { address } = await this._retry((app) => app.getAddress(this.path))
    return ethers.utils.getAddress(address)
  }

  async signMessage(message: ethers.utils.Bytes | string): Promise<string> {
    if (typeof message === 'string') {
      message = ethers.utils.toUtf8Bytes(message)
    }

    const messageHex = ethers.utils.hexlify(message).substring(2)

    const sig = await this._retry((app) => app.signPersonalMessage(this.path, messageHex))
    sig.r = '0x' + sig.r
    sig.s = '0x' + sig.s

    return ethers.utils.joinSignature(sig)
  }

  async signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
    const tx = await ethers.utils.resolveProperties(transaction)

    const baseTx: ethers.utils.UnsignedTransaction = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      gasPrice: tx.gasPrice || undefined,
      nonce: tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined,
      maxFeePerGas: tx.maxFeePerGas || undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
      type: tx.type || undefined,
      to: tx.to || undefined,
      value: tx.value || undefined
    }

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2)

    // resolution is needed now
    // see https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-eth/README.md#signtransaction
    const resolution: LedgerEthTransactionResolution = await ledgerService.resolveTransaction(unsignedTx, {}, {})

    const sig = await this._retry((app) => app.signTransaction(this.path, unsignedTx, resolution))

    return ethers.utils.serializeTransaction(baseTx, {
      v: ethers.BigNumber.from('0x' + sig.v).toNumber(),
      r: '0x' + sig.r,
      s: '0x' + sig.s
    })
  }

  connect(provider: ethers.providers.Provider): ethers.Signer {
    return new LedgerSigner({ provider, path: this.path, app: this.app })
  }
}
