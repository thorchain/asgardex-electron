/**
 * LedgerSigner
 *
 * Heavily based on https://github.com/ethers-io/ethers.js/blob/master/packages/hardware-wallets/src.ts/ledger.ts
 *
 */

import EthApp from '@ledgerhq/hw-app-eth'
import { ethers } from 'ethers'

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

  async getAddress(): Promise<string> {
    const { address } = await this.app.getAddress(this.path)
    return ethers.utils.getAddress(address)
  }

  async signMessage(message: ethers.utils.Bytes | string): Promise<string> {
    if (typeof message === 'string') {
      message = ethers.utils.toUtf8Bytes(message)
    }

    const messageHex = ethers.utils.hexlify(message).substring(2)

    const sig = await this.app.signPersonalMessage(this.path, messageHex)
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
      to: tx.to || undefined,
      value: tx.value || undefined
    }

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2)
    const sig = await this.app.signTransaction(this.path, unsignedTx)

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
