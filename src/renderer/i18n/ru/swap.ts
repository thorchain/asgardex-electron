import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Обменять',
  'swap.state.success': 'Обмен совершён',
  'swap.state.error': 'Ошибка при обмене',
  'swap.input': 'Отдаете',
  'swap.output': 'Получаете',
  'swap.recipient': 'Recipient - RU',
  'swap.info.max.fee': 'Total asset balance substracted by estimated swap fees - RU',
  'swap.slip.title': 'Проскальзывание',
  'swap.slip.tolerance': 'Допуск по проскальзыванию',
  'swap.slip.tolerance.info':
    'The higher the percentage, the more slippage you will accept. More slippage includes also a wider range for covering estimated fees to avoid aborted swaps. - RU',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Комиссия транзакции {fee} дожна покрываться вашим балансом (сейчас {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Исходящая комиссия {fee} должна покрываться получаемым количеством (сейчас {amount}).',
  'swap.note.lockedWallet': 'Для обмена необходимо разблокировать кошелек',
  'swap.note.nowallet': 'Для обмена создайте или импортируйте кошелек',
  'swap.errors.asset.missingSourceAsset': 'Исходный ассет не поддерживается',
  'swap.errors.asset.missingTargetAsset': 'Конечный ассет не поддерживается',
  'swap.ledger.sign': 'Click next to sign the swap transaction on your device. - RU'
}

export default swap
