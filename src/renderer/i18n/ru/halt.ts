import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain временно приостановлен.',
  'halt.trading': 'Торговля по всем пулам временно приостановлена.',
  'halt.chain': 'Торговля для цепи {chain} приостановлена.',
  'halt.chains': 'Торговля для цепей {chains} приостановлена.',
  'halt.chain.trading': 'Торговля {chains} временно приостановлена.',
  'halt.chain.pause': 'Liquidity activities (add/remove) for {chains} chain(s) have been disabled temporarily - RU.',
  'halt.chain.pauseall': 'Liquidity activities (add/remove) for all chains have been disabled temporarily. - RU',
  'halt.chain.upgrade': 'Обновление для {chains} временно приостановлено для поддержки.'
}

export default halt
