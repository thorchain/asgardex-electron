import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.swapping': 'Обменять',
  'swap.state.success': 'Обмен совершён',
  'swap.input': 'Отдаете',
  'swap.balance': 'Баланс',
  'swap.output': 'Получаете',
  'swap.drag': 'Перетащите для обмена',
  'swap.searchAsset': 'Поиск Ассета',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Комиссия транзакции {fee} дожна покрываться вашим балансом (сейчас {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Исходящая комиссия {fee} должна покрываться получаемым количеством (сейчас {amount}).'
}

export default swap
