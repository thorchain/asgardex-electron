import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.interact.title': 'Deposit - DE',
  'deposit.interact.subtitle': 'Interact with thorchain - DE',
  'deposit.interact.actions': 'Available actions - DE',
  'deposit.share.title': 'Dein Poolanteil',
  'deposit.share.units': 'Liquiditäts-Einheiten',
  'deposit.share.poolshare': 'Poolanteil',
  'deposit.share.total': 'Gesamtwert',
  'deposit.redemption.title': 'Aktueller Rückkaufwert',
  'deposit.totalEarnings': 'Deine Gesamteinkommen vom Pool',
  'deposit.add.asym': '{asset} hinzufügen',
  'deposit.add.sym': '{assetA} + {assetB} hinzufügen',
  'deposit.add.state.pending': 'Einzahlen',
  'deposit.add.state.success': 'Erfolgreich eingezahlt',
  'deposit.add.state.error': 'Error beim Einzahlen',
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
  'deposit.pool.noDeposit': 'Du hast keine Anteile in diesem Pool',
  'deposit.withdraw.title': 'Auszahlung anpassen',
  'deposit.withdraw.choseText': 'Wähle einen Betrag zwischen 0 und 100% zum Auszahlen',
  'deposit.withdraw.receiveText': 'Du solltest erhalten',
  'deposit.withdraw.fees': 'Transaktionsgebühr: {thorMemo}, Auszahlungsgebühren: {thorOut} + {assetOut}',
  'deposit.withdraw.feeNote': 'Hinweis: {fee} werden für die Transaktionsgebühr in Deiner Wallet belassen',
  'deposit.withdraw.drag': 'Ziehen um Auszuzahlen',
  'deposit.withdraw.add.error.thorMemoFeeNotCovered':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'deposit.withdraw.add.error.outFeeNotCovered':
    'Auszahlungsgebühr in Höhe von {fee} ist nicht über den zu erwartenen Auszahlungsbetrag (momentan {amount}) gedeckt'
}

export default deposit
