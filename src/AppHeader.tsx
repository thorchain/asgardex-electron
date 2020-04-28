import React from 'react'

import { Layout, Menu } from 'antd'
import { useHistory } from 'react-router-dom'
import { ClickParam } from 'antd/lib/menu'
import { contentARoute, contentBRoute } from './routes'

type Props = {}

const Header: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const onClickHandler = (p: ClickParam) => {
    if (p.key === '1') {
      history.push(contentARoute.path())
    }
    if (p.key === '2') {
      history.push(contentBRoute.path({ slug: 'another-slug' }))
    }
  }
  return (
    <Layout.Header>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} onClick={onClickHandler}>
        <Menu.Item key="1">Content A</Menu.Item>
        <Menu.Item key="2">Cotnent B</Menu.Item>
      </Menu>
    </Layout.Header>
  )
}

export default Header
