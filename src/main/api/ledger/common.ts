/**
 * Derivation path by given `index` (similar to "44'/931'/0'/0/{index}")
 */
export const getPath = (index = 0) => [44, 931, 0, 0, index]
