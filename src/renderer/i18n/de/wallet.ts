import { WalletMessages } from '../types'

const wallet: WalletMessages = {
  'wallet.nav.stakes': 'Stakes',
  'wallet.nav.bonds': 'Bonds',
  'wallet.column.name': 'Name',
  'wallet.column.ticker': 'Ticker',
  'wallet.column.balance': 'Saldo',
  'wallet.column.value': 'Wert',
  'wallet.action.send': 'Senden',
  'wallet.action.receive': 'Empfangen',
  'wallet.action.freeze': 'Einfrieren',
  'wallet.action.unfreeze': 'Freigeben',
  'wallet.action.remove': 'Wallet entfernen',
  'wallet.action.unlock': 'Entsperren',
  'wallet.action.import': 'Importieren',
  'wallet.action.create': 'Erstellen',
  'wallet.action.connect': 'Verbinden',
  'wallet.connect.instruction': 'Bitte verbinde Deine Wallet',
  'wallet.unlock.title': 'Wallet entsperren',
  'wallet.unlock.instruction': 'Bitte entsperre Deine Wallet',
  'wallet.unlock.phrase': 'Bitte gebe Deine Phrase ein',
  'wallet.unlock.error':
    'Die Wallet konnte nicht entsperrt werden. Bitte überprüfe Dein Passwort und versuche es noch einmal',
  'wallet.imports.phrase': 'Phrase',
  'wallet.imports.wallet': 'Importiere eine bestehende Wallet',
  'wallet.imports.enterphrase': 'Phrase eingeben',
  'wallet.txs.last90days': 'Transaktionen der vergangenen 90 Tage',
  'wallet.empty.phrase.import': 'Importiere eine bestehende Wallet mit Guthaben',
  'wallet.empty.phrase.create': 'Erstelle eine neue Wallet und füge ein Guthaben hinzu',
  'wallet.create.copy.phrase': 'Phrase kopieren',
  'wallet.create.title': 'Erstelle eine Wallet',
  'wallet.create.enter.phrase': 'Gebe die Phrase richtig ein',
  'wallet.create.words.click': 'Klicke die Wörter in der richtigen Reihenfolge',
  'wallet.create.creating': 'Erstelle eine Wallet ...',
  'wallet.create.password.repeat': 'Passwort wiederholen',
  'wallet.create.password.mismatch': 'Passwort stimmit nicht überein',
  'wallet.create.error': 'Fehler beim Abspeichern der Phrase',
  'wallet.receive.address.error': 'Keine Addresse für den Empfang vorhanden',
  'wallet.receive.address.errorQR': 'Error beim Rendern des QR Codes: {error}',
  'wallet.send.success': 'Transaktion war erfolgreich.',
  'wallet.send.fast': 'Schnell',
  'wallet.send.regular': 'Normal',
  'wallet.send.slow': 'Langsam',
  'wallet.errors.balancesFailed': 'Fehler beim Laden der Guthaben. {errorMsg} (API Id: {apiId})',
  'wallet.errors.address.empty': 'Keine Addresse angegeben',
  'wallet.errors.address.invalid': 'Addresse ist nicht valide',
  'wallet.errors.amount.shouldBeNumber': 'Der eingegebene Wert sollte eine Nummer sein',
  'wallet.errors.amount.shouldBeGreaterThan': 'Der eingegebene Betrag sollte höher als {amount} betragen',
  'wallet.errors.amount.shouldBeLessThanBalance': 'Der eingegebene Betrag sollte nicht höher als Dein Guthaben sein',
  'wallet.errors.amount.shouldBeLessThanFrozenBalance':
    'Der eingegebene Wert sollte nicht höher als Dein eingefrorenes Guthaben sein',
  'wallet.errors.amount.shouldBeLessThanBalanceAndFee':
    'Der eingegebene Wert sollte nicht höher als Dein Guthaben abzgl. Gebühren sein',
  'wallet.errors.fee.notCovered': 'Die Gebühren sind nicht über Dein Guthaben ({balance}) gedeckt',
  'wallet.errors.invalidChain': 'Invalide Chain: {chain}'
}

export default wallet
