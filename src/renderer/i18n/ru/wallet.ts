import { WalletMessages } from '../types'

const wallet: WalletMessages = {
  'wallet.main.title': 'Основной',
  'wallet.nav.deposits': 'Вклады',
  'wallet.nav.bonds': 'Бонды',
  'wallet.nav.poolshares': 'Доли',
  'wallet.column.name': 'Имя',
  'wallet.column.ticker': 'Тикер',
  'wallet.action.send': 'Отправить',
  'wallet.action.upgrade': 'Улучшить',
  'wallet.action.receive': 'Получить {asset}',
  'wallet.action.forget': 'Забыть',
  'wallet.action.unlock': 'Разблокировать',
  'wallet.action.import': 'Импортировать',
  'wallet.action.create': 'Создать',
  'wallet.action.connect': 'Подключить',
  'wallet.action.deposit': 'Вложить',
  'wallet.balance.total.poolAssets': 'Total balance of pool assets - RU',
  'wallet.balance.total.poolAssets.info':
    'Total balance includes balances of assets available in pools at THORChain only. Pools are source of truth to determine prices at THORChain. - RU',
  'wallet.shares.total': 'Total value - RU',
  'wallet.connect.instruction': 'Пожалуйста подключите ваш кошелек',
  'wallet.lock.label': 'Заблокировать кошелёк',
  'wallet.unlock.label': 'Разблокировать кошелёк',
  'wallet.unlock.title': 'Разблокировать ваш кошелек',
  'wallet.unlock.instruction': 'Пожалуйста разблокируйте ваш кошелек',
  'wallet.unlock.password': 'Введите ваш пароль',
  'wallet.unlock.error': 'Не получилось разблокировать кошелек. Пожалуйста, проверьте пароль и попробуйте еще раз',
  'wallet.imports.label': 'импортировать кошелёк',
  'wallet.imports.phrase.title': 'Пожалуйста, введите фразу вашего кошелька с одинарным пробелом между словами',
  'wallet.imports.wallet': 'Импортировать существующий кошелек',
  'wallet.imports.keystore.select': 'Выберите keystore файл',
  'wallet.imports.keystore.title': 'Выберите файл для загрузки',
  'wallet.imports.enterphrase': 'Введите фразу',
  'wallet.imports.error.instance': 'Не удалось создать экземпляр Клиента',
  'wallet.imports.error.keystore.load': 'Недопустимый Keystore',
  'wallet.imports.error.keystore.import': 'Неверный пароль',
  'wallet.phrase.error.valueRequired': 'Необходимо значение для фразы',
  'wallet.phrase.error.invalid': 'Неверная фраза',
  'wallet.phrase.error.import': 'Ошибка при импорте фразы',
  'wallet.txs.history': 'История переводов',
  'wallet.empty.phrase.import': 'Импортировать существующий кошелек с балансом',
  'wallet.empty.phrase.create': 'Создать новый кошелек с балансом',
  'wallet.create.copy.phrase': 'Скопируйте фразу ниже',
  'wallet.create.title': 'Создать новый кошелек',
  'wallet.create.enter.phrase': 'Введите фразу правильно',
  'wallet.create.error.phrase': 'Сохраните вашу фразу в надежном месте и введите ее в правильном порядке',
  'wallet.create.words.click': 'Выберите слова в правильном порядке',
  'wallet.create.creating': 'Создание кошелька',
  'wallet.create.error': 'Ошибка при сохранении фрразы',
  'wallet.receive.address.error': 'Нет доступных адресов для получения',
  'wallet.receive.address.errorQR': 'Ошибка при создании QR-кода: {error}',
  'wallet.remove.label': 'Забыть кошелек',
  'wallet.remove.label.title': 'Вы уверены, что хотите забыть кошелек?',
  'wallet.remove.label.description':
    'Для повторного создания кошелька вам потребуется указать свою фразу. Пожалуйста, убедитесь, что ваша фраза сохранена в надежном месте, прежде чем продолжить.',
  'wallet.send.success': 'Тразакция завершена.',
  'wallet.send.fastest': 'Наибыстро',
  'wallet.send.fast': 'Быстро',
  'wallet.send.average': 'Среднее',
  'wallet.send.max.doge':
    'Рассчитанное макс. значение основано на приблизительных комиссиях, которые могут быть иногда неточны для DOGE. В случае появления сообщения об ошибке "Недостаточно средств для проведения операции" проверьте https://blockchair.com/dogecoin/transactions, чтобы получить среднее значение последних сборов и вычесть его из баланса перед отправкой транзакции.',
  'wallet.errors.balancesFailed': 'Нет загруженных балансов. {errorMsg}',
  'wallet.errors.asset.notExist': 'Отсутсвует актив {asset}',
  'wallet.errors.address.empty': 'Адрес не может быть пустым',
  'wallet.errors.address.invalid': 'Адес недействителен',
  'wallet.errors.address.couldNotFind': 'Не удалось найти адрес для пула {pool}',
  'wallet.errors.amount.shouldBeNumber': 'Количество должно быть числом',
  'wallet.errors.amount.shouldBeGreaterThan': 'Количество должно быть больше, чем {amount}',
  'wallet.errors.amount.shouldBeGreaterOrEqualThan': 'Amount should be equal or greater than {amount} - RU',
  'wallet.errors.amount.shouldBeLessThanBalance': 'Количество должно быть меньше вашего баланса',
  'wallet.errors.amount.shouldBeLessThanBalanceAndFee':
    'Количество должно быть меньше, чем ваш баланс после вычета комиссии',
  'wallet.errors.fee.notCovered': 'Комиссия не покрывается вашим банаслом ({balance})',
  'wallet.errors.invalidChain': 'Неверная цепочка: {chain}',
  'wallet.errors.memo.max': "Length of memo can't be more than {max} - RU",
  'wallet.password.confirmation.title': 'Подтверждение пароля',
  'wallet.password.confirmation.description': 'пожалуйста введите свой пароль.',
  'wallet.password.confirmation.pending': 'Проверяю пароль',
  'wallet.password.confirmation.error': 'Неверный пароль',
  'wallet.password.repeat': 'Повторите пароль',
  'wallet.password.mismatch': 'Пароли не совпадают',
  'wallet.ledger.confirm': 'Нажмите "далее" что бы подписать транзакцию на вашем устройстве.',
  'wallet.send.error': 'Ошибка отправки',
  'wallet.upgrade.pending': 'Улучшаю',
  'wallet.upgrade.success': 'Успешно улучшено',
  'wallet.upgrade.error': 'Ошибка улучшения',
  'wallet.upgrade.error.data': 'Неверные данные актива {asset}',
  'wallet.upgrade.error.loadPoolAddress': 'Не получилось загрузить адрес для {pool} пула',
  'wallet.upgrade.feeError': 'Комиссия для улучшения {fee} не покрывается вашим балансом {balance}',
  'wallet.validations.lessThen': 'Должно быть меньше, чем {value}',
  'wallet.validations.graterThen': 'Должно быть больше, чем {value}',
  'wallet.validations.shouldNotBeEmpty': 'Не должно быть пустым',
  'wallet.ledger.verifyAddress.modal.title': 'Проверка адреса Ledger',
  'wallet.ledger.verifyAddress.modal.description': 'Проверьте адрес {address} на вашем устройстве'
}

export default wallet
