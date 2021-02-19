import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.interact.title': 'Dépôt',
  'deposit.interact.subtitle': 'Interagir avec THORChain',
  'deposit.interact.actions': 'Actions disponibles',
  'deposit.interact.actions.bond': 'Caution',
  'deposit.interact.actions.unbond': 'Retrait',
  'deposit.interact.actions.leave': 'Quitter',
  'deposit.interact.actions.custom': 'Personnaliser',
  'deposit.share.title': 'Votre part dans la pool',
  'deposit.share.units': 'Unités de liquidité',
  'deposit.share.total': 'Valeur totale',
  'deposit.share.poolshare': 'Part dans la pool',
  'deposit.redemption.title': 'Valeur actuelle de remboursement',
  'deposit.totalEarnings': 'Vos revenus totaux de la pool',
  'deposit.add.asym': 'Ajouter {asset}',
  'deposit.add.sym': 'Ajouter {assetA} + {assetB}',
  'deposit.add.state.sending': 'Envoi de la transaction de dépôt',
  'deposit.add.state.checkResults': 'Vérification du résultat du dépôt',
  'deposit.add.state.pending': 'Ajout de liquidité',
  'deposit.add.state.success': 'Dépôt réussi',
  'deposit.add.state.error': 'Erreur lors du dépôt',
  'deposit.add.error.chainFeeNotCovered': 'Les frais nécessaires de {fee} ne sont pas couverts par votre solde : {balance}',
  'deposit.add.error.nobalances': 'Aucun solde',
  'deposit.add.error.nobalance1': "Vous n'avez pas de {asset} à déposer dans votre wallet.",
  'deposit.add.error.nobalance2': "Vous n'avez pas de {asset1} et de {asset2} à déposer dans votre wallet.",
  'deposit.bond.state.error': 'Erreur de caution',
  'deposit.unbond.state.error': 'Erreur de retrait',
  'deposit.leave.state.error': 'Erreur de sortie',
  'deposit.withdraw': 'Récupérer',
  'deposit.advancedMode': 'Mode avancé',
  'deposit.drag': 'Glisser pour déposer',
  'deposit.poolDetails.depth': 'Profondeur',
  'deposit.poolDetails.24hvol': 'Volume sur 24h',
  'deposit.poolDetails.allTimeVal': 'Volume historique',
  'deposit.poolDetails.totalSwaps': 'Total des échanges',
  'deposit.poolDetails.totalUsers': 'Total des utilisateurs',
  'deposit.wallet.add': 'Ajouter un wallet',
  'deposit.wallet.connect': 'Veuillez connecter votre wallet',
  'deposit.pool.noDeposit': "Vous ne possédez aucune part dans cette pool",
  'deposit.withdraw.pending': 'Retirer',
  'deposit.withdraw.success': 'Retrait réussi',
  'deposit.withdraw.error': 'Erreur de retrait',
  'deposit.withdraw.title': 'Ajuster le retrait',
  'deposit.withdraw.choseText': 'Choisissez de 0 à 100% la part du retrait.',
  'deposit.withdraw.receiveText': 'Vous devriez recevoir.',
  'deposit.withdraw.fees': 'Frais de transaction : {thorMemo}, Frais de retrait : {thorOut} + {assetOut}',
  'deposit.withdraw.feeNote': 'Remarque: {fee} BNB seront laissés dans votre wallet pour les frais de transaction.',
  'deposit.withdraw.drag': 'Glisser pour retirer',
  'deposit.withdraw.error.feeNotCovered':
    'Les frais de transaction {fee} doivent être couverts par votre solde (actuellement {balance}).'
}

export default deposit
