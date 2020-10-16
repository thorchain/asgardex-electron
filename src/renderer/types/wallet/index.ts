type AccountType = {
  name: string
  address: string
  type: string
}

export type UserAccountType = {
  chainName: string
  accounts: AccountType[]
}
