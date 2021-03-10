import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Tauschen',
  'swap.state.error': 'Tausch error',
  'swap.state.success': 'Erfolgreich getauscht',
  'swap.input': 'Eingabe',
  'swap.balance': 'Guthaben',
  'swap.output': 'Ausgabe',
  'swap.drag': 'Ziehen um zu Tauschen',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Auszahlungsgebühr in Höhe von {fee} ist nicht über den zu erwartenen Auszahlungsbetrag (momentan {amount}) gedeckt',
  'swap.note.lockedWallet': 'Entsperre Deine Wallet um zu Tauschen',
  'swap.note.nowallet': 'Erstelle oder importiere eine Wallet um zu Tauschen',
  'swap.errors.asset.missingSourceAsset': 'Ursprungs-Asset nicht vorhanden',
  'swap.errors.asset.missingTargetAsset': 'Ziel-Asset nicht vorhanden',
  'swap.approve': 'bewilligen'
}

export default swap
