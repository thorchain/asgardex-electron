import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Обменять',
  'swap.state.success': 'Обмен совершён',
  'swap.state.error': 'Swap error - RU',
  'swap.input': 'Отдаете',
  'swap.balance': 'Баланс',
  'swap.output': 'Получаете',
  'swap.drag': 'Перетащите для обмена',
  'swap.searchAsset': 'Поиск Ассета',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Комиссия транзакции {fee} дожна покрываться вашим балансом (сейчас {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Исходящая комиссия {fee} должна покрываться получаемым количеством (сейчас {amount}).',
  'swap.note.lockedWallet': 'You need to unlock your wallet to swap - RU',
  'swap.note.nowallet': 'Create or import a wallet to swap - RU'
}

export default swap
