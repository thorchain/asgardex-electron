import React from 'react'
import { storiesOf } from '@storybook/react'

import Table from './table'
import { dataSource, columns } from './data'

storiesOf('Components/Table', module).add('default', () => {
  return <Table dataSource={dataSource} columns={columns} />
})
