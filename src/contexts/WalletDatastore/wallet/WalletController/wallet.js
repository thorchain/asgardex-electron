import { EventEmitter } from "events";

import { BinanceBalancesService } from '../../storage/binance/services/BinanceBalancesService'
import { BinanceTransactionsService } from '../../storage/binance/services/BinanceTransactionsService'
import { BinanceTokensService } from '../../storage/binance/services/BinanceTokensService'
import { UserSettingsService } from '../../storage/services/userSettingsService'

import Binance from './binance';
import { crypto } from '@binance-chain/javascript-sdk'
const bcrypt = require('bcryptjs');
export const BNB = new Binance();

export default class WalletController extends EventEmitter{
  constructor () {
    super()
    console.log("INSTANCE OF WALLET CONTROLLER")
    let locked = true
    this.getIsUnlocked = function () { return !locked }
    this.setIsUnlocked = function (v) { locked = v === true ? false : true }
    let connected = navigator.onLine || false
    this.getConnected = function () { return connected }
    this.setConnected = function (v) { connected = v === true ? true : false }
    this.UserAccount = new UserSettingsService()
    this.UserAssets = new BinanceBalancesService()
    this.UserTransactions = new BinanceTransactionsService()
    this.TokenData = new BinanceTokensService()
  }

  async generateUserAuth (pw) {
    console.log("calling to generate user auth")
    const user = await this.UserAccount.findOne()
    console.log('do we have the user account?')
    console.log(user)
    if (user) {

      // SECURITY: Using bcrypt for now. Confirm needed upgrade to argon2? (issues in client?)
      // The UserAccount collection should never need be synced with a server
      const pwHash = bcrypt.hashSync(pw, 8)
      console.log('here is where it breaks... right?')
      const res = await this.UserAccount.updateOne(user._id,{pwHash:pwHash})
      console.log('updated user?')
      // console.log(user[0])
      console.log(res)
    } else {
      throw Error('Unable to intialize account auth')
    }

  }

  async checkUserAuth (pw) {
    const user = await this.UserAccount.findOne()
    return bcrypt.compareSync(pw, user.pwHash)
  }

  async getTxsFrom (start, address) {
    // https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
    // 60 queries/min, 3 month max date window, default last 24 hrs
    // https://www.epochconverter.com/
    // next 3 months is 1563408000000
    // 3 months in miliseconds: 7862400000 (confirm actual "months"? 2592000000)
    // Latest relevant time (near beginning of 2012): 1577880000000
    // start = 1577880000000
    // we use 89 day window, api docs are unclear as what 3 months is

    const inc = 89 * 24 * 60 * 60 * 1000
    const date = new Date();
    const now = date.getTime();
    const opts = { startTime : start, endTime : start + inc }
    let txs = []

    while (opts.startTime < now) {
      const res = await BNB.getTransactions(address, opts)
      txs = txs.concat(res.data.tx)
      opts.endTime += inc // this cannot go beyond now?
      opts.startTime += inc
    } ;
    return txs
  }


  async initializeTransactionData (address) {
    console.log("initializing transaction data...");
    // Testnet genesis
    const genesis = 1555545600000 // TODO: change per chain (test/main etc.)
    const transactions = await this.getTxsFrom(genesis, address)
    return await this.UserTransactions.insert(transactions)
  }

  async updateTransactionData () {
    console.log("updating transactions...");
    const address = await this.UserAccount.findOne().address
    // const lastTx = UserTransactions.find({pending: {$ne:true}},{sort: {timeStamp: -1}, limit: 1}).fetch()
    const lastTx = await this.UserTransactions.findLastTx()
    let epoch, d, transactions

    if (lastTx[0]) {

      d = new Date(lastTx[0].timeStamp);
      epoch = d.getTime() + 1 // add 1 ms to ensure not getting this same tx
    } else {
      epoch = 1555545600000 // genesis
    }
    const txs = await this.getTxsFrom(epoch, address)
    const txHashes = txs.map(e => {
      return e.txHash
    })

    // const duplicates = UserTransactions.find({txHash:{$in:txHashes}}).fetch()
    const duplicates = await this.UserTransactions.find({txHash:{in:txHashes}})
    if (duplicates.length > 0) {
      console.log('handling duplicates')
      for (let i = 0; i < duplicates.length; i++) {
        const e = duplicates[i]
        const result = await this.UserTransactions.remove({txHash:e.txHash})
      }
    }

    if (txs.length > 0) {
      return await this.UserTransactions.insert(txs)
    } else {
      return []
    }

  }

