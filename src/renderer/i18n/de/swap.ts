import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Tauschen',
  'swap.state.error': 'Error beim Tauschen',
  'swap.state.success': 'Erfolgreich getauscht',
  'swap.input': 'Eingabe',
  'swap.output': 'Ausgabe',
  'swap.recipient': 'Empfänger',
  'swap.info.max.fee': 'Total asset balance substracted by estimated swap fees - DE',
  'swap.slip.title': 'Slip',
  'swap.slip.tolerance': 'Sliptoleranz',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Auszahlungsgebühr in Höhe von {fee} ist nicht über den zu erwartenen Auszahlungsbetrag (momentan {amount}) gedeckt',
  'swap.note.lockedWallet': 'Entsperre Deine Wallet, um zu tauschen',
  'swap.note.nowallet': 'Erstelle oder importiere eine Wallet um zu Tauschen',
  'swap.errors.asset.missingSourceAsset': 'Ursprungs-Asset nicht vorhanden',
  'swap.errors.asset.missingTargetAsset': 'Ziel-Asset nicht vorhanden'
}

export default swap
