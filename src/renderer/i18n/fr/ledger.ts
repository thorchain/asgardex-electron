import { LedgerMessages } from '../types'

const ledger: LedgerMessages = {
  'ledger.title': 'Ledger',
  'ledger.title.sign': 'Signature avec Ledger',
  'ledger.needsconnected':
    "Assurez-vous que votre appareil Ledger est connecté et que l'application {chain} est opérationnelle.",
  'ledger.add.device': 'Ajoutez votre ledger',
  'ledger.error.nodevice': 'Aucun périphérique connecté',
  'ledger.error.inuse': 'Le périphérique est utilisé dans une autre application',
  'ledger.error.appnotopened': "L'application Ledger n'est pas ouverte",
  'ledger.error.noapp':
    "Aucune application Ledger ouverte. Veuillez ouvrir l'application appropriée sur le périphérique.",
  'ledger.error.getaddressfailed': "Echec lors de l'obtention de l'adresse depuis Ledger",
  'ledger.error.signfailed': 'Echec de signature de la transaction par Ledger',
  'ledger.error.sendfailed': "Echec d'envoi de la transaction par Ledger",
  'ledger.error.depositfailed': "Echec d'envoi de la transaction de dépôt par Ledger",
  'ledger.error.invalidpubkey': 'clé publique non valide pour une utilisation par Ledger',
  'ledger.error.invaliddata': 'Donnée invalide',
  'ledger.error.invalidresponse': "Réponse non valide après l'envoi de la transaction en utilisant Ledger",
  'ledger.error.rejected': "L'action sur Ledger a été rejetée",
  'ledger.error.timeout': "Dépassement du délai pour gérer l'action sur Ledger",
  'ledger.error.notimplemented': "L'action n'a pas été implémentée pour Ledger",
  'ledger.error.denied': 'Vous avez refusé la demande',
  'ledger.error.unknown': 'Erreur inconnue',
  'ledger.notsupported': 'Pas de prise en charge de Ledger pour {chain}.',
  'ledger.notaddedorzerobalances': "La chaîne {chaîne} n'a pas été connectée sur Ledger ou n'a aucun solde.",
  'ledger.deposit.oneside': "Actuellement, Ledger ne prend en charge un actif que d'un seul côté.",
  'ledger.legacyformat.note': 'Ledger displays all output addresses in "legacy", but not in "CashAddr" format. - FR',
  'ledger.legacyformat.show': 'Show addresses - FR',
  'ledger.legacyformat.hide': 'Hide addresses - FR'
}

export default ledger
