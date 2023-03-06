import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Échange en cours',
  'swap.state.success': 'Échange réussi',
  'swap.state.error': "Erreur lors de l'échange",
  'swap.input': 'Entrée',
  'swap.output': 'Sortie',
  'swap.info.max.balance': "Solde total de l'actif ({balance})",
  'swap.info.max.balanceMinusFee': "Solde total de l'actif ({balance}) moins les frais d'échange estimés ({fee})",
  'swap.slip.title': 'Slippage',
  'swap.slip.tolerance': 'Tolérance de slippage',
  'swap.slip.tolerance.info':
    "Plus le pourcentage est élevé, plus vous acceptez de slippage. Ceci inclus également un écart plus important pour couvrir les frais estimés, afin d'éviter les échanges avortés.",
  'swap.slip.tolerance.ledger-disabled.info':
    'La tolérance de slippage a été désactivée en raison de problèmes techniques avec Ledger.',
  'swap.errors.amount.balanceShouldCoverChainFee':
    '{fee} de frais de transaction doivent être couverts par votre solde (actuellement {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    '{fee} de frais de sortie doivent être couverts par la réception du montant (actuellement {amount}).',
  'swap.note.lockedWallet': 'Vous devez déverrouiller votre portefeuille pour échanger',
  'swap.note.nowallet': 'Créez ou importez un portefeuille pour échanger',
  'swap.errors.asset.missingSourceAsset': 'Actif source manquant',
  'swap.errors.asset.missingTargetAsset': 'Actif cible manquant',
  'swap.min.amount.info':
    'Valeur minimale à échanger pour couvrir tous les frais des transactions entrantes et sortantes.',
  'swap.min.result.info':
    "Votre échange est protégé par cette valeur minimale basée sur la tolérance de slippage de {tolerance} % sélectionnée. Dans le cas où le prix change défavorablement de plus de {tolerance} %, votre transaction d'échange sera annulée avant la confirmation.",
  'swap.min.result.protected': 'Résultat du swap protégé'
}

export default swap
