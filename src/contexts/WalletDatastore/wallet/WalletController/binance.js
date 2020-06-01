import axios from 'axios';
import bncClient from '@binance-chain/javascript-sdk';

export const binanceNetworks = {
  mainnet: {
    name: 'mainnet',
    chainId: 'Binance-Chain-Tigris',
    baseURL: 'https://dex.binance.org',
    explorerBaseURL: 'https://explorer.binance.org',
    addressPrefix: 'bnb'
  },
  testnet: {
    name: 'testnet',
    chainId: 'Binance-Chain-Nile',
    baseURL: 'https://testnet-dex.binance.org',
    explorerBaseURL: 'https://testnet-explorer.binance.org',
    addressPrefix: 'tbnb'
  }
}

const TokenManagement = bncClient;

class Binance {
  constructor() {
    // Defaults to testnet in case
    this.net = binanceNetworks.testnet
    this.sdk = bncClient
    this.baseURL = binanceNetworks.testnet.baseURL
    this.explorerBaseURL = binanceNetworks.testnet.explorerBaseURL
  }
  async setNetwork (network) {
    // check enum type?
    if (binanceNetworks[network]) {
      this.net = binanceNetworks[network]
      this.baseURL = this.net.baseURL
      this.explorerBaseURL = this.net.explorerBaseURL
      this.bnbClient = await new bncClient(this.baseURL)
      await this.bnbClient.chooseNetwork(this.net.name)
      await this.bnbClient.initChain()
      this.bnbTokens = await new TokenManagement(this.bnbClient).tokens;
      this.httpClient = await axios.create({
        baseURL: this.baseURL + '/api/v1',
        contentType: 'application/json',
      });
    } else {
      throw Error('Incorrect network name')
    }
  }

  useLedgerSigningDelegate (
    ledgerApp,
    preSignCb,
    postSignCb,
    errCb,
    hdPath,
  ) {
    return this.bnbClient.useLedgerSigningDelegate(
      ledgerApp,
      preSignCb,
      postSignCb,
      errCb,
      hdPath,
    );
  };

  clearPrivateKey () {
    this.bnbClient.privateKey = null;
  };

  getBinanceUrl () {
    return this.baseURL;
  };

  getPrefix () {
    return this.net.name === 'testnet' ? 'tbnb' : 'bnb';
  };

  isValidAddress (address) {
    return this.bnbClient.crypto.checkAddress(address, this.getPrefix());
  };

  txURL (tx) {
    return this.explorerBaseURL + '/tx/' + tx;
  };

  fees () {
    return this.httpClient.get('/fees');
  };
  async getFee (txType) {
    try {

      const res = await this.fees()
      const fee = res.data.find((item) => {
        return item.msg_type === txType
      })
      return fee.fee
    } catch (error) {
      throw Error(error)
    }
  }

  getTokens (options) {
    let query = "/tokens"
    if (options && options.limit) {
      query += "?limit=" + options.limit
      if (options.offset) {
        query += "&offset=" + options.offset
      }
    }
    return this.httpClient.get(query);
  }
  getTokenInfo (symbol) {
    const query = "/tokens?token=" + symbol
    return this.httpClient.get(query)
  }

  async setMarketRates (symbols) {
    const bnb = await axios.get(
      'https://api.cryptonator.com/api/ticker/bnb-usd',
    );

    /* ***************************** */
        let page = 1;
        let pairsFound = []
        const initialOffset = 0
        const limit = 1000
        while (pairsFound.length < symbols.length) {
          let request, options = {}
          options.offset = ((page -1) * limit) + initialOffset
          options.limit = limit

          try {
            let query = "/markets"
            if (options && options.limit) {
              query += "?limit=" + options.limit
              if (options.offset) {
                query += "&offset=" + options.offset
              }
            }
            request = await this.httpClient.get(query);

          } catch (error) {
            break
          }

          if (request && request.data && request.data.length > 0) {
            // Go through the pairs
            for (let i = 0; i < request.data.length; i++) {
              const e = request.data[i];

              // Check for a match to account assets
              const match = symbols.find(s => { return s === e.base_asset_symbol })
              if (match) {
                // TODO: Add check for price only in BNB
                // Below should be done on demand for UI, saving writes
                // e.price = (parseFloat(bnb.data.ticker.price) * parseFloat(symbol_data.list_price))
                // push unique only
                const repeat = pairsFound.find(p => { return p.base_asset_symbol === e.base_asset_symbol})

                if (!repeat) {
                  pairsFound.push(e)
                }
              }
              if (pairsFound.length === symbols.length) { break }

            }
            // Safeguard
            if (request.data.length < limit) {
              break
            }

          }
          page+=1
        } // end while()

        // MarketData.remove({})
        // MarketData.batchInsert(pairsFound)
    /* ***************************** */

  };

  // convert fee number into BNB tokens
  calculateFee (x) {
    return x / 100000000;
  };

  getBalances (address) {
    return this.bnbClient.getBalance(address);
  };

  getTransactions (address, options) {
    let query = '/transactions?address=' + address
    // TODO: Valid options not checked yet
    if (options) {
      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          const element = options[key];
          query += '&' + key + '=' + element
        }
      }
    }
    return this.httpClient.get(query)
  }

  getAccount (address) {
    return this.bnbClient.getAccount(address);
  };

  getMarkets (limit = 1000, offset = 0) {
    return this.bnbClient.getMarkets(limit, offset);
  };

  async multiSend (address, transactions, memo = '') {
    const result = await this.bnbClient.multiSend(address, transactions, memo);
    return result;
  };

  async transfer (fromAddress, toAddress, amount, asset, memo = '') {
    const result = await this.bnbClient.transfer(
      fromAddress,
      toAddress,
      amount,
      asset,
      memo,
    );

    return result;
  };


}

export default Binance;




