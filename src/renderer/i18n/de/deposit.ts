import { DepositMessages } from '../types'

const deposit: DepositMessages = {
  'deposit.interact.title': 'Einzahlen',
  'deposit.interact.subtitle': 'Interagiere mit THORChain',
  'deposit.interact.label.bondprovider': 'Bond Provider (optional)',
  'deposit.interact.actions.bond': 'Bond',
  'deposit.interact.actions.unbond': 'Unbond',
  'deposit.interact.actions.leave': 'Verlassen',
  'deposit.share.title': 'Dein Poolanteil',
  'deposit.share.units': 'Liquiditäts-Einheiten',
  'deposit.share.poolshare': 'Poolanteil',
  'deposit.share.total': 'Gesamtwert',
  'deposit.redemption.title': 'Aktueller Rückkaufwert',
  'deposit.totalEarnings': 'Deine Gesamteinkommen vom Pool',
  'deposit.add.sym': 'hinzufügen',
  'deposit.add.asym': '{asset} hinzufügen',
  'deposit.add.runeSide': 'RUNE Seite',
  'deposit.add.assetSide': 'Asset Seite',
  'deposit.add.min.info': 'Erforderlicher Mindestwert um die Gebühren der Ein- und Auszahlungstransaktionen zu decken.',
  'deposit.add.max.info':
    'Der Maximalwert berechnet sich aus dem Gesamtguthaben ({balance}) und dem symmetrischen Verhältnis zur anderen Assetseite',
  'deposit.add.max.infoWithFee':
    'Der Maximalwert berechnet sich aus dem Gesamtguthaben ({balance}) abzüglich der voraussichtlichen Depositgebühr ({fee}) und dem symmetrischen Verhältnis zur anderen Assetseite',
  'deposit.add.state.sending': 'Sende Einzahlungs-Transaktion',
  'deposit.add.state.checkResults': 'Überprüfe Resultat der Einzahlung',
  'deposit.add.state.pending': 'Einzahlen',
  'deposit.add.state.success': 'Erfolgreich eingezahlt',
  'deposit.add.state.error': 'Error beim Einzahlen',
  'deposit.add.error.chainFeeNotCovered':
    'Gebühren in Höhe von {fee} sind nicht über Dein Guthaben gedeckt: {balance}.',
  'deposit.add.error.nobalances': 'Kein Guthaben',
  'deposit.add.error.nobalance1': 'Du verfügst über kein Guthaben, um {asset} hinzuzufügen.',
  'deposit.add.error.nobalance2': 'Du verfügst über keine Guthaben, um {asset1} und {asset2} hinzuzufügen.',
  'deposit.add.pendingAssets.title': 'Pending Assets gefunden',
  'deposit.add.pendingAssets.description':
    'Folgende Assets wurden erfolgreich überwiesen, jedoch als "Pending" markiert, da die Transaktion des anderen Assets noch aussteht.',
  'deposit.add.pendingAssets.recoveryDescription':
    'Bitte beachte: Die Transaktionen der Assetpaare können aufgrund unterschiedlicher Blockchains unterschiedliche Zeit benötigen. Falls die Transaktion eines der Assets fehlgeschlagen sein sollte, kannst Du die bereits eingezahlten, auf "Pending" gesetzten Assets, über das Recovery Tool von THORSwap unter {url} zurücküberweisen. Dieses Feature ist derzeit noch nicht in ASGARDEX Desktop verfügbar.',
  'deposit.add.pendingAssets.recoveryTitle': 'Öffne Recovery Tool',
  'deposit.add.asymAssets.title': 'Asymmetrisches Deposit gefunden',
  'deposit.add.asymAssets.description':
    'Das Hinzufügen eines Assetpaares in den Pool ist nicht möglich, da Du bereits folgende(s) Asset(s) asymmetrisch (einseitig) hinzugefügt hast:',
  'deposit.add.asymAssets.recoveryDescription':
    'Asymmetrisches (einseitiges) Hinzufügen von Assets ist aktuell in ASGARDEX Desktop noch nicht möglich. Aber Du hast die Möglichkeit, dieses Feature zwischenzeitlich in THORSwap zu nutzen, um die zuvor asymmetrisch hinzugefügten Assets zurückzuüberweisen',
  'deposit.add.asymAssets.recoveryTitle': 'THORSwap',
  'deposit.add.assetMissmatch.title': 'Asset Diskrepanz',
  'deposit.add.assetMissmatch.description':
    'Eines der beiden Assets wurde bereits bei einem vorangegangenen Deposit verwendet, jedoch zusammen mit einem anderen Asset. Überprüfe die folgenden Addressen um zu sehen, um welches Assetpaar es sich beim vorherigen Deposit handelt.',
  'deposit.bond.state.error': 'Bond Fehler',
  'deposit.unbond.state.error': 'Unbond Fehler',
  'deposit.leave.state.error': 'Fehler beim Verlassen',
  'deposit.advancedMode': 'Expertenmodus',
  'deposit.poolDetails.depth': 'Tiefe',
  'deposit.poolDetails.24hvol': '24h Volumen',
  'deposit.poolDetails.allTimeVal': 'Gesamtzeit Volumen',
  'deposit.poolDetails.totalSwaps': 'Gesamtanzahl Swaps',
  'deposit.poolDetails.totalUsers': 'Gesamtanzahl User',
  'deposit.poolDetails.volumeTotal': 'Volumen (Gesamt)',
  'deposit.poolDetails.earnings': 'Einnahmen',
  'deposit.poolDetails.ilpPaid': 'ILP Zahlungen',
  'deposit.poolDetails.totalTx': 'Transaktionen (Gesamt)',
  'deposit.poolDetails.totalFees': 'Gebühren (total)',
  'deposit.poolDetails.members': 'Mitglieder',
  'deposit.poolDetails.apy': 'APY',
  'deposit.wallet.add': 'Wallet hinzufügen',
  'deposit.wallet.connect': 'Bitte verbinde Deine Wallet',
  'deposit.pool.noShares': 'Du hast keine Anteile in diesem Pool',
  'deposit.withdraw.sym': 'auszahlen',
  'deposit.withdraw.asym': '{asset} auszahlen',
  'deposit.withdraw.sym.title': 'Auszahlung (symmetrisch) anpassen',
  'deposit.withdraw.asym.title': 'Auszahlung (asymmetrisch) anpassen',
  'deposit.withdraw.pending': 'Auszahlen',
  'deposit.withdraw.success': 'Erfolgreich ausgezahlt',
  'deposit.withdraw.error': 'Error beim Auszahlen',
  'deposit.withdraw.choseText': 'Wähle einen Betrag zwischen 0 und 100% zum Auszahlen',
  'deposit.withdraw.fees': 'Transaktionsgebühr: {thorMemo}, Auszahlungsgebühren: {thorOut} + {assetOut}',
  'deposit.withdraw.feeNote': 'Hinweis: {fee} werden für die Transaktionsgebühr in Deiner Wallet belassen',
  'deposit.withdraw.error.feeNotCovered':
    'Transaktionsgebühr in Höhe von {fee} ist nicht über Dein Guthaben {balance} gedeckt.',
  'deposit.ledger.sign': 'Klick "Weiter", um die Einzahlungstransaktion mit Deinem Ledger zu signieren.'
}

export default deposit
