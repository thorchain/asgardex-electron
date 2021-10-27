import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.title.sign': 'Signing with Ledger - RU',
  'ledger.needsconnected':
    'Make sure you your Ledger device is connected and the "{chain}" application is up and running. - RU',
  'ledger.add.device': 'Добавить Ledger',
  'ledger.error.nodevice': 'Нет подключенных устройств',
  'ledger.error.inuse': 'Это устройство используется в другом приложении',
  'ledger.error.appnotopened': 'Ledger приложение не открыто',
  'ledger.error.noapp':
    'Нет открытых Ledger приложений. Пожалуйста, откройте соответствующее приложение на дустрйостве',
  'ledger.error.getaddressfailed': 'Добавка адреса из Ledger не удалась',
  'ledger.error.signfailed': 'Подписка транзакции с помощью Ledger не удалась',
  'ledger.error.sendfailed': 'Отправка транзакции с помощью Ledger не удалась',
  'ledger.error.depositfailed': 'Отправка транзакции депозита с помощью Ledger не удалась',
  'ledger.error.invalidpubkey': 'Недействительный открытый ключ для использования Ledger.',
  'ledger.error.invaliddata': 'Неверные данные',
  'ledger.error.invalidresponse': 'Неверный ответ после отправки транзакции с помощью Ledger',
  'ledger.error.rejected': 'Действие на Ledger было отменено',
  'ledger.error.timeout': 'Тайм-аут для обработки действия на Ledger',
  'ledger.error.notimplemented': 'Действие не было выполнено с Ledger.',
  'ledger.error.denied': 'Вы отклонили запрос',
  'ledger.error.unknown': 'Неизвестная ошибка'
}

export default ledger
