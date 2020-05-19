import { TransferEvent, TransferEventData } from '@thorchain/asgardex-binance'

import { envOrDefault } from '../helpers/envHelper'

import { webSocket } from 'rxjs/webSocket'
import { map, tap } from 'rxjs/operators'

const BINANCE_TESTNET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI,
  'wss://testnet-dex.binance.org/api/ws'
)

export const BINANCE_MAINET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_MAINNET_WS_URI,
  'wss://dex.binance.org/api/ws'
)

// TODO (@Veado) Extract following stuff into `AppContext` or so...
enum Net {
  TEST = 'testent',
  MAIN = 'mainnet'
}

const currentNet = Net.TEST

// #END TODO

const getEndpoint = (net: Net) => {
  switch (net) {
    case Net.MAIN:
      return BINANCE_MAINET_WS_URI
    // all other networks use testnet url for now
    default:
      return BINANCE_TESTNET_WS_URI
  }
}

/**
 * All types of incoming messages, which can be different
 */
type WSInMsg = TransferEvent | TickersEvent

const ws$ = webSocket<WSInMsg>(getEndpoint(currentNet))

/**
 * Observable for subscribing / unsubscribing transfers by given address
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 *
 * @param address Address to listen for transfers
 */
export const subscribeTransfers = (address: string) => {
  const msg = {
    topic: 'transfers',
    address
  }
  const subscribeMsg = JSON.stringify({
    method: 'subscribe',
    ...msg
  })
  const unSubscribeMsg = JSON.stringify({
    method: 'unsubscribe',
    ...msg
  })

  return ws$
    .multiplex(
      () => subscribeMsg,
      () => unSubscribeMsg,
      // filter out messages if data is not available
      (e) => (e as TickersEvent).data !== undefined
    )
    .pipe(
      tap((msg) => console.log('transfer msg', msg)),
      // Since we filtered messages before,
      // we know that data is available here, but it needs to be typed again
      map((event: TransferEvent) => event.data as TransferEventData)
    )
}

/**
 * JUST for DEBUGGING - we don't need such a <subscription
 *
 * Observable for subscribing / unsubscribing all tickers
 *
 * 24hr Ticker statistics for a all symbols are pushed every second.
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#9-all-symbols-ticker-streams
 */
export const subscribeTickers = () => {
  const msg = {
    topic: 'allTickers',
    symbols: ['$all']
  }
  const subscribeMsg = JSON.stringify({
    method: 'subscribe',
    ...msg
  })
  const unSubscribeMsg = JSON.stringify({
    method: 'unsubscribe',
    ...msg
  })

  return ws$
    .multiplex(
      () => subscribeMsg,
      () => unSubscribeMsg,
      // filter out messages if data is not available
      (e) => (e as TickersEvent).data !== undefined
    )
    .pipe(
      tap((ev) => console.log('tickers msg', ev)),
      // we know that data is available here, so type it again
      map((event: TickersEvent) => event.data as TickersEventData)
    )
}

type TickersEvent = {
  stream: string
  data?: TickersEventData
}

type TickersEventData = {
  e: string
  E: number
  s: string
  p: string
  P: string
  // ... and others
}
