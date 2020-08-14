export type FreezeAction = 'freeze' | 'unfreeze'
export type SendAction = 'send' | FreezeAction

// type guard to check possible values of `FreezeAction`
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
