export type DataSource = {
  key: number
  name: string
  age: number
  address: string
}

export type Column = {
  title: string
  dataIndex: string
  key: string
}

export const dataSource: DataSource[] = [
  {
    key: 1,
    name: 'Mike',
    age: 32,
    address: '10 Downing Street'
  },
  {
    key: 2,
    name: 'John',
    age: 42,
    address: '10 Downing Street'
  }
]

export const columns: Column[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]
