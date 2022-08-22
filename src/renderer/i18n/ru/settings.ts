import { SettingMessages } from '../types'

const settings: SettingMessages = {
  'setting.app.title': 'Глобальные настройки',
  'setting.wallet.title': 'Настройки кошелька',
  'setting.wallet.management': 'Управление кошельком',
  'setting.multiwallet.management': 'Управление мульти-кошельками',
  'setting.client': 'Клиент',
  'setting.accounts': 'Учётные записи',
  'setting.export': 'Экспортировать Keystore',
  'setting.lock': 'Заблокировать',
  'setting.view.phrase': 'Показать секретную фразу',
  'setting.language': 'Язык',
  'setting.version': 'Версия',
  'setting.connected': 'Подключён',
  'setting.notconnected': 'Нет соединения',
  'setting.add.device': 'Добавить устройство',
  'setting.wallet.index': 'Индекс',
  'setting.wallet.index.info': 'Введите индекс Ledger адреса, который вы хотите использовать',
  'setting.wallet.hdpath.legacy.info': 'Устаревший путь деривации {path}',
  'setting.wallet.hdpath.ledgerlive.info': 'Путь деривации Ledger Live {path}',
  'setting.thornode.node.error.unhealthy': 'THORNode API seems to be unhealthy by checking "{endpoint} - RU"',
  'setting.thornode.node.error.url': 'Invalid THORNode API URL. Please double check and try again - RU',
  'setting.thornode.rpc.error.url': 'Invalid THORNode RPC URL. Please double check and try again - RU',
  'setting.thornode.rpc.error.unhealthy': 'THORNode RPC seems to be unhealthy by checking "{endpoint}" - RU',
  'setting.thornode.node.valid': 'Valid THORNode API URL - RU',
  'setting.thornode.rpc.valid': 'Valid THORNode RPC URL - RU'
}

export default settings
