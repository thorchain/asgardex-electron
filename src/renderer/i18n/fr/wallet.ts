import { WalletMessages } from '../types'

const wallet: WalletMessages = {
  'wallet.main.title': 'Principal',
  'wallet.nav.deposits': 'Dépots',
  'wallet.nav.bonds': 'Cautions',
  'wallet.nav.poolshares': 'Quote-part',
  'wallet.column.name': 'Nom',
  'wallet.column.ticker': 'Ticker',
  'wallet.action.send': 'Envoyer',
  'wallet.action.upgrade': 'Mise à jour',
  'wallet.action.receive': 'Recevoir du {asset}',
  'wallet.action.forget': 'Supprimer',
  'wallet.action.unlock': 'Déverrouiller',
  'wallet.action.connect': 'Connecter',
  'wallet.action.import': 'Importer',
  'wallet.action.create': 'Créer',
  'wallet.action.deposit': 'Déposer',
  'wallet.connect.instruction': 'Veuillez connecter votre portefeuille',
  'wallet.lock.label': 'Verrouiller le portefeuille',
  'wallet.unlock.label': 'Déverrouiller le portefeuille',
  'wallet.unlock.title': 'Déverrouiller votre portefeuille',
  'wallet.unlock.instruction': 'Veuillez déverrouiller votre portefeuille',
  'wallet.unlock.phrase': 'Entrez votre phrase de récupération',
  'wallet.unlock.error':
    'Impossible de déverrouiller le portefeuille. Veuillez vérifier votre mot de passe et réessayez',
  'wallet.imports.label': 'Importer le portefeuille',
  'wallet.imports.keystore.select': 'Sélectionner le fichier keystore',
  'wallet.imports.keystore.title': 'Choisir le fichier à uploader',
  'wallet.imports.phrase.title': 'Veuillez entrer la phrase de récupération avec un seul espace entre les mots',
  'wallet.imports.wallet': 'Importer un portefeuille existant',
  'wallet.imports.enterphrase': 'Entrez la phrase de récupération',
  'wallet.imports.error.instance': 'Impossible de créer une instance du Client',
  'wallet.imports.error.keystore.load': 'Clé privée incorrecte',
  'wallet.imports.error.keystore.import': 'Mot de passe incorrect',
  'wallet.phrase.error.valueRequired': 'La phrase de récupération est requise',
  'wallet.phrase.error.invalid': 'Phrase de récupération incorrecte',
  'wallet.phrase.error.import': "Erreur lors de l'importation de la phrase de récupération",
  'wallet.txs.history': 'Historique des transactions',
  'wallet.empty.phrase.import': 'Importez un portefeuille existant contenant des fonds',
  'wallet.empty.phrase.create': "Créez un nouveau portefeuille, et l'alimenter en fonds",
  'wallet.create.copy.phrase': 'Copiez la phrase ci-dessous',
  'wallet.create.title': 'Créer un nouveau portefeuille',
  'wallet.create.enter.phrase': 'Entrez la phrase correctement',
  'wallet.create.error.phrase': 'Sauvegardez votre phrase en toute sécurité et saisissez-la correctement',
  'wallet.create.words.click': 'Cliquez sur le mot dans le bon ordre',
  'wallet.create.creating': 'Création du portefeuille',
  'wallet.create.error': "Erreur lors de la sauvegarde d'une phrase",
  'wallet.receive.address.error': 'Aucune adresse disponible pour recevoir des fonds',
  'wallet.receive.address.errorQR': "Erreur lors de l'affichage du QR code : {error}",
  'wallet.remove.label': 'Supprimer le portefeuille',
  'wallet.remove.label.title': 'Êtes-vous sûr de vouloir supprimer votre portefeuille ?',
  'wallet.remove.label.description':
    'Vous ne pouvez pas annuler cette action et devrez recréer votre portefeuille à partir de votre phrase de récupération.',
  'wallet.send.success': 'Transaction réussie.',
  'wallet.send.error': 'Erreur de transaction.',
  'wallet.send.fastest': 'Très rapide',
  'wallet.send.fast': 'Rapide',
  'wallet.send.average': 'Normal',
  'wallet.send.max.doge':
    'Caclulated max. value based on estimated fees, which might be incorrect for DOGE from time to time. In case of an "Balance Insufficient for transaction" error message check https://blockchair.com/dogecoin/transactions to get an average of latest fees and try to deduct it from your balance before sending a transaction. - FR',
  'wallet.errors.balancesFailed': 'Échec lors du chargement des soldes. {errorMsg} (API Id: {apiId})',
  'wallet.errors.asset.notExist': 'Aucun {asset}',
  'wallet.errors.address.empty': "L'adresse ne peut être vide",
  'wallet.errors.address.invalid': "L'adresse est incorrecte",
  'wallet.errors.address.couldNotFind': "Impossible de trouver l'adresse de la pool {pool}",
  'wallet.errors.amount.shouldBeNumber': 'Le montant doit être un nombre',
  'wallet.errors.amount.shouldBeGreaterThan': 'Le montant doit être supérieur à {amount}',
  'wallet.errors.amount.shouldBeLessThanBalance': 'Le montant doit être inférieur à votre solde',
  'wallet.errors.amount.shouldBeLessThanBalanceAndFee': 'Le montant doit être inférieur à votre solde moins les frais',
  'wallet.errors.fee.notCovered': 'Les frais ne sont pas couverts par votre solde de ({balance})',
  'wallet.errors.invalidChain': 'Chaîne non valide : {chain}',
  'wallet.password.confirmation.title': 'Confirmation du mot de passe',
  'wallet.password.confirmation.description': 'Veuillez saisir le mot de passe de votre portefeuille.',
  'wallet.password.confirmation.pending': 'Validation du mot de passe',
  'wallet.password.confirmation.error': 'Le mot de passe est erroné',
  'wallet.password.repeat': 'Répétez le mot de passe',
  'wallet.password.mismatch': 'Non-concordance des mots de passe',
  'wallet.ledger.confirm': 'Click "next" to sign the transaction on your device. - FR',
  'wallet.upgrade.pending': 'Mise à jour',
  'wallet.upgrade.success': 'Mise à jour réussie',
  'wallet.upgrade.error': 'Échec de la mise à jour',
  'wallet.upgrade.error.data': "Données invalides pour l'actif {asset}",
  'wallet.upgrade.error.loadPoolAddress': 'l’adresse de la pool {pool} n’a pas pu être chargée',
  'wallet.upgrade.feeError': 'Les frais supplémentaires {fee} ne sont pas couverts par votre solde {balance}',
  'wallet.validations.lessThen': 'Devrait être inférieur à {value}',
  'wallet.validations.graterThen': 'Devrait être supérieur à {value}',
  'wallet.validations.shouldNotBeEmpty': 'Ne devrait pas être vide',
  'wallet.ledger.verifyAddress.modal.title': "Vérification de l'adresse Ledger",
  'wallet.ledger.verifyAddress.modal.description': "Vérifiez l'adresse {address} sur votre appareil"
}

export default wallet
