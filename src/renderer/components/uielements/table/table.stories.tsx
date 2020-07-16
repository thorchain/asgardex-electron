import React from 'react'

import { storiesOf } from '@storybook/react'

import { dataSource, columns } from './data'
import Table from './table'

storiesOf('Components/Table', module).add('default', () => {
  return <Table dataSource={dataSource} columns={columns} />
})
