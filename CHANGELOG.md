# 0.4.14 (2021-09-15)

## Add

- [Ledger] Support for Native RUNE to send transactions to another RUNE address and to interact with THORChain to send BOND, UNBOND, LEAVE or custom transactions [#1570](https://github.com/thorchain/asgardex-electron/issues/1570), [#1738](https://github.com/thorchain/asgardex-electron/issues/1738), [#1740](https://github.com/thorchain/asgardex-electron/issues/1740)

## Fix

. [Header] Rename Settings -> Global settings [#1733](https://github.com/thorchain/asgardex-electron/issues/1733)

- MAX button ends with Insufficient funds #1754 [#1754](https://github.com/thorchain/asgardex-electron/issues/1754)
- [AssetDetails] Fix position of ledger label in mobile view [#1747](https://github.com/thorchain/asgardex-electron/issues/1747)

## Internal

- Update npm dependencies [#1746](https://github.com/thorchain/asgardex-electron/issues/1746)
- Remove Drag component and and all of its dependencies [#1752](https://github.com/thorchain/asgardex-electron/issues/1752)
- [Midgard] Update to latest `Midgard@2.4.1` [#1725](https://github.com/thorchain/asgardex-electron/issues/1725)
- [ENV] Remove INFURA_PROJECT_SECRET [#1741](https://github.com/thorchain/asgardex-electron/issues/1741)

# 0.3.14 (2021-09-04)

## Add

- [Mimir] Support `HALT{chain}TRADING` flags for `BTC`, `LTC`, `BCH`, `BNB` [#1722](https://github.com/thorchain/asgardex-electron/issues/1722)
- [Mimir] Support `PAUSELP{chain}` flags for `BNB`, `BTC`, `BCH`, `ETH`, `LTC` [#1724](https://github.com/thorchain/asgardex-electron/issues/1724)

## Update

- Updated french translation (01-09-2021) [#1717](https://github.com/thorchain/asgardex-electron/pull/1717)

## Fix

. ETH.RUNE upgrade fails on testnet [#1730](https://github.com/thorchain/asgardex-electron/issues/1730)

- [UpgradeView] Fix rendering hook issues [#1707](https://github.com/thorchain/asgardex-electron/pull/1707)

## Internal

- Update to latest `xchainjs/xchain-binance@5.3.1` [#1725](https://github.com/thorchain/asgardex-electron/issues/1725)

# 0.3.13 (2021-08-28)

## Add

- [Settings] Split settings into application and wallet settings [1575](https://github.com/thorchain/asgardex-electron/issues/1575)

- [Swap] Allow swap to custom recipient [1683](https://github.com/thorchain/asgardex-electron/issues/1683)

- [Wallet] Tag fees in txs history of Rune Native [1698](https://github.com/thorchain/asgardex-electron/issues/1698)

## Fix

- [Pools] Fix `disableAllActions` helper [1675](https://github.com/thorchain/asgardex-electron/pull/1675)

- [Upgrade] Add upgrade warning for `BNB.RUNE` [1690](https://github.com/thorchain/asgardex-electron/issues/1690)

- [Swap] Don't send swap transactions to `BNB` accounts with flags > 0 [1611](https://github.com/thorchain/asgardex-electron/issues/1611)

## Internal

- Use consistent naming for styles files [1677](https://github.com/thorchain/asgardex-electron/issues/1677)

- SettingsView: Creation of `userAccounts` needs to be more DRY [417](https://github.com/thorchain/asgardex-electron/issues/417)

# 0.3.12 (2021-08-16)

## Add

- [mimir] Check `HALT{BCH|BNB|BTC|LTC}CHAIN` [#1656](https://github.com/thorchain/asgardex-electron/issues/1656)
- [Binance] Blacklist `RUNE-67C` on mainnet [#1660](https://github.com/thorchain/asgardex-electron/issues/1660)

## Fix

- [thornode] Fix endpoint used by `services/thornode` [#1662](https://github.com/thorchain/asgardex-electron/issues/1662)

## Internal

- Update npm dependencies (10-08-2021) [#1658](https://github.com/thorchain/asgardex-electron/issues/1658)
- `isRune...` helpers need to be depending on network [#1639](https://github.com/thorchain/asgardex-electron/pull/1639)

# 0.3.11 (2021-08-10)

## Add

- [Swap] Add swap limit protection [#1647](https://github.com/thorchain/asgardex-electron/issues/1647)
- [Swap] Add ASGARDEX identifier to swap memo [1615](https://github.com/thorchain/asgardex-electron/issues/1615)
- [Mimir] Handle halt params of Mimir [#1645](https://github.com/thorchain/asgardex-electron/issues/1645)
- [ERC20] Blacklist UNIH [#1652](https://github.com/thorchain/asgardex-electron/issues/1652)

# 0.3.10 (2021-07-30)

## Hotfix

- [chaosnet] Disable Swap / Add / Withdraw for all pools temporary
- [chaosnet] Disable upgrade of BNB.RUNE and ETH.RUNE temporary

# 0.3.9 (2021-07-14)

## Add

- [Asset] Add icon for XRUNE [#1616](https://github.com/thorchain/asgardex-electron/pull/1616)
- [Header] Add missing explorer endpoints [#1572](https://github.com/thorchain/asgardex-electron/issues/1572)

## Fix

- [XRUNE] Fix currency symbol bug [#1630](https://github.com/thorchain/asgardex-electron/issues/1630)

## (Internal) Updates

- Upgrade to latest `xchain-*` packages (incl. misc. fixes after upgrade) [#1619](https://github.com/thorchain/asgardex-electron/pull/1619), [#1620](https://github.com/thorchain/asgardex-electron/issues/1620), [#1622](https://github.com/thorchain/asgardex-electron/issues/1622), [#1623](https://github.com/thorchain/asgardex-electron/issues/1623), [#1628](https://github.com/thorchain/asgardex-electron/pull/1628)
- Upgrade to Electron@13.1.6 [#1628](https://github.com/thorchain/asgardex-electron/pull/1628)
- [THORChain] Get data for ClientUrl from .env [#1632](https://github.com/thorchain/asgardex-electron/issues/1632)
- Switch momentjs -> dayjs [##1304](https://github.com/thorchain/asgardex-electron/issues/#1304)

# 0.3.8 (2021-07-03)

## Fix

- [Wallet] Send ETH: `gas_rate` based on `gwei` [#1608](https://github.com/thorchain/asgardex-electron/issues/1608)

# 0.3.7 (2021-07-01)

## Fix

- [Swap] Fix: Approve button does not appear [#1595](https://github.com/thorchain/asgardex-electron/issues/1595)
- [Swap] Fix: Error `cannot estimate gas; transaction may fail or may require manual gas limit` [#1594](https://github.com/thorchain/asgardex-electron/issues/1594)
- [Swap/Deposit] Improve `approve` handling for ERC20 tokens [#1602](https://github.com/thorchain/asgardex-electron/pull/1602)
- [Swap/Deposit] Better feedback for loading states [#1602](https://github.com/thorchain/asgardex-electron/pull/1602)
- Revert upgrade `xchain-bitcoin|bitcoin-cash|litecoin` [#1606](https://github.com/thorchain/asgardex-electron/pull/1606)

## (Internal) update

- Use latest xchain-\* packages [#1602](https://github.com/thorchain/asgardex-electron/pull/1602)

# 0.3.6 (2021-06-30)

## Fix

- [Pools] Hide empty pending pools [#1599](https://github.com/thorchain/asgardex-electron/issues/1599)
- [UI] Misc. fixes / improvements [#1566](https://github.com/thorchain/asgardex-electron/issues/1566), [#1568](https://github.com/thorchain/asgardex-electron/issues/1568), [#1581](https://github.com/thorchain/asgardex-electron/issues/1581), [#1582](https://github.com/thorchain/asgardex-electron/issues/1582)

## (Internal) update

- Update dependencies (`Electron@13.x` etc.) [#1565](https://github.com/thorchain/asgardex-electron/issues/1565)

## (Internal) changes

- Update to latest Midgard 2.2.2 [#1586](https://github.com/thorchain/asgardex-electron/issues/1586)

# 0.3.5 (2021-06-22)

## Feature

- Show QRCode on AssetsOverview + Settings [#1554](https://github.com/thorchain/asgardex-electron/pull/1554)

## Fix

- [UI] Fix misc. UI issues [#1552](https://github.com/thorchain/asgardex-electron/issues/1552)
- [Swap] Fix min. amount to swap [#1558](https://github.com/thorchain/asgardex-electron/pull/1558)
- [PoolDetail] Disable SWAP button for pending pools" [#1560](https://github.com/thorchain/asgardex-electron/pull/1560)
- [Wallet] Validation of phrase not triggered [#1561](https://github.com/thorchain/asgardex-electron/pull/1561)
- [Wallet] Fix THORChain tx history #1563 [#1561](https://github.com/thorchain/asgardex-electron/pull/1561)

# 0.3.4 (2021-06-14)

## Update

- Update cap [#1544](https://github.com/thorchain/asgardex-electron/pull/1544)

## Fix

- Fix LTC address validation [#1544](https://github.com/thorchain/asgardex-electron/pull/1544)
- Fix withdraw error "out of gas" [#1546](https://github.com/thorchain/asgardex-electron/pull/1546) by using latest `xchain-thorchain@0.16.1`

# 0.3.3 (2021-06-10)

## Fix

- Update to latest `xchain-bitcoin` to fix BTC balances [#1537](https://github.com/thorchain/asgardex-electron/pull/1537)

# 0.3.2 (2021-06-10)

## Fix

- Fix BTC balances [#1533](https://github.com/thorchain/asgardex-electron/pull/1533)
- Fix RUNE price format [#1531](https://github.com/thorchain/asgardex-electron/pull/1531)

## Update

- Update translation FR [#1530](https://github.com/thorchain/asgardex-electron/pull/1530)

# 0.3.1 (2021-06-09)

## Fix

- Use `viewblock` as default explorer [#1517](https://github.com/thorchain/asgardex-electron/pull/1517)
- Fix url of `Recovery tool` [#1523](https://github.com/thorchain/asgardex-electron/pull/1523)

## (Internal) change

- Get rid of chaosnet in type Network in favour of using mainnet only [#1524](https://github.com/thorchain/asgardex-electron/pull/1524)
- Refactor pending asset data handling [#1515](https://github.com/thorchain/asgardex-electron/pull/1515)

# 0.3.0 (2021-06-07)

## Feature

- UPGRADE ETH.RUNE #1450
- [Header] Show RUNE price #1328 #1478 #1483 #1485
- [Header] Show 24h volume #1373 #1484 #1485
- [Deposit] Check / show pending assets #1503 #1505
- Show confirmation modal when user presses remove wallet in either of the two remove wallet flows #1479

## Update

- Update FR translation #1452
- Update to latest xchain-\* libs #1477 #1486 #1508 #1510
- [BTC] Add 10k sats treshold for swap / deposit #1481

## Fix

- Pool Cycle not overridden by Mimir #1504
- [Header] Use strings as props for boolean #1501
- [Resolve] Re-send Native RUNE tx in case of failure #1492
- [Wallet] Pagination of ETH txs is broken #1489
- Disable sorting for TxsTable #1480
- Fix create view error UX flow #1474
- Fix chart data of PoolDetail #1470
- Misc. UI fixes / improvements listed in #1305 (#1466 #1467 #1468 #1469 #1471 #1473)
- [PoolDetail] Update data of pool cards #1459
- Wallet/AssetOverview: Fix decimals #1458
- [Withdraw] Min. amount not visible (dark theme only) #1511
- [PoolDetail] Fix value for liquidity #1448

# 0.2.1 (2021-05-25)

## Fix

- [BCH] Revert changes of using legacy addresses #1446
- [USD] Update pricing using deepest USD\* pool #1439 #1440
- [ETH] Tweak estimated fees #1445
- [Pools] Fix depth (liquidity) + default sort order #1439
- Fix decimal for bond, unbond, custom actions #1437

# 0.1.0 (2021-04-13)

- Ready for MCCN

Release notes https://github.com/thorchain/asgardex-electron/releases/tag/v0.1.0
