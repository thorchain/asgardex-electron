export type SendAction = 'send' | 'freeze' | 'unfreeze'

// type guard to check possible values of `SendAction`
export const isSendAction = (action: string): action is SendAction => {
  switch (action) {
    case 'send':
    case 'freeze':
    case 'unfreeze':
      return true
    default:
      return false
  }
}
