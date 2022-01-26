import { HaltMessages } from '../types'

const halt: HaltMessages = {
  'halt.thorchain': 'THORChain временно приостановлен.',
  'halt.trading': 'Торговля по всем пулам временно приостановлена.',
  'halt.chain': 'Торговля для цепи {chain} приостановлена.',
  'halt.chains': 'Торговля для цепей {chains} приостановлена.',
  'halt.chain.trading': 'Торговля {chains} временно приостановлена.',
  'halt.chain.pause': 'Операции с ликвидностью(добавление/вывод) для цепочки(ек) {chains} временно отключено.',
  'halt.chain.pauseall': 'Операции с ликвидностью(добавление/вывод) для всех цепочек временно отключено.',
  'halt.chain.upgrade': 'Улучшение для {chains} временно приостановлено для обслуживания.'
}

export default halt
