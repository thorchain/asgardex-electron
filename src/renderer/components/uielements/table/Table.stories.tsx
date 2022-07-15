import { ComponentMeta } from '@storybook/react'

import { Table as Component } from './index'

type DataSource = {
  key: number
  name: string
  age: number
  address: string
}

type Column = {
  title: string
  dataIndex: string
  key: string
}

const dataSource: DataSource[] = [
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

const columns: Column[] = [
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

const Template = () => {
  return <Component dataSource={dataSource} columns={columns} />
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Table'
}

export default meta
