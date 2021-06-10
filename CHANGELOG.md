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
