import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Обменять',
  'swap.state.success': 'Обмен совершён',
  'swap.state.error': 'Ошибка при обмене',
  'swap.input': 'Отдаете',
  'swap.output': 'Получаете',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Комиссия транзакции {fee} дожна покрываться вашим балансом (сейчас {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Исходящая комиссия {fee} должна покрываться получаемым количеством (сейчас {amount}).',
  'swap.note.lockedWallet': 'Для обмена необходимо разблокировать кошелек',
  'swap.note.nowallet': 'Для обмена создайте или импортируйте кошелек',
  'swap.errors.asset.missingSourceAsset': 'Исходный ассет не поддерживается',
  'swap.errors.asset.missingTargetAsset': 'Конечный ассет не поддерживается'
}

export default swap
