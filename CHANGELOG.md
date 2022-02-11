# 0.8.0 (2022-xx-xx)

## Add

- [Ledger] Re-enable BTC Ledger support #2059

## Update

- Shorten memos [#2052](https://github.com/thorchain/asgardex-electron/issues/2052)
- Re-enable testnet for releases (production) [#2048](https://github.com/thorchain/asgardex-electron/issues/2048)
- Update for RU translation (better translation and fix for typos) by @TreefeedXavier [#2046](https://github.com/thorchain/asgardex-electron/pull/2046)
- Update ERC20 token list to include XDEFI token [#2040](https://github.com/thorchain/asgardex-electron/issues/2040)

## Fix

- [i18n] Translate pooled #2047

# 0.7.1 (2022-01-21)

## Update

- Use `haskoin.ninerealms.com` for `BTC` to get rid of `api.haskoin.com` [#2037](https://github.com/thorchain/asgardex-electron/issues/2037)
- Get logoUrl from the ERC20 whitelist [#2041](https://github.com/thorchain/asgardex-electron/issues/2041)

## Fix

- Settings placeholder in Wallet area do not catch translation from i18 files [#2036](https://github.com/thorchain/asgardex-electron/issues/2036)

# 0.7.0 (2022-01-19)

## Add

- `DOGE` support [#2001](https://github.com/thorchain/asgardex-electron/issues/2001)

## Update

- updating ru translation by @TreefeedXavier [#2032](https://github.com/thorchain/asgardex-electron/pull/2032)
- Re-enable RU [#2033](https://github.com/thorchain/asgardex-electron/issues/2033)

## Fix

- Fix `sRUNE` support on `stagenet` [#2018](https://github.com/thorchain/asgardex-electron/issues/2018)
- Native menu does not appear before opening settings [#2029](https://github.com/thorchain/asgardex-electron/issues/2029)
- Unlock screen: Wrong headline [#2031](https://github.com/thorchain/asgardex-electron/issues/2031)

## Remove

- Disable `testnet` for releases (production mode) [#2025](https://github.com/thorchain/asgardex-electron/issues/2025)

# 0.6.2 (2022-01-11)

## Fix

- [Mimir] Deprecated 'mimir//MAXIMUMLIQUIDITYRUNE' leads to NO FUNDS CAP [#2013](https://github.com/thorchain/asgardex-electron/issues/2013)

# 0.6.1 (2022-01-10)

## Add

- ADD: Stagenet [#1987](https://github.com/thorchain/asgardex-electron/issues/1987), [#2000](https://github.com/thorchain/asgardex-electron/pull/2000)
- [Stagenet] Enable DOGE pool [#2003](https://github.com/thorchain/asgardex-electron/pull/2003)

## Update

- [Mimir] Update keys [#2004](https://github.com/thorchain/asgardex-electron/issues/2004)
- [Mimir] Support `**DOGE**` flags [#2007](https://github.com/thorchain/asgardex-electron/pull/2007)
- 1inch ERC20 whitelist [#2010](https://github.com/thorchain/asgardex-electron/issues/2010)

## Fix

- Link to release page is broken [#1983](https://github.com/thorchain/asgardex-electron/issues/1983)
- [Wallet] Icons to remove / show Ledger address are floating left [#1984](https://github.com/thorchain/asgardex-electron/issues/1984)
- Second share not showing [#1995](https://github.com/thorchain/asgardex-electron/issues/1995)

# 0.6.0 (2021-12-16)

## Add

- [ADD] Add liquidity using Ledger [#1926](https://github.com/thorchain/asgardex-electron/pull/1926), [#1927](https://github.com/thorchain/asgardex-electron/issues/1927) [#1936](https://github.com/thorchain/asgardex-electron/issues/1936), [#1962](https://github.com/thorchain/asgardex-electron/pull/1962)
- [Withdraw] Update UI to support Ledger [#1928](https://github.com/thorchain/asgardex-electron/issues/1928)
- [Ledger] Update shares for Ledger in Withdraw / Deposit [#1942](https://github.com/thorchain/asgardex-electron/pull/1942)
- Restore previous windows dimensions with next start of ASGDX [#1879](https://github.com/thorchain/asgardex-electron/issues/1879)
- Show asset icon in TxDetail (wallet history + pool details)[#1955](https://github.com/thorchain/asgardex-electron/pull/1955)
- [ADD] Check asset mismatch for Ledger + keystore [#1938](https://github.com/thorchain/asgardex-electron/issues/1938)
- Show ledger or keystore addresses in tooltips [#1959](https://github.com/thorchain/asgardex-electron/pull/1959)
- Whitelist TGT token [#1960](https://github.com/thorchain/asgardex-electron/issues/1960)

## Update

- [Swap] Update slippage tolerance [#1929](https://github.com/thorchain/asgardex-electron/issues/1929)
- Pimp Ledger confirmation modal [#1941](https://github.com/thorchain/asgardex-electron/pull/1941)
- Update FR translation by @Weyland2093 [#1972](https://github.com/thorchain/asgardex-electron/pull/1972)
- Switch to haskoin.ninerealms.com [#1974](https://github.com/thorchain/asgardex-electron/issues/1974)
- [Send] Show Ledger modal [#1979](https://github.com/thorchain/asgardex-electron/pull/1979)
- [Wallet] Consider shares of Ledger accounts [#1980](https://github.com/thorchain/asgardex-electron/issues/1980)

## Remove

- [RU] Remove language support for RU temporary [#1966](https://github.com/thorchain/asgardex-electron/issues/1966)

## Fix

- Format date [#1873](https://github.com/thorchain/asgardex-electron/issues/1873)
- [PoolDetail] Make tx explorer accessible for locked / not imported wallet users [#1871](https://github.com/thorchain/asgardex-electron/issues/1871)
- Fix Tooltip styles [#1944](https://github.com/thorchain/asgardex-electron/pull/1944)
- [Swap] Limits added to memo needs to be 1e8 [#1946](https://github.com/thorchain/asgardex-electron/issues/1946)
- [PoolShare] Don't combine `asym` with `sym` shares in PoolShare [#1964](https://github.com/thorchain/asgardex-electron/pull/1964)
- [Send] Fix max value for sending ETH [#1978](https://github.com/thorchain/asgardex-electron/pull/1978)

## Internal

- Test latest `eq` helpers [#1943](https://github.com/thorchain/asgardex-electron/pull/1943)
- Update misc. dependencies as part of preparing v0.6.0 [#1982](https://github.com/thorchain/asgardex-electron/pull/1982)

# 0.5.0 (2021-10-31)

## Add

- [Swap] Enable Ledger in Swap [#1868](https://github.com/thorchain/asgardex-electron/pull/1868)
- [Swap] Show address type for recipient [#1857](https://github.com/thorchain/asgardex-electron/pull/1857)
- [Ledger] Add wallet index input for RUNE [#1889](https://github.com/thorchain/asgardex-electron/pull/1889)
- [Send] Show address type for recipient [#1859](https://github.com/thorchain/asgardex-electron/pull/1859)
- [Upgrade] Show address type for recipient [#1861](https://github.com/thorchain/asgardex-electron/pull/1861)
- [AsymDeposit] Detect previous asymmetric deposit to disable asymmetric deposit [#1829](https://github.com/thorchain/asgardex-electron/pull/1829)
- [CheckButton] Add CheckButton [#1869](https://github.com/thorchain/asgardex-electron/pull/1869)
- [Wallet] Replace text with WalletType label in Settings [#1852](https://github.com/thorchain/asgardex-electron/pull/1852)
- [WalletHistory] Add link to viewblock [#1854](https://github.com/thorchain/asgardex-electron/pull/1854)

## Update

- Improve WalletHistory [#1855](https://github.com/thorchain/asgardex-electron/pull/1855)
- Tweak styles of WalletTypeLabel [#1856](https://github.com/thorchain/asgardex-electron/pull/1856)
- Remove deprecated AssetPair components [#1865](https://github.com/thorchain/asgardex-electron/pull/1865)
- Update AssetData|Menu|Select components to show wallet type [#1867](https://github.com/thorchain/asgardex-electron/pull/1867)
- [Header] Make rune price visible for smaller window sizes [#1880](https://github.com/thorchain/asgardex-electron/pull/1880)
- [Header] Tooltip to explain VOLUME (24h) [#1885](https://github.com/thorchain/asgardex-electron/pull/1885)
- [ERC20] Update whitelist (incl. icon support for ETH.THOR, ETH.FOX) [#1894](https://github.com/thorchain/asgardex-electron/issues/1894), [#1896](https://github.com/thorchain/asgardex-electron/issues/1896)
- Use sync mode for broadcasting transactions to THORChain [#1919](https://github.com/thorchain/asgardex-electron/pull/1919)

## Fix

- Fix missing ledger addresses in WalletHistory [#1853](https://github.com/thorchain/asgardex-electron/pull/1853)
- Fix wallettype label [#1860](https://github.com/thorchain/asgardex-electron/pull/1860)
- [Swap] Fix slip calculation and displaying [#1876](https://github.com/thorchain/asgardex-electron/pull/1876)
- [Pools] Disable manage button while wallet locked [#1877](https://github.com/thorchain/asgardex-electron/pull/1877)
- Fix 24h volume [#1883](https://github.com/thorchain/asgardex-electron/pull/1883)
- Fix outdated links [#1884](https://github.com/thorchain/asgardex-electron/pull/1884)
- `walletIndex` gets lost [#1901](https://github.com/thorchain/asgardex-electron/pull/1901), [#1908](https://github.com/thorchain/asgardex-electron/issues/1908)
- [WalletSettings] Verifying Ledger address with walletIndex > 0 failed [#1912](https://github.com/thorchain/asgardex-electron/issues/1912)

## Internal

- Set testnet as default network in development mode [#1851](https://github.com/thorchain/asgardex-electron/pull/1851)
- Update to latest npm dependencies (19-10-2021) [#1864](https://github.com/thorchain/asgardex-electron/pull/1864)

# 0.4.5 (2021-10-28)

## Fix

- [Mimir] Consider mimir//PAUSELP [#1902](https://github.com/thorchain/asgardex-electron/issues/1902)

# 0.4.4 (2021-10-12)

## Add

- [Ledger] Open modal to verify Ledger address [#1841](https://github.com/thorchain/asgardex-electron/pull/1841)
- [Upgrade] Add recipient address field [#1836](https://github.com/thorchain/asgardex-electron/pull/1836)
- [Wallet] Get history data depending on selected address [#1838](https://github.com/thorchain/asgardex-electron/pull/1838)

## Fix

- [Upgrade] Fix BNB fee warning [#1835](https://github.com/thorchain/asgardex-electron/pull/1835)
- [Swap] Increase padding in order to show XRUNE asset properly [#1840](https://github.com/thorchain/asgardex-electron/pull/1840)

## Internal

- Introduce useMidgardHistoryActions hook [#1842](https://github.com/thorchain/asgardex-electron/pull/1842)
- [History] Create custom component to select addresses [#1818](https://github.com/thorchain/asgardex-electron/pull/1818)

# 0.4.3 (2021-10-06)

## Update

- Enable Ledger THORChain after resolved certificate issues [#1823](https://github.com/thorchain/asgardex-electron/commit/ca53096f064a1f101a3864e6f734bca18c5a5ff4)

## Fix

- Use latest electron version with certificate related fixes [#1831](https://github.com/thorchain/asgardex-electron/pull/1831)

# 0.4.2 (2021-10-05)

## Add

- [BNB] Support Ledger to send transactions [#1710](https://github.com/thorchain/asgardex-electron/issues/1710), [#1711](https://github.com/thorchain/asgardex-electron/issues/1711), [#1815](https://github.com/thorchain/asgardex-electron/issues/1815), [#1772](https://github.com/thorchain/asgardex-electron/issues/1772)
- [Wallet] Show Ledger `BNB` balances [#1712](https://github.com/thorchain/asgardex-electron/issues/1712)
- [ERC20] Whitelist assets [#1815](https://github.com/thorchain/asgardex-electron/issues/1815)

## Update

- Update `FR` translation [#1797](https://github.com/thorchain/asgardex-electron/pull/1797)
- Disable Ledger THORChain temporarily [#1823](https://github.com/thorchain/asgardex-electron/pull/1823)

## Fix

- [Swap] Incorrect explorer link in SWAP dialog [#1787](https://github.com/thorchain/asgardex-electron/issues/1787)
- Upgrading `BEP2.RUNE` via Ledger is not working [#1803](https://github.com/thorchain/asgardex-electron/issues/1803)
- Link for recovering transactions doesn't work on testnet [#1804](https://github.com/thorchain/asgardex-electron/issues/1804)
- [Wallet] Too many requests for same endpoint [#1785](https://github.com/thorchain/asgardex-electron/issues/1785)
- [Send] Wrong selected asset [#1784](https://github.com/thorchain/asgardex-electron/issues/1784)
- Insufficient funds when adding liquidity [#1805](https://github.com/thorchain/asgardex-electron/issues/1805)

## Internal

- Update npm dependencies (09-30-2021) - incl. latest Electron@15.x [#1800](https://github.com/thorchain/asgardex-electron/issues/1800)

# 0.4.1 (2021-09-26)

## Fix

- [Header] Improve API status [#1734](https://github.com/thorchain/asgardex-electron/issues/1734)
- Update link to recovery tool [#1781](https://github.com/thorchain/asgardex-electron/pull/1781)
- [AssetSelect] Make it more clickable [1776](https://github.com/thorchain/asgardex-electron/pull/1776)
- [Swap] Ledger `BNB` address is marked as invalid [#1778](https://github.com/thorchain/asgardex-electron/issues/1778)
- Fix reload of `mimir$` in case of offline mode [#1783](https://github.com/thorchain/asgardex-electron/pull/1783)
- Fix `ERC20` assets for testnet [#1788](https://github.com/thorchain/asgardex-electron/issues/1788)
- Fix withdraw issues by using latest `xchain-thorchain@0.19.2` [#1792](https://github.com/thorchain/asgardex-electron/pull/1792)

# 0.4.0 (2021-09-15)

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
