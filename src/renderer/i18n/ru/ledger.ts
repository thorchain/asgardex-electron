import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.add.device': 'Добавить Ledger',
  'ledger.error.nodevice': 'Нет подключенных устройств',
  'ledger.error.inuse': 'Это устройство используется в другом приложении',
  'ledger.error.appnotopened': 'Ledger app is not opened - RU',
  'ledger.error.noapp':
    'Нет открытых Ledger приложений. Пожалуйста, откройте соответствующее приложение на дустрйостве',
  'ledger.error.getaddressfailed': 'Getting address from Ledger failed - RU',
  'ledger.error.signfailed': 'Signing transaction by Ledger failed - RU',
  'ledger.error.sendfailed': 'Sending transaction by Ledger failed - RU',
  'ledger.error.depositfailed': 'Sending deposit transaction by Ledger failed - RU',
  'ledger.error.invalidpubkey': 'Invalid public key for using Ledger. - RU',
  'ledger.error.invaliddata': 'Invalid data. - RU',
  'ledger.error.invalidresponse': 'Invalid response after sending transaction using Ledger. - RU',
  'ledger.error.rejected': 'Action on Ledger was rejected. - RU',
  'ledger.error.timeout': 'Timeout to handle action on Ledger. - RU',
  'ledger.error.notimplemented': 'Action has not been implemented for Ledger. - RU',
  'ledger.error.denied': 'Вы отклонили запрос',
  'ledger.error.unknown': 'Неизвестная ошибка'
}

export default ledger
