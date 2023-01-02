# 1.19.0 (2023-01-xx)

## Add

- [Savers] UI [#2485](https://github.com/thorchain/asgardex-electron/pull/2485)

# 1.18.6 (2022-12-xx)

## Update

- [SymDeposit] Redesign [#2503](https://github.com/thorchain/asgardex-electron/issues/2503), [#2502](https://github.com/thorchain/asgardex-electron/pull/2502)
- [AssetInput] Add Ledger + extraContent [#2505](https://github.com/thorchain/asgardex-electron/pull/2505)
- Refactor styles for 'warning` components (TW only) [#2504](https://github.com/thorchain/asgardex-electron/pull/2504)
- [Deposit] Wallet types based on routes [#2506](https://github.com/thorchain/asgardex-electron/pull/2506)
- [SWAP] Persistant wallet state while reloading or switching asset pair [#2511](https://github.com/thorchain/asgardex-electron/pull/2511)
- [Wallet] Add `Swap` to `ActionButton` to jump to swap view with one click only [#2512](https://github.com/thorchain/asgardex-electron/pull/2512)

## Fix

- External links not clickable [#2495](https://github.com/thorchain/asgardex-electron/issues/2495)
- [Send] Max value can't be negative [#2500](https://github.com/thorchain/asgardex-electron/issues/2500)
- [Swap] Fees needs to be considered for max value to swap [#2498](https://github.com/thorchain/asgardex-electron/issues/2498)
- [SymDeposit] RUNE can be selected on asset side [#2507](https://github.com/thorchain/asgardex-electron/issues/2507)
- [Deposit] Check of asset missmatch failed [#2509](https://github.com/thorchain/asgardex-electron/issues/2509)

# 1.18.5 (2022-12-20)

## Add

- Introduce `ActionButton` [#2452](https://github.com/thorchain/asgardex-electron/pull/2452)
- [Swap] Show balances [#2446](https://github.com/thorchain/asgardex-electron/issues/2446)
- [ETH] Use `depositWithExpiry` to deposit [#2472](https://github.com/thorchain/asgardex-electron/issues/2472)
- Add `x-client-id` header to send ASGDX' identifier for any request to 9R servers [#2463](https://github.com/thorchain/asgardex-electron/issues/2463), [#2464](https://github.com/thorchain/asgardex-electron/pull/2464), [#2474](https://github.com/thorchain/asgardex-electron/pull/2474)
- [Savers] Routes [#2450](https://github.com/thorchain/asgardex-electron/pull/2450)
- Add wallet actions to assets table [#2455](https://github.com/thorchain/asgardex-electron/pull/2455)
- Savers overview [#2466](https://github.com/thorchain/asgardex-electron/pull/2466), [#2470](https://github.com/thorchain/asgardex-electron/pull/2470), [#2479](https://github.com/thorchain/asgardex-electron/pull/2479)
- Display APY/APR depending on days [#2477](https://github.com/thorchain/asgardex-electron/pull/2477)

## Update

- Add/update buttons components: `Swap|Savers|Back|ManageButton` [#2451](https://github.com/thorchain/asgardex-electron/pull/2451)
- Upgrade to latest Midgard@2.12.1 [#2469](https://github.com/thorchain/asgardex-electron/pull/2469),
- Upgrade to latest Midgard@2.11.0 [#2467](https://github.com/thorchain/asgardex-electron/pull/2467)
- Upgrade types / endpoints to latest THORNode@1.100.0 [#2468](https://github.com/thorchain/asgardex-electron/pull/2468)
- Refactor PoolsOverview [#2465](https://github.com/thorchain/asgardex-electron/pull/2465)
- Translation ru3 dec by @TreefeedXavier [#2471](https://github.com/thorchain/asgardex-electron/pull/2471)
- Upgrade types / endpoints to latest THORNode@1.100.0 [#2468](https://github.com/thorchain/asgardex-electron/pull/2468)
- Upgrade types / endpoints to latest THORNode@1.101.0 [#2475](https://github.com/thorchain/asgardex-electron/pull/2475)
- AssetsTableCollapsable: Combine balance/price [#2478](https://github.com/thorchain/asgardex-electron/pull/2478)
- Update pools routes [#2482](https://github.com/thorchain/asgardex-electron/pull/2482)
- [Ledger] Add a safety check of fees before signing txs [#2491](https://github.com/thorchain/asgardex-electron/issues/2491)
- [Ledger] Update `@ledgerhq/hw-*` packages [#2494](https://github.com/thorchain/asgardex-electron/pull/2494)

## Fix

- [Swap] Max. amount to swap needs to be equal to max. balances [#2448](https://github.com/thorchain/asgardex-electron/issues/2448)
- [PoolsOverview] Inconsistent search state [#2483](https://github.com/thorchain/asgardex-electron/issues/2483)
- [Deposit] Maximum update depth exceeded [#2487](https://github.com/thorchain/asgardex-electron/issues/2487)

## Internal

- Update to latest Electron@22.0.0 / TypeScript@4.9.4[#2480](https://github.com/thorchain/asgardex-electron/pull/2480)
- Downgrade to Electron@20.x.x [#2493](https://github.com/thorchain/asgardex-electron/pull/2493)
- Update CI to deprecate Ubuntu 18.x in favour of building on Ubuntu 20.04 [#2494](https://github.com/thorchain/asgardex-electron/pull/2494)
- Update CI to continue build support of `macOS-11` [#2494](https://github.com/thorchain/asgardex-electron/pull/2494)

# 1.18.4 (2022-11-03)

## Fix

- [Swap] Custom recipient address locked out [#2437](https://github.com/thorchain/asgardex-electron/issues/2437)
- [Swap] Can't switch asset pair in some cases [#2439](https://github.com/thorchain/asgardex-electron/issues/2439)
- [Swap] Wrong max amount to swap value for non chain (source) asset [#2444](https://github.com/thorchain/asgardex-electron/issues/2444)

## Update

- [Swap] Improve info text of max value to swap [#2442](https://github.com/thorchain/asgardex-electron/pull/2442)

# 1.18.3 (2022-11-02)

## Update

- [Swap] Redesign [#2420](https://github.com/thorchain/asgardex-electron/pull/2420). [#2430](https://github.com/thorchain/asgardex-electron/pull/2430), [#2432](https://github.com/thorchain/asgardex-electron/pull/2432)
- Refactor `AssetMenu` component [#2429](https://github.com/thorchain/asgardex-electron/pull/2429)
- Redesign AssetSelect [#2426](https://github.com/thorchain/asgardex-electron/pull/2426)
- Upgrade to heroicons@2.x [#2425](https://github.com/thorchain/asgardex-electron/pull/2425)
- Move handling of LastBlock from Midgard to THORNode [#2419](https://github.com/thorchain/asgardex-electron/pull/2419)
- Move handling of Constants from Midgard to THORNode [#2418](https://github.com/thorchain/asgardex-electron/pull/2418)
- Update types/api for latest thornode@1.97.2 [#2412](https://github.com/thorchain/asgardex-electron/pull/2412)
- Update types/api for latest midgard@2.9.4 [#2413](https://github.com/thorchain/asgardex-electron/pull/2413)
- Update ERC20 whitelist based on latest thornode@1.97.2 [#2414](https://github.com/thorchain/asgardex-electron/pull/2414)
- Get outbound fees from `inbound_addresses` [#2406](https://github.com/thorchain/asgardex-electron/issues/2406)
- Updated RU translation by @TreefeedXavier [#2434](https://github.com/thorchain/asgardex-electron/pull/2434)

## Add

- `InputSearch` component [#2427](https://github.com/thorchain/asgardex-electron/pull/2427)

## Fix

- AssetSelect: Scroll area breaks layout + dialog shouldn't close by clicking search input [#2428](https://github.com/thorchain/asgardex-electron/issues/2428)
- Check Midgard status from its health endpoint [#2417](https://github.com/thorchain/asgardex-electron/issues/2417)

# 1.18.2 (2022-10-03)

## Add

- [Header] Add wallet selector [#2392](https://github.com/thorchain/asgardex-electron/pull/2392)
- [Settings] Persistent data of editable endpoints (Midgard, THORNode API|RPC) [#2387](https://github.com/thorchain/asgardex-electron/issues/2387), [#2393](https://github.com/thorchain/asgardex-electron/pull/2393), [#2409](https://github.com/thorchain/asgardex-electron/pull/2409)

## Update

- Translation of missing RU strings. Typo fixes. by @TreefeedXavier [#2401](https://github.com/thorchain/asgardex-electron/pull/2401)
- Update fr translation by @Weyland2093 [#2403](https://github.com/thorchain/asgardex-electron/pull/2403)
- Deprecate all `thorchain.info` API endpoints [#2400](https://github.com/thorchain/asgardex-electron/issues/2400)
- Disable testnet [#2399](https://github.com/thorchain/asgardex-electron/issues/2399)

## Fix

- Add validation of wallet names to avoid duplications [#2386](https://github.com/thorchain/asgardex-electron/issues/2386)
- Swap DOGE -> RUNE failed due maximum fee rate error [#2398](https://github.com/thorchain/asgardex-electron/issues/2398)
- [Cosmos] Wallet is not available - https://cosmos-lcd.quickapi.com is down [#2404](https://github.com/thorchain/asgardex-electron/issues/2404)

## Internal

- Upgrade to Yarn 3.x [#2389](https://github.com/thorchain/asgardex-electron/issues/2389)
- Update xchain-\* libs [#2402](https://github.com/thorchain/asgardex-electron/pull/2402)

# 1.18.1 (2022-09-18)

## Fix

- [BCH] Reintroduction of error `Expected property "1" of type BigInteger, got n` [#2394](https://github.com/thorchain/asgardex-electron/issues/2394)

# 1.18.0 (2022-08-29)

## Add

- [Wallet] Multi wallet support [#2334](https://github.com/thorchain/asgardex-electron/pull/2334), [#2338](https://github.com/thorchain/asgardex-electron/pull/2338), [#2339](https://github.com/thorchain/asgardex-electron/pull/2339), [#2345](https://github.com/thorchain/asgardex-electron/pull/2345), [#2346](https://github.com/thorchain/asgardex-electron/pull/2346), [#2348](https://github.com/thorchain/asgardex-electron/pull/2348), [#2349](https://github.com/thorchain/asgardex-electron/pull/2349), [#2350](https://github.com/thorchain/asgardex-electron/pull/2350), [#2351](https://github.com/thorchain/asgardex-electron/pull/2351), [#2356](https://github.com/thorchain/asgardex-electron/pull/2356), [#2358](https://github.com/thorchain/asgardex-electron/pull/2358), [#2359](https://github.com/thorchain/asgardex-electron/pull/2359), [#2360](https://github.com/thorchain/asgardex-electron/pull/2360), [#2361](https://github.com/thorchain/asgardex-electron/pull/2361), [#2373](https://github.com/thorchain/asgardex-electron/pull/2373), [#2374](https://github.com/thorchain/asgardex-electron/pull/2374), [#2376](https://github.com/thorchain/asgardex-electron/pull/2376), [#2379](https://github.com/thorchain/asgardex-electron/pull/2379), [#2381](https://github.com/thorchain/asgardex-electron/pull/2381)
- [Settings] Editable endpoints for Midgard, THORNode (API/RPC) [#2371](https://github.com/thorchain/asgardex-electron/pull/2371), [#2364](https://github.com/thorchain/asgardex-electron/pull/2364), [#2368](https://github.com/thorchain/asgardex-electron/pull/2368), [#2370](https://github.com/thorchain/asgardex-electron/pull/2370), [#2371](https://github.com/thorchain/asgardex-electron/pull/2371)

## Update

- Update to latest Midgard v2.9.0 [#2331](https://github.com/thorchain/asgardex-electron/pull/2331)
- Generate types/endpoints for THORNode 0.19.5 [#2365](https://github.com/thorchain/asgardex-electron/pull/2365)
- Use generated THORNode types / endpoints [#2367](https://github.com/thorchain/asgardex-electron/pull/2367)
- Updated RU translation by @TreefeedXavier [#2369](https://github.com/thorchain/asgardex-electron/pull/2369)

## Fix

- Fix KeystoreClientStates [#2330](https://github.com/thorchain/asgardex-electron/pull/2330)
- Fix styles of IncentivePendulum [#2332](https://github.com/thorchain/asgardex-electron/pull/2332)
- Quick fix: Website url is deprecated [#2333](https://github.com/thorchain/asgardex-electron/pull/2333)
- Quick fix: Disable manage button in PoolsDetails [#2353](https://github.com/thorchain/asgardex-electron/pull/2353)
- Use 9R Midgard by default [#2363](https://github.com/thorchain/asgardex-electron/pull/2363)
- Fix deprecated usage of Antd.Menu children [#2372](https://github.com/thorchain/asgardex-electron/pull/2372)
- [Ledger] Fix/extend HD pathes for ETH [#2344](https://github.com/thorchain/asgardex-electron/issues/2344)
- Fix: lcd-cosmos.cosmosstation.io api is down - pt2 [#2382](https://github.com/thorchain/asgardex-electron/pull/2382)

## Remove

- Remove TERRA finally [#2329](https://github.com/thorchain/asgardex-electron/pull/2329)

## Internal

- Introduce Tailwind - for styling and to replace antd components (step by step) [#2337](https://github.com/thorchain/asgardex-electron/pull/2337), [#2340](https://github.com/thorchain/asgardex-electron/pull/2340), [#2342](https://github.com/thorchain/asgardex-electron/pull/2342), [#2343](https://github.com/thorchain/asgardex-electron/pull/2343), [#2347](https://github.com/thorchain/asgardex-electron/pull/2347), [#2352](https://github.com/thorchain/asgardex-electron/pull/2352), [#2354](https://github.com/thorchain/asgardex-electron/pull/2354), [#2355](https://github.com/thorchain/asgardex-electron/pull/2355), [#2356](https://github.com/thorchain/asgardex-electron/pull/2356), [#2357](https://github.com/thorchain/asgardex-electron/pull/2357)

# 1.17.2 (2022-07-19)

## Fix

- [BCH] Broadcast tx to Haskoin might end in 500 error [#2320](https://github.com/thorchain/asgardex-electron/issues/2320)
- Update tx sizes to fix `outbound amount does not meet requirements` errors [#2326](https://github.com/thorchain/asgardex-electron/pull/2326)

## Update

- Update RU translation by @TreefeedXavier [#2318](https://github.com/thorchain/asgardex-electron/pull/2318)

## Internal

- Migrate to CRA5 [##2323](https://github.com/thorchain/asgardex-electron/pull/2323)
- Migrate to storybook v7 [#2324](https://github.com/thorchain/asgardex-electron/pull/2324)
- Simplify handling of TerserPlugin.mangle [#2321](https://github.com/thorchain/asgardex-electron/issues/2321)

# 1.17.1 (2022-07-11)

## Add

- [Ledger] ETH needs an option to select different derivation paths (`Legacy` vs. `LedgerLive`) [#2316](https://github.com/thorchain/asgardex-electron/pull/2316)

## Update

- Remove TERRA from supported pools [#2312](https://github.com/thorchain/asgardex-electron/issues/2312)

## Fix

- [Ledger] THORChain tx does not send, but failed silently w/o error [#2310](https://github.com/thorchain/asgardex-electron/issues/2310)

# 1.17.0 (2022-07-01)

## ADD

- [Ledger] Support Cosmos (ATOM) [#2301](https://github.com/thorchain/asgardex-electron/issues/2301), [#2302](https://github.com/thorchain/asgardex-electron/pull/2302), [#2303](https://github.com/thorchain/asgardex-electron/pull/2303), [#2304](https://github.com/thorchain/asgardex-electron/pull/2304), [#2304](https://github.com/thorchain/asgardex-electron/pull/2304)

## Fix

- UI does not show Mimir status of GAIA [#2300](https://github.com/thorchain/asgardex-electron/pull/2300)
- [Wallet] Shares are not updated while changing the network [#2307](https://github.com/thorchain/asgardex-electron/issues/2307)

# 1.16.0 (2022-06-22)

## ADD

- Support Cosmos (ATOM) [#2288](https://github.com/thorchain/asgardex-electron/issues/2288), [#2193](https://github.com/thorchain/asgardex-electron/pull/2193), [#2290](https://github.com/thorchain/asgardex-electron/pull/2290), [2291](https://github.com/thorchain/asgardex-electron/pull/2291), [2292](https://github.com/thorchain/asgardex-electron/pull/2292), [#2295](https://github.com/thorchain/asgardex-electron/pull/2295), [#2296](https://github.com/thorchain/asgardex-electron/pull/2296), [#2297](https://github.com/thorchain/asgardex-electron/pull/2297)

## Update

- Prepare `mainnet` [#2294](https://github.com/thorchain/asgardex-electron/pull/2294)
- [Pools] Toggle filter buttons to remove clear button [#2287](https://github.com/thorchain/asgardex-electron/pull/2287)

# 0.15.2 (2022-06-06)

## Add

- Add search option for pools [#2275](https://github.com/thorchain/asgardex-electron/pull/2275)
  [PoolsOverview] Watch / unwatch pools [#2276](https://github.com/thorchain/asgardex-electron/pull/2276), [#2277](https://github.com/thorchain/asgardex-electron/pull/2277)
  [PoolDetail] Watch / unwatch pool [#2278](https://github.com/thorchain/asgardex-electron/pull/2276)
  [Settings] Make settings collapsable [#2281](https://github.com/thorchain/asgardex-electron/pull/2281)
  [Settings] Filter accounts [#2282](https://github.com/thorchain/asgardex-electron/pull/2282)

## Update

- [Settings] Merge global and wallet settings to have one place to go [#2152](https://github.com/thorchain/asgardex-electron/issues/2152)

## Fix

- [Pools] `ERC20` filter includes `BNB.ETH` [#2273](https://github.com/thorchain/asgardex-electron/issues/2273)

## Internal

- Update npm dependencies (incl. latest Electron v19.0.3) [#2283](https://github.com/thorchain/asgardex-electron/issues/2283)

# 0.15.1 (2022-05-29)

## Fix

- Swap ETH failed: SENDING A TRANSACTION REQUIRES A SIGNER [#2269](https://github.com/thorchain/asgardex-electron/issues/2269)

# 0.15.0 (2022-05-27)

## Add

- [Ledger] Support ETH/ERC20 [#2255](https://github.com/thorchain/asgardex-electron/issues/2255)

## Fix

- Clicking "upgrade" for rune.eth. Next screen is flickering, and not clickable. [#2261](https://github.com/thorchain/asgardex-electron/issues/2261)

# 0.14.1 (2022-05-07)

## Update

- [PoolDetail] Improve pool details view behavior (loading behavior, error handling, caching data) [#2240](https://github.com/thorchain/asgardex-electron/pull/2240), [#2241](https://github.com/thorchain/asgardex-electron/pull/2241)
- [Swap] Change default slippage tolerance to 3% [#2237](https://github.com/thorchain/asgardex-electron/issues/2237)

## Fix

- [Ledger] White screen with Ledger Terra wallet connected [#2227](https://github.com/thorchain/asgardex-electron/issues/2227)
- [Wallet] Locking wallet at Deposit or Withdraw failed [#2233](https://github.com/thorchain/asgardex-electron/issues/2233)
- [e2e] Testcafe is failing [#750](https://github.com/thorchain/asgardex-electron/issues/750)
- [Swap] Consider fees in swap limit [#2243](https://github.com/thorchain/asgardex-electron/pull/2242)
- [Swap] Recipient keystore address lost [#2244](https://github.com/thorchain/asgardex-electron/issues/2244)
- [Swap] Recipient Ledger address lost [#2252](https://github.com/thorchain/asgardex-electron/issues/2252)

## Internal

- Update `npm` dependencies (04-25-2022) - incl. Electron@18.x, React 18.x, latest xchain-\* etc. [#2228](https://github.com/thorchain/asgardex-electron/issues/2228)

# 0.14.0 (2022-04-23)

## Add

- [Ledger] Support Terra [#2198](https://github.com/thorchain/asgardex-electron/issues/2198)

## Fix

- [Ledger] Address confirmation removes Ledger BNB account [#2221](https://github.com/thorchain/asgardex-electron/issues/2221)
- [Ledger] Address confirmation modal is missing for Ledger THOR [#2222](https://github.com/thorchain/asgardex-electron/issues/2222)
- Update to latest xchain-tc@0.24.1 to include latest out of gas fix [#2220](https://github.com/thorchain/asgardex-electron/pull/2220)

# 0.13.0 (2022-04-19)

## Add

- Support Terra [#2002](https://github.com/thorchain/asgardex-electron/issues/2002)
- [Mimir] Support block height in HALT{XYZ} flags [#2206](https://github.com/thorchain/asgardex-electron/issues/2206)

## Fix

- [History] Fix viewblock url parameters [#2189](https://github.com/thorchain/asgardex-electron/pull/2189)
- Fix: Filter _USD_ pools [#2199](https://github.com/thorchain/asgardex-electron/pull/2199)
- Fix: Total balances in asset overview [#2202](https://github.com/thorchain/asgardex-electron/pull/2202)
- [Swap] Balance of Ledger missing - fee validation failed [#2203](https://github.com/thorchain/asgardex-electron/issues/2203)
- [Deposit] Initial amount value can't be read [#2210](https://github.com/thorchain/asgardex-electron/issues/2210)

# 0.12.3 (2022-03-31)

## Add

- [Shares] Show asym shares in list [#2172](https://github.com/thorchain/asgardex-electron/issues/2172)
- [Wallet] Show total balance [#2178](https://github.com/thorchain/asgardex-electron/pull/2178)
- [Wallet] Show total shares [#2179](https://github.com/thorchain/asgardex-electron/issues/2179)
- [Pools] Manage / show protocol limit [#2173](https://github.com/thorchain/asgardex-electron/issues/2173)
- [Pools] Show Incentive Pendulum [#2184](https://github.com/thorchain/asgardex-electron/issues/2184)

## Update

- Add more slippage options [#2170](https://github.com/thorchain/asgardex-electron/pull/2170) by @WojciechKo, [#2180](https://github.com/thorchain/asgardex-electron/pull/2180)
- Tweak layout of `Swap` / `Deposit` [#2181](https://github.com/thorchain/asgardex-electron/pull/2181)

## Fix

- [Bonds] Removing a node from list breaks the app [#2176](https://github.com/thorchain/asgardex-electron/pull/2176)
- Update default slip tolerance to 1% [#2175](https://github.com/thorchain/asgardex-electron/pull/2175)
- URL to thoryield.com analytics is incorrect [#2182](https://github.com/thorchain/asgardex-electron/issues/2182)

# 0.12.2 (2022-03-25)

## Fix

- BUG: Ledger tx from non-Index0 THOR accounts [#2164](https://github.com/thorchain/asgardex-electron/issues/2164)
- [BCH] Fix Ledger inputs [#2166](https://github.com/thorchain/asgardex-electron/pull/2166)

# 0.12.1 (2022-03-24)

## Add

- ADD: Bond Providers [#2160](https://github.com/thorchain/asgardex-electron/issues/2160)

## Fix

- Fix Ledger THOR [#2158](https://github.com/thorchain/asgardex-electron/issues/2158)

# 0.12.0 (2022-03-22)

## Update

- Resolve: Upgrade `xchain-cosmos|thorchain` and `cosmos-client` (needed for hardfork) [#2150](https://github.com/thorchain/asgardex-electron/pull/2150)

## Breaking change

- [Ledger] Disable THOR for hard-fork temorary [#2154](https://github.com/thorchain/asgardex-electron/issues/2154)

# 0.11.0 (2022-03-19)

## Add

- [Ledger] BCH support [#2133](https://github.com/thorchain/asgardex-electron/pull/2133), [#2136](https://github.com/thorchain/asgardex-electron/pull/2136), [#2149](https://github.com/thorchain/asgardex-electron/pull/2149)

## Fix

- [Ledger] Remove address from memory after rejecting address on device [#2145](https://github.com/thorchain/asgardex-electron/issues/2145)

# 0.10.0 (2022-03-15)

## Add

- [Ledger] DOGE support [#2139](https://github.com/thorchain/asgardex-electron/pull/2139), [#2142](https://github.com/thorchain/asgardex-electron/pull/2142)

## Update

- [Pools] Show APY at pools overview [#2135](https://github.com/thorchain/asgardex-electron/issues/2135)
- Update FR translation 15-03-2022 by @Weyland2093 [#2141](https://github.com/thorchain/asgardex-electron/pull/2141)

## Fix

- [UNBOND] Send ZERO amount [#2134](https://github.com/thorchain/asgardex-electron/issues/2134)
- Fix estimated fees for BTC [#2140](https://github.com/thorchain/asgardex-electron/pull/2140)

# 0.9.1 (2022-03-08)

## Add

- [WalletSettings] Add info in case Ledger is not supported [#2125](https://github.com/thorchain/asgardex-electron/pull/2125)
- Get chain id before initializing TC client [#2127](https://github.com/thorchain/asgardex-electron/pull/2127)

## Fix

- Value to send of `UNBOND` or `CUSTOM` deposit tx does not depends on balances [#2122](https://github.com/thorchain/asgardex-electron/issues/2122)

# 0.9.0 (2022-03-05)

## Add

- [Ledger] LTC support [#2118](https://github.com/thorchain/asgardex-electron/pull/2118), [#2119](https://github.com/thorchain/asgardex-electron/pull/2119)

## Fix

- Get correct LP by switching current `network` [2c8463e](https://github.com/thorchain/asgardex-electron/commit/2c8463e635a291b06896b28de8f7cf49868b6b06)

# 0.8.1 (2022-03-03)

## Add

- [TxModal] Add copy button [#1998](https://github.com/thorchain/asgardex-electron/issues/1998)
- Feature list [#2092](https://github.com/thorchain/asgardex-electron/pull/2092)

## Update

- [Send] Use TxModal [#2096](https://github.com/thorchain/asgardex-electron/pull/2096), [#2097](https://github.com/thorchain/asgardex-electron/pull/2097), [#2098](https://github.com/thorchain/asgardex-electron/pull/2098), [#2099](https://github.com/thorchain/asgardex-electron/pull/2099), [#2100](https://github.com/thorchain/asgardex-electron/pull/2100), [#2101](https://github.com/thorchain/asgardex-electron/pull/2101), [#2102](https://github.com/thorchain/asgardex-electron/pull/2102)
- [Interact] Use TxModal and other improvements [#2104](https://github.com/thorchain/asgardex-electron/pull/2104)
- [Ledger] Rune upgrade: Add ledger tickbox to upgrade process [#2063](https://github.com/thorchain/asgardex-electron/issues/2063)
- Update social links [#2109](https://github.com/thorchain/asgardex-electron/issues/2109)
- [Upgrade] Use TxModal + LedgerConfirmationModal [#2108](https://github.com/thorchain/asgardex-electron/issues/2108)

## Fix

- [Wallet] New generated phrase might be greater than 12 words [#2054](https://github.com/thorchain/asgardex-electron/issues/2054)
- [AssetDetailsView] Maximum update depth exceeded [#2114](https://github.com/thorchain/asgardex-electron/issues/2114)

## Internal

- Upgrade API types + endpoints to latest Midgard v2.5.15 [#2112](https://github.com/thorchain/asgardex-electron/pull/2112)
- Upgrade Electron + TypeScript related dependencies (incl. Node@16.13.0)

# 0.8.0 (2022-02-18)

## Add

- [Ledger] BTC support [#2059](https://github.com/thorchain/asgardex-electron/issues/2059)

## Update

- Handle (confirmed) BTC balances the better way [#2082](https://github.com/thorchain/asgardex-electron/pull/2082)
- [Send] Remove transaction confirmation check [#2072](https://github.com/thorchain/asgardex-electron/issues/2072)
- [Ledger] Disable selecting of slippage tolerance for Ledger/BTC temporary [#2068](https://github.com/thorchain/asgardex-electron/issues/2068)
- Shorten memos [#2052](https://github.com/thorchain/asgardex-electron/issues/2052)
- Re-enable testnet for releases (production) [#2048](https://github.com/thorchain/asgardex-electron/issues/2048)
- Update for RU translation (better translation and fix for typos) by @TreefeedXavier [#2046](https://github.com/thorchain/asgardex-electron/pull/2046)
- Update ERC20 token list to include XDEFI token [#2040](https://github.com/thorchain/asgardex-electron/issues/2040)

## Fix

- [Send] Fix out of gas for RUNE txs [2081](https://github.com/thorchain/asgardex-electron/issues/2081)
- [i18n] Translate pooled [#2047](https://github.com/thorchain/asgardex-electron/issues/2047)
- Pre-build of v0.8.0 throws exception on Windows [#2086](https://github.com/thorchain/asgardex-electron/issues/2086)
- [BTC] Broadcasting a tx to Haskoin might end in 500 error [#2077](https://github.com/thorchain/asgardex-electron/issues/2077)

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
