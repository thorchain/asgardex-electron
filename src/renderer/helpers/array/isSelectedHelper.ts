const isSelectedFactory = <T extends { selected?: boolean }>(array: T[], keyToCompareWith: keyof T) => (
  targetValue: T[typeof keyToCompareWith]
) => {
  const res: T | undefined = array.find((e) => e[keyToCompareWith] === targetValue)
  return !!res?.selected
}

export { isSelectedFactory }
