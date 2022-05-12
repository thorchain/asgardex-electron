// TODO(@veado) Extend`xchain-ethereum` to get derivation path from it
// Similar to default values in `Client` of `xchain-ethereum`
// see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-ethereum/src/client.ts#L121-L125
export const getDerivationPath = (walletIndex: number): string => `m/44'/60'/0'/0/${walletIndex}`