  getClient () {
    return BNB.bnbClient
  }

  async getTokenData (assets) {
    if (assets && assets.length > 0) {

      const symbols = assets.map(asset => {
        return asset.symbol
      })

      let page = 1;
      let tokensFound = []
      const initialOffset = 0
      const limit = 2000
      while (tokensFound.length < symbols.length) {
        let request, options = {}
        options.offset = ((page -1) * limit) + initialOffset
        options.limit = limit

        try {
          request = await BNB.getTokens(options)
        } catch (error) {
          break
        }

        if (request && request.data && request.data.length > 0) {
          // Go through the tokens
          for (let i = 0; i < request.data.length; i++) {
            const e = request.data[i];
            // Check for a match to account assets
            const match = symbols.find(s => { return s === e.symbol })
            if (match) { tokensFound.push(e) }
            if (tokensFound.length === symbols.length) { break }

          }
          // Safeguard
          if (request.data.length < limit) {
            break
          }

        }
        page+=1
      } // end while()

      return tokensFound
    }
  }

  async initializeTokenData () {
    console.log("initializing token data...");
    const usr = await this.UserAccount.findOne()
    const assets = await this.UserAssets.findAll()
    console.log(usr)
    // if (usr && usr.assets && usr.assets.length > 0) {
      console.log('we needed the stupid assets?')
      const tokens = await this.getTokenData(assets)
      await this.TokenData.removeAll()
      await this.TokenData.insert(tokens)
    // }
  }
  async updateTokenData () {
    console.log('updating token data...')
    // This is better than a sync, since we don't have
    // `updateMultiple` for mongo on the client.
    await this.initializeTokenData()
  }
  watchTxsLoop () {
    // IF this is running, just extend it to a max amount
    // track as member to class
    if (this.txTicks) {
      if (this.txTicks <= 10) { this.txTicks += 8 }
    } else {
      this.txTicks = 8 // value for looping
      const sleep = m => new Promise(r => setTimeout(r, m))
      const forLoop = async () => {
        for (let index = 0; index < this.txTicks; index++) {
          let res = []
          await sleep(3000)
          res = await this.updateTransactionData()
          if (res.length > 0) { this.txTicks = null; break; }
        }
      }

      forLoop()
    }
  }

