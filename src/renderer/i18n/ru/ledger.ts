import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.title.sign': 'Подписать с помощью Ledger',
  'ledger.needsconnected': 'Убедитесь, что ваш Ledger подключён и приложение "{chain}" запущено.',
  'ledger.add.device': 'Добавить Ledger',
  'ledger.error.nodevice': 'Нет подключенных устройств',
  'ledger.error.inuse': 'Это устройство используется в другом приложении',
  'ledger.error.appnotopened': 'Приложение Ledger не открыто',
  'ledger.error.noapp':
    'Нет открытых Ledger приложений. Пожалуйста, откройте соответствующее приложение на устрйостве.',
  'ledger.error.getaddressfailed': 'Добавление адреса из Ledger не удалось',
  'ledger.error.signfailed': 'Подпись транзакции с помощью Ledger не удалась',
  'ledger.error.sendfailed': 'Отправка транзакции с помощью Ledger не удалась',
  'ledger.error.depositfailed': 'Отправка транзакции добавления средств с помощью Ledger не удалась',
  'ledger.error.invalidpubkey': 'Недействительный открытый ключ для использования Ledger.',
  'ledger.error.invaliddata': 'Неверные данные.',
  'ledger.error.invalidresponse': 'Неверный ответ после отправки транзакции с помощью Ledger.',
  'ledger.error.rejected': 'Действие на Ledger было отменено.',
  'ledger.error.timeout': 'Тайм-аут для обработки действия на Ledger.',
  'ledger.error.notimplemented': 'Действие не было выполнено с Ledger.',
  'ledger.error.denied': 'Вы отклонили запрос Ledger',
  'ledger.error.unknown': 'Неизвестная ошибка',
  'ledger.notsupported': 'Ledger не поддерживает {chain}.',
  'ledger.notaddedorzerobalances': 'Ledger {chain} не была подключена или имеет нулевой баланс.',
  'ledger.deposit.oneside': 'Пока что Ledger поддерживается только для одностороннего добавления активов.',
  'ledger.legacyformat.note': 'Ledger displays all output addresses in "legacy", but not in "CashAddr" format. - RU',
  'ledger.legacyformat.show': 'Show addresses - RU',
  'ledger.legacyformat.hide': 'Hide addresses - RU'
}

export default ledger
