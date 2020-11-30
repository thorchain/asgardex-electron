import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.share.title': 'Dein Poolanteil',
  'deposit.share.units': 'Liquiditäts-Einheiten',
  'deposit.share.poolshare': 'Poolanteil',
  'deposit.share.total': 'Gesamtwert',
  'deposit.redemption.title': 'Aktueller Rückkaufwert',
  'deposit.totalEarnings': 'Deine Gesamteinkommen vom Pool',
  'deposit.add.asym': '{asset} hinzufügen',
  'deposit.add.sym': '{assetA} + {assetB} hinzufügen',
  'deposit.add.error.chainFeeNotCovered':
    'Gebühren in Höhe von {fee} sind nicht über Dein Guthaben gedeckt: {balance}.',
  'deposit.add.error.nobalances': 'Kein Guthaben',
  'deposit.add.error.nobalance1': 'Du verfügst über kein Guthaben, um {asset} hinzuzufügen.',
  'deposit.add.error.nobalance2': 'Du verfügst über keine Guthaben, um {asset1} und {asset2} hinzuzufügen.',
  'deposit.withdraw': 'Abheben',
  'deposit.advancedMode': 'Expertenmodus',
  'deposit.drag': 'Ziehen um Einzuzahlen',
  'deposit.poolDetails.depth': 'Tiefe',
  'deposit.poolDetails.24hvol': '24h Volumen',
  'deposit.poolDetails.allTimeVal': 'Gesamtzeit Volumen',
  'deposit.poolDetails.totalSwaps': 'Gesamtanzahl Swaps',
  'deposit.poolDetails.totalUsers': 'Gesamtanzahl User',
  'deposit.wallet.add': 'Wallet hinzufügen',
  'deposit.wallet.connect': 'Bitte verbinde Deine Wallet',
  'deposit.pool.noStakes': 'Du hast keine Anteile in diesem Pool',
  'deposit.withdraw.title': 'Auszahlung anpassen',
  'deposit.withdraw.choseText': 'Wähle einen Betrag zwischen 0 und 100% zum Auszahlen',
  'deposit.withdraw.receiveText': 'Du solltest erhalten',
  'deposit.withdraw.fee': 'Gebühren',
  'deposit.withdraw.feeNote': 'Hinweis: {fee} werden für die Transaktionsgebühr in Deiner Wallet belassen',
  'deposit.withdraw.drag': 'Ziehen um Auszuzahlen'
}

export default deposit