  initializeConn (address, network) {
    console.log("initializing sockets...");
    try {
      // todo: do we need to use '/stream' ?
      const url = network === 'testnet' ? 'wss://testnet-dex.binance.org/api/ws' : 'wss://dex.binance.org/api/ws'
      this.conn = new WebSocket(url)
    } catch (error) {
      // For debugging
      console.log("socket error");
      console.log(error);

      throw Error(error)
    }

    // subscribe transactions

    this.conn.onopen = (evt) => {
      this.setConnected(true)
      console.log("socket connected")
      this.conn.send(JSON.stringify({ method: "subscribe", topic: "transfers", address: address }))
      this.conn.send(JSON.stringify({ method: "subscribe", topic: "accounts", address: address}));
    }
    this.conn.onerror = (msg) => {this.setConnected(false)}
    this.conn.onclose = (msg) => {this.setConnected(false)}

    this.conn.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      switch (data.stream) {
        case "accounts":
          this.connHandleAccountMessage(data)
          break;
        case "transfers":
          this.connHandleTransferMessage(data)
          break;

        default:
          break;
      }
      // delay between ws broadcast & blockchain confirmation
      this.watchTxsLoop()
    }

  }
  async connHandleTransferMessage (data) {
    const time = new Date(Date.now()).toISOString()
    if (data.data) {

      const tx = {
        txHash: data.data.H,
        memo: data.data.M,
        fromAddr: data.data.f,
        toAddr: data.data.t[0].o,
        txAsset: data.data.t[0].c[0].a,
        value: data.data.t[0].c[0].A,
        blockHeight: data.data.E,
        txType: data.data.e,
        timeStamp: time,
        pending: true
      }
      await this.UserTransactions.remove({txHash:tx.txHash})
      return await this.UserTransactions.insert([tx])
    }
  }
  async connHandleAccountMessage (data) {
      const balances = data.data.B
      const assets = balances.map(function(elem) {
        // these are the new balances
        // These mappings for account ws are different than REST api...
        const asset = {
          free: parseFloat(elem.f),
          frozen: parseFloat(elem.r),
          locked: parseFloat(elem.l),
          symbol: elem.a
        }
        asset.shortSymbol = asset.symbol.split("-")[0].substr(0,4)
        return asset
      })
      const account = await this.UserAccount.findOne();
      if (assets.length !== account.assets.length) {
        // Check to only add new tokens
        const newTokens = await this.getTokenData(assets) // is this potentially bug?
        const oldTokens = await this.TokenData.findAll()
        const addTokens = newTokens.filter(e => {
          return !(oldTokens.find(f => {return e.symbol === f.symbol}))
        })
        // TokenData.batchInsert(addTokens)
        this.TokenData.insert(addTokens)
      }
      // UserAccount.update({_id: account._id}, {$set: {assets: assets}})
      this.updateUserAssetsStore(assets)

  }

  async updateUserAssetsStore (assets) {
    console.log("updating user assets...");
    // we need to find the assets that changed
    const oldAssets = await this.UserAssets.findAll()
    const changed = assets.filter((asset) => {
      // get current balances
      const existingAsset = oldAssets.find(e => {return asset.symbol === e.symbol})
      if (!existingAsset) {
        return true // new asset/token
      }
      // New balance then there is update needed
      return asset.free !== existingAsset.free ||
             asset.locked !== existingAsset.locked ||
             asset.frozen !== existingAsset.frozen
    })

    // Account for swaps etc. with potentially 2 or more changes
    for (let index = 0; index < changed.length; index++) {
      const element = changed[index];
      // UserAssets.update({symbol:element.symbol},{$set: element},{upsert: true})
      await this.UserAssets.update({where:{symbol:element.symbol},set: element})

    }

  }

  async initializeUserAccount (account) {
    console.log("initializing user account data...");
    let assets = []
    await BNB.getBalances(account.address).then(async (e) => {
      if (e.length > 0) {
        assets = e.map(function(elem) {
          // elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
          // elem.free = parseFloat(elem.free)
          // elem.frozen = parseFloat(elem.frozen)
          // elem.locked = parseFloat(elem.locked)
          elem.address = account.address // relational key
          return elem
        })
      }

      console.log('initializing the user account...')
      console.log(account)
      // await this.UserAccount.removeAll()
      await this.UserAccount.insert([account])
      // await this.UserAssets.removeAll()
      await this.UserAssets.insert(assets)
    })

  }

  initializeVault (keystore) {
    console.log("initializing vault...")
    window.localStorage.setItem("binance_keystore", JSON.stringify(keystore));
  }


  async generateAccount (pw, mnemonic) {
    console.log("generating keystore...");

    let account
    if (mnemonic) {
      try {
        account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
        account.keystore = await BNB.sdk.crypto.generateKeyStore(account.privateKey, pw)
        delete account.privateKey // SECURITY: imperative
      } catch (error) {
        throw new Error(error)
      }

    } else {
      account = await BNB.bnbClient.createAccountWithKeystore(pw)
      delete account.privateKey // SECURITY: imperative
    }

    this.emit('walletKeystoreCreated', 'Wallet keystore created')
    return account
  }

  async generateAccountFromKeystore (pw, keystore) {
    const account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
    delete account.privateKey // SECURITY: imperative
    return account
  }

  async generateNewWallet (pw, mnemonic, keystore, network) {
    return new Promise(async (resolve, reject) => {
      // do a thing, possibly async, then…
      // TODO: below, refactor to store agnostic method call adapter
      const vault = window.localStorage.getItem("binance_keystore");
      let account

      // SECURITY: Prevent overwrite of existing vault
      if (vault) {
        throw new Error("Wallet vault already exists")
      } else {

        try {
          if (!network) { network = 'testnet' }
          await BNB.setNetwork(network)
          console.log('set network on binance client...')
          if (keystore) {
            account = await this.generateAccountFromKeystore(pw, keystore)
            // account.keystore = keystore
          } else {
            account = await this.generateAccount(pw, mnemonic)
            console.log('we generated the account...!!!')
            console.log(account)
          }

          // Sequnce is arbitrary and necessary
          await this.initializeVault(account.keystore)
          delete account.keystore
          console.log('success on initialize vault')
          console.log(account)
          await this.initializeUserAccount(account)
          console.log('success on initialize useraccount')
          await this.generateUserAuth(pw)
          console.log('success on generate auth')

          // above ^ required prior to below
          await this.initializeTokenData(account)
          console.log('success on initialize token data')
          await this.initializeTransactionData(account.address)
          console.log('success on initialize transaction data')
          // Binance network websocket
          await this.initializeConn(account.address, network)
          //
          resolve("resolved")
        } catch (error) {
          reject(Error(error));
        }

        this.emit('completedWalletGeneration')
      }

    });


  }


  async lock () {
    if (this.getIsUnlocked() === true) {
      this.conn.close()
    }
    const account = await this.UserAccount.findOne()
    if (account && account._id) {
      await this.UserAccount.update({where:{_id:account._id},set: {locked: true}})
    }
    this.setIsUnlocked(false)
    return true
  }
  async unlock (pw) {
    // intended only for just created wallets, no sync, no init conn
    // DO NOT USE FOR login or new app instance... use below
    const check = await this.checkUserAuth(pw)
    if (check) {
      // await BNB.initializeClient() // pubkey only?
      this.setIsUnlocked(true) // SECURITY: leave last
      const account = await this.UserAccount.findOne()
      await this.UserAccount.update({where:{_id:account._id},set: {locked: false}})
    } else {

      throw Error("Incorrect password")
    }
  }
  async unlockAndSync (pw) {
    const account = await this.UserAccount.findOne()
    if (await this.checkUserAuth(pw)) {
      try {
        const network = account.address.charAt(0) === 't' ? 'testnet' : 'mainnet'
        await BNB.setNetwork(network)
        await this.initializeConn(account.address, network) // this should fail gracefully for offline use
        await this.syncUserData()
        this.setIsUnlocked(true) // SECURITY: leave last of internal methods
        await this.UserAccount.update({where:{_id:account._id},set: {locked: false}})

      } catch (error) {
        throw Error(error)
      }
    } else {
      // TODO: overly assumptive, handle errors better
      throw Error("Incorrect password")
    }

  }

  async syncUserData () {
    // This can be called after unlock
    await this.updateUserBalances()
    await this.updateTransactionData()
    await this.updateTokenData()
    // TODO: update token data. Is this necessary?
    // TODO: update market data
  }

  async updateUserBalances () {
    const user = await this.UserAccount.findOne({_id:0})
    let balances = {}
    await BNB.getBalances(user.address).then(async (e) => {
      balances = e.map(function(elem) {
        elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
        elem.free = parseFloat(elem.free)
        elem.frozen = parseFloat(elem.frozen)
        elem.locked = parseFloat(elem.locked)
        return elem
      })

      if (balances.length > 0) {
        // const doc = UserAccount.findOne();
        await this.UserAccount.update({where:{_id:user._id}, set: {assets: balances}})
        await this.updateUserAssetsStore(balances)
      }
    }).catch(e => {
      console.log(e)
    })
  }

  async resetWallet () {
    // SECURITY: This is descrutive removal of all user account data and keystores
    // TODO: Add a second 'confirmResetWallet()' method ?
    console.log('error first off?')
    try {
      this.lock() // this is to flag for app security
      console.log('removing user data...')
      await this.UserAccount.removeAll()
      console.log('removed user account!')
      await this.UserTransactions.removeAll()
      console.log('removed user transactions!')
      await this.TokenData.removeAll()
      console.log('removed token data!')
      await this.UserAssets.removeAll()
      console.log('removed asset data!')
      // await MarketData.remove({})
      await window.localStorage.removeItem("binance_keystore"); // vault
      console.log('removed vault!')
      // await localforage.clear(); // persistant store
      return true
    } catch (error) {
      throw Error(error.message)
    }
  }

  async transferFunds (sender, recipient, amount, asset, password) {
    const userAccount = await this.UserAccount.findOne()

    try {
      let keystore = window.localStorage.getItem("binance_keystore")

      let privateKey = await BNB.sdk.crypto.getPrivateKeyFromKeyStore(keystore, password)
      password = null // SECURITY: unset
      await BNB.bnbClient.setPrivateKey(privateKey, true)
      privateKey = null // SECURITY: unset

      this.emit('transfer','Sending funds')

      BNB.transfer(sender, recipient, amount, asset).then((e) => {
        return true
      }).catch((e) => {
        console.log(e.message);

        if (e.message.includes("insufficient fund")) { // this is how insufficient fees return
          if (e.message.includes("fee needed")) {
            const res = e.message.split("but")[1].trim().split(" ")[0]
            const amount = res.substring(0, res.length - 3)
            const num = parseInt(amount)
            // TODO: Add to form validation, get the fee schedule ahead of actually accessing client
            const fee = BNB.calculateFee(num)
            throw Error('Insufficient fee funds: ' + fee + ' (BNB) required')
          } else {
            // What other errors are there?
          }

        } else if (e.message.includes("<")) { // this is how insuficient funds return
          throw Error('Insufficient funds')
        } else {
          throw Error(e)
        }

      })

    } catch (error) {
      throw Error(error)
    }

  }

  async vaultFreezeFunds (amount, asset, password) {
    const userAccount = await this.UserAccount.findOne()
    try {
      const privateKey = await crypto.getPrivateKeyFromKeyStore( userAccount.keystore, password)
      await BNB.bnbClient.setPrivateKey(privateKey)
      await BNB.bnbTokens.freeze(userAccount.address, asset, amount)
      // TODO: private key should be unset
      // This will be addressed with new Binance lib.
    } catch (e) {
      if (e.message.includes("insufficient fund")) {
        let msg
        if (e.message.includes("fee needed")) {
          // get the amount.
          const res = e.message.split("but")[1].trim().split(" ")[0]
          // const res2 = res.split(" ")
          const amount = res.substring(0, res.length - 3)
          const num = parseInt(amount)
          const fee = BNB.calculateFee(num)

          msg = "Insufficient fee funds: " + fee + " (BNB) required"
        } else {
          msg = "Error freezing funds"
        }
        throw Error(msg)

      } else if (e.message.includes("<")) { // this is how insuficient funds come back
        const res = e.message.split(",").find(f => { return f.includes("<")} )
        throw Error("Insufficient funds");
      }
      throw Error(e)
    }

  }
  async vaultUnfreezeFunds (amount, asset, password) {
    const userAccount = await this.UserAccount.findOne()
    try {
      const privateKey = await crypto.getPrivateKeyFromKeyStore( userAccount.keystore, password)
      await BNB.bnbClient.setPrivateKey(privateKey)
      await BNB.bnbTokens.unfreeze(userAccount.address, asset, amount)

    } catch (e) {
      if (e.message.includes("insufficient fund")) {
        let msg
        if (e.message.includes("fee needed")) {
          // get the amount.
          const res = e.message.split("but")[1].trim().split(" ")[0]
          // const res2 = res.split(" ")
          const amount = res.substring(0, res.length - 3)
          const num = parseInt(amount)
          const fee = BNB.calculateFee(num)

          msg = "Insufficient fee funds: " + fee + " (BNB) required"
        } else {
          msg = "Error freezing funds"
        }
        throw Error(msg)

      } else if (e.message.includes("<")) { // this is how insuficient funds come back
        const res = e.message.split(",").find(f => { return f.includes("<")} )
        // TODO: Handle all errors
        throw Error("Insufficient funds");
      }
      throw Error(e)
    }
  }



}
