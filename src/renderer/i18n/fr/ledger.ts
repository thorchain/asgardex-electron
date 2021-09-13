import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.add.device': 'Ajoutez votre ledger',
  'ledger.error.nodevice': 'Aucun périphérique connecté',
  'ledger.error.inuse': 'Le périphérique est utilisé dans une autre application',
  'ledger.error.appnotopened': 'Ledger app is not opened - FR',
  'ledger.error.noapp':
    "Aucune application Ledger ouverte. Veuillez ouvrir l'application appropriée sur le périphérique.",
  'ledger.error.getaddressfailed': 'Getting address from Ledger failed - FR',
  'ledger.error.signfailed': 'Signing transaction by Ledger failed - FR',
  'ledger.error.sendfailed': 'Sending transaction by Ledger failed - FR',
  'ledger.error.depositfailed': 'Sending deposit transaction by Ledger failed - FR',
  'ledger.error.invalidpubkey': 'Invalid public key for using Ledger. - FR',
  'ledger.error.invaliddata': 'Invalid data. - FR',
  'ledger.error.invalidresponse': 'Invalid response after sending transaction using Ledger. - FR',
  'ledger.error.rejected': 'Action on Ledger was rejected. - FR',
  'ledger.error.timeout': 'Timeout to handle action on Ledger. - FR',
  'ledger.error.notimplemented': 'Action has not been implemented for Ledger. - FR',
  'ledger.error.denied': 'Vous avez refusé la demande',
  'ledger.error.unknown': 'Erreur inconnue'
}

export default ledger
