import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Tauschen',
  'swap.state.error': 'Error beim Tauschen',
  'swap.state.success': 'Erfolgreich getauscht',
  'swap.input': 'Eingabe',
  'swap.output': 'Ausgabe',
  'swap.info.max.fee': 'Gesamtguthaben minus geschätzter Tauschgebühr',
  'swap.slip.title': 'Slip',
  'swap.slip.tolerance': 'Slippage-Toleranz',
  'swap.slip.tolerance.info':
    'Je höher die Prozentangabe, je höher akzeptierst Du ein Slippage. Mehr Slippage bedeutet zugleich ein größerer Spielraum zur Abdeckung der geschätzten Gebühren, um fehlgeschlagene Swaps zu vermeiden.',
  'swap.slip.tolerance.ledger-disabled.info':
    'Slippage-Toleranz ist deaktiviert aufgrund technischer Probleme mit Ledger.',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Auszahlungsgebühr in Höhe von {fee} ist nicht über den zu erwartenen Auszahlungsbetrag (momentan {amount}) gedeckt',
  'swap.note.lockedWallet': 'Entsperre Deine Wallet, um zu tauschen',
  'swap.note.nowallet': 'Erstelle oder importiere eine Wallet um zu Tauschen',
  'swap.errors.asset.missingSourceAsset': 'Ursprungs-Asset nicht vorhanden',
  'swap.errors.asset.missingTargetAsset': 'Ziel-Asset nicht vorhanden',
  'swap.min.amount.info':
    'Erforderlicher Mindestwert für ein Tausch um die Gebühren der Ein- und Auszahlungstransaktionen zu decken.',
  'swap.min.result.info':
    'Dein Tausch ist mit diesem Mindestwert basierend auf der ausgewählten {tolerance}% Slippage-Toleranz abgesichert. Falls eine Preisänderung vor der Transaktions-Bestätigung mehr als {tolerance}% zu Deinem Nachteil beträgt, wird Deine Tausch-Transaktion zurücküberwiesen.'
}

export default swap
