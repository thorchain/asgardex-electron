export const sortedSelected = <T extends { selected?: boolean }>(list: T[], sortByKey: keyof T): T[] => {
  function compare(a: T, b: T) {
    const num1 = a[sortByKey]
    const num2 = b[sortByKey]

    if (num1 && num2 && num1 > num2) {
      return 1
    } else if (num1 && num2 && num1 < num2) {
      return -1
    }

    return 0
  }

  return list.filter((e) => e.selected === true).sort(compare)
}
