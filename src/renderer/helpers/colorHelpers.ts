export const rgb2hex = (r: number, g: number, b: number) =>
  `#${((r << 16) + (g << 8) + b).toString(16).padStart(6, '0')}`

export const rainbowStop = (h: number) => {
  const f = (n: number, k = (n + h * 12) % 12) => 0.5 - 0.5 * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  return rgb2hex(Math.floor(f(0) * 255), Math.floor(f(8) * 255), Math.floor(f(4) * 255))
}

export const getIntFromName = (str: string): number[] => {
  const inputStr = String(str).toUpperCase()

  const div = 22

  const firstInt = (inputStr.charCodeAt(0) - 'A'.charCodeAt(0)) / div
  const secondInt = inputStr.length > 1 ? (inputStr.charCodeAt(1) - 'A'.charCodeAt(0)) / div : 0

  return [Number(firstInt.toFixed(2)), Number(secondInt.toFixed(2))]
}
