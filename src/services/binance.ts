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
type WSInMsg = TransferEvent | MiniTickersEvent

const ws$ = webSocket<WSInMsg>(getEndpoint(currentNet))

/**
 * Observable for subscribing / unsubscribing transfers by given address
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 *
 * Note: No need to serialize / deserialize messages.
 * By default `WebSocketSubjectConfig` is going to apply `JSON.parse` to each message comming from the Server.
 * and applies `JSON.stringify` by default to messages sending to the server.
 * @see https://rxjs-dev.firebaseapp.com/api/webSocket/WebSocketSubjectConfig#properties
 *
 * @param address Address to listen for transfers
 */
export const subscribeTransfers = (address: string) => {
  const msg = {
    topic: 'transfers',
    address
  }
  return ws$
    .multiplex(
      // By default deserializer is going to apply JSON.parse to each message comming from the Server.
      () => ({
        method: 'subscribe',
        ...msg
      }),
      () => ({
        method: 'unsubscribe',
        ...msg
      }),
      // filter out messages if data is not available
      (e) => (e as TransferEvent).data !== undefined
    )
    .pipe(
      tap((msg) => console.log('transfer msg', msg)),
      // Since we filtered messages before,
      // we know that data is available here, but it needs to be typed again
      map((event: TransferEvent) => event.data as TransferEventData)
    )
}

/**
 * JUST for DEBUGGING - we don't need a subscription of 'allTickers'
 *
 * Observable for subscribing / unsubscribing all tickers
 *
 * 24hr Ticker statistics for a all symbols are pushed every second.
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#11-all-symbols-mini-ticker-streams
 */

const allMiniTickersMsg = {
  topic: 'allMiniTickers',
  symbols: ['$all']
}

export const miniTickers$ = ws$
  .multiplex(
    () => ({
      method: 'subscribe',
      ...allMiniTickersMsg
    }),
    () => ({
      method: 'unsubscribe',
      ...allMiniTickersMsg
    }),
    // filter out messages if data is not available
    (e) => (e as MiniTickersEvent).data !== undefined
  )
  .pipe(
    tap((ev) => console.log('mini tickers msg', ev)),
    // Since we filtered out messages before,
    // we know that data is available here,
    // but we have to do a type cast again
    map((event: MiniTickersEvent) => event?.data as MiniTickersEventData[])
  )

type MiniTickersEvent = {
  stream: string
  data?: MiniTickersEventData[]
}

export type MiniTickersEventData = {
  // Event type
  e: string
  // Event time
  E: number
  // Symbol
  s: string
  // Current day's close price
  c: string
  // Open price
  o: string
  // High price
  h: string
  // Low price
  l: string
  // Total traded base asset volume
  v: string
  // Total traded quote asset volume
  q: string
}
