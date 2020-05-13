export const rainbowStop = (val: string) => {
  const h: number = parseFloat(val)
  const f = (n: number, k = (n + h * 12) % 12) => 0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  return rgb2hex(f(0), f(8), f(4))
}

export const rgb2hex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')

export const getIntFromName = (str: string): string[] => {
  const inputStr = String(str).toUpperCase()

  const div = 22

  const firstInt = (inputStr.charCodeAt(0) - 'A'.charCodeAt(0)) / div
  const secondInt = inputStr.length > 1 ? (inputStr.charCodeAt(1) - 'A'.charCodeAt(0)) / div : 0

  return [firstInt.toFixed(2), secondInt.toFixed(2)]
}
