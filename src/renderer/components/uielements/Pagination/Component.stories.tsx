import React from 'react'

import { storiesOf } from '@storybook/react'

import Pagination from './index'

storiesOf('Components/Pagination', module)
  .add('default', () => {
    return (
      <Pagination
        defaultCurrent={6}
        total={250}
        defaultPageSize={5}
        showSizeChanger={false}
        onChange={(no: number) => console.log('page number:', no)}
      />
    )
  })
  .add('empty', () => {
    return (
      <Pagination
        defaultCurrent={1}
        total={1}
        defaultPageSize={5}
        showSizeChanger={false}
        onChange={(no: number) => console.log('page number:', no)}
      />
    )
  })
