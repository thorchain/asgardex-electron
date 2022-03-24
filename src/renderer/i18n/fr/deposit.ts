import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.interact.title': 'Dépôt',
  'deposit.interact.subtitle': 'Interagir avec THORChain',
  'deposit.interact.label.bondprovider': 'Bond provider (optional) - FR',
  'deposit.interact.actions.bond': 'Caution',
  'deposit.interact.actions.unbond': 'Retrait',
  'deposit.interact.actions.leave': 'Quitter',
  'deposit.share.title': 'Votre part dans la pool',
  'deposit.share.units': 'Unités de liquidité',
  'deposit.share.total': 'Valeur totale',
  'deposit.share.poolshare': 'Part dans la pool',
  'deposit.redemption.title': 'Valeur actuelle de remboursement',
  'deposit.totalEarnings': 'Vos revenus totaux de la pool',
  'deposit.add.asym': 'Ajouter {asset}',
  'deposit.add.sym': 'Ajouter',
  'deposit.add.state.sending': 'Envoi de la transaction de dépôt',
  'deposit.add.state.checkResults': 'Vérification du résultat du dépôt',
  'deposit.add.state.pending': 'Ajout de liquidité',
  'deposit.add.state.success': 'Dépôt réussi',
  'deposit.add.state.error': 'Erreur lors du dépôt',
  'deposit.add.error.chainFeeNotCovered':
    'Les frais nécessaires de {fee} ne sont pas couverts par votre solde : {balance}',
  'deposit.add.error.nobalances': 'Aucun solde',
  'deposit.add.error.nobalance1': "Vous n'avez pas de {asset} dans votre portefeuille pour le dépot.",
  'deposit.add.error.nobalance2': "Vous n'avez pas de {asset1} et de {asset2} dans votre portefeuille pour le dépot.",
  'deposit.add.pendingAssets.title': 'Actifs en attente trouvés',
  'deposit.add.pendingAssets.description':
    "Les actifs suivants ont été envoyés avec succès, mais la transaction de l'autre actif n'a pas été finalisée ou a échoué",
  'deposit.add.pendingAssets.recoveryDescription':
    "Remarque : les transactions d'une paire d'actifs peuvent prendre un temps différent en s'exécutant sur différentes blockchains. En cas d'échec, vous disposez d'un moyen de retirer les actifs en attente à l'aide de l'outil de récupération du site THORSWap à l'adresse {url}. Cette fonctionnalité n'est actuellement pas disponible avec ASGARDEX Dekstop.",
  'deposit.add.pendingAssets.recoveryTitle': "Ouvrir l'outil de récupération",
  'deposit.add.asymAssets.title': 'Dépôt asymétrique trouvé',
  'deposit.add.asymAssets.description':
    "L'ajout symétrique d'une paire d'actifs a été désactivé en raison d'un précédent dépôt asymétrique des actifs suivants :",
  'deposit.add.asymAssets.recoveryDescription':
    "Le dépôt asymétrique n'est actuellement pas pris en charge dans ASGARDEX Dekstop. Cependant, vous pouvez utiliser cette fonctionnalité dans THORSwap pour retirer un précédent dépôt asymétrique.",
  'deposit.add.asymAssets.recoveryTitle': 'THORSwap',
  'deposit.add.assetMissmatch.title': "Non-concordance d'actifs trouvée",
  'deposit.add.assetMissmatch.description':
    "L'un des actifs actuellement sélectionné a déjà été utilisé dans un dépôt précédent, mais avec un autre actif. Vérifiez les adresses suivantes pour voir la paire de dépôt précédente.",
  'deposit.bond.state.error': 'Erreur de caution',
  'deposit.unbond.state.error': 'Erreur de retrait',
  'deposit.leave.state.error': 'Erreur de sortie',
  'deposit.advancedMode': 'Mode avancé',
  'deposit.poolDetails.depth': 'Profondeur',
  'deposit.poolDetails.24hvol': 'Volume sur 24h',
  'deposit.poolDetails.allTimeVal': 'Volume historique',
  'deposit.poolDetails.totalSwaps': 'Total des échanges',
  'deposit.poolDetails.totalUsers': 'Total des utilisateurs',
  'deposit.poolDetails.volumeTotal': 'Volume (total)',
  'deposit.poolDetails.earnings': 'Gains',
  'deposit.poolDetails.ilpPaid': 'ILP payé',
  'deposit.poolDetails.totalTx': 'Txs (total)',
  'deposit.poolDetails.totalFees': 'Frais (total)',
  'deposit.poolDetails.members': 'Membres',
  'deposit.poolDetails.apy': 'APY',
  'deposit.wallet.add': 'Ajouter un portefeuille',
  'deposit.wallet.connect': 'Veuillez connecter votre portefeuille',
  'deposit.pool.noShares': 'Vous ne possédez aucune part dans cette pool',
  'deposit.withdraw.sym': 'Retirer',
  'deposit.withdraw.asym': 'Retrait {asset}',
  'deposit.withdraw.sym.title': 'Ajustez le retrait (symétrique)',
  'deposit.withdraw.asym.title': 'Ajustez le retrait (asymétrique)',
  'deposit.withdraw.pending': 'Retrait en cours',
  'deposit.withdraw.success': 'Retrait réussi',
  'deposit.withdraw.error': 'Erreur de retrait',
  'deposit.withdraw.choseText': 'Choisissez de 0 à 100% la part du retrait.',
  'deposit.withdraw.fees': 'Frais de transaction : {thorMemo}, Frais de retrait : {thorOut} + {assetOut}',
  'deposit.withdraw.feeNote':
    'Remarque: {fee} BNB seront laissés dans votre portefeuille pour les frais de transaction.',
  'deposit.withdraw.error.feeNotCovered':
    'Les frais de transaction {fee} doivent être couverts par votre solde (actuellement {balance}).',
  'deposit.withdraw.ledger.sign': 'Cliquez pour signer la transaction de retrait sur votre appareil.',
  'deposit.ledger.sign': 'Cliquez pour signer la transaction de dépôt sur votre appareil.'
}

export default deposit
