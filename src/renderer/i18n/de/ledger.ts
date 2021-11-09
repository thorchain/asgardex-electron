import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.title.sign': 'Unterzeichnen mit Ledger',
  'ledger.needsconnected': 'Stelle sicher, dass Dein Ledger verbunden und die "{chain}" Anwendung darauf geöffnet ist.',
  'ledger.add.device': 'Ledger hinzufügen',
  'ledger.error.nodevice': 'Kein Ledger verbunden',
  'ledger.error.inuse': 'Auf dem Ledger ist bereits eine App geöffnet',
  'ledger.error.noapp': 'Bitte öffne die App auf dem Ledger.',
  'ledger.error.appnotopened': 'Ledger Anwendung ist nicht geöffnet.',
  'ledger.error.getaddressfailed': 'Abfrage der Ledger Addresse schlug fehl.',
  'ledger.error.signfailed': 'Signierung der Transaktion mit dem Ledger schlug fehl.',
  'ledger.error.sendfailed': 'Versenden der Transaktion mit dem Ledger schlug fehl.',
  'ledger.error.depositfailed': 'Versendend der Deposit-Transaktion mit dem Ledger schlug fehl.',
  'ledger.error.invalidpubkey': 'Ungültiger Publik Key für den Ledger',
  'ledger.error.invaliddata': 'Ungültige Daten',
  'ledger.error.invalidresponse': 'Ungültige Antwort nach dem Versenden der Transaktion mit dem Ledger',
  'ledger.error.rejected': 'Die Aktion auf dem Ledger wurde abgelehnt',
  'ledger.error.timeout': 'Zeitüberschreitung zum Ausführen einer Aktion mit dem Ledger',
  'ledger.error.notimplemented': 'Aktion für den Ledger nicht implementiert',
  'ledger.error.denied': 'Die Benutzung des Ledgers wurde verweigert',
  'ledger.error.unknown': 'Unbekannter Fehler',
  'ledger.notsupported': 'Kein Ledger support für {chain}.',
  'ledger.notaddedorzerobalances': 'Ledger für {chain} ist nicht verbunden oder hat kein Guthaben.',
  'ledger.deposit.oneside': 'Ledger wird aktuell nur für eine Assetseite unterstützt.'
}

export default ledger
