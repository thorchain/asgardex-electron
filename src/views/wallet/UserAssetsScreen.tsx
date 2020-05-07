import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Row, Col, Typography, List, Table } from 'antd'
// import Block from '../elements/Block'
// import CircleIcon, { Sizes } from '../elements/CircleIcon/circleIcon'
const { Title } = Typography

// Dummy data
const UserAssets:any = [
  { _id: '1', free: '99', frozen: '11', locked: '21', symbol: 'BNB-JST' },
  { _id: '2', free: '1034', frozen: '38', locked: '101', symbol: 'RUN-1E0' }
]

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const [assets, setAssets] = useState([])
  let history = useHistory()

  async function setData() {
    // const res = await UserAssets.findAll()
    const res = UserAssets // temporary dummy data source
    if (res.length > 0) {
      setAssets(res)
    }
  }
  useEffect(() => {
    setData()
  },[])
  return (
    <Row>
      <Col span={24}>
        <Title level={4}>User Assets</Title>
        <Table dataSource={assets} >
          <Table.Column title="Icon" dataIndex="symbol" key="icon" render={symbol => (
            <>
              {symbol}!!
            </>
          )}/>
          <Table.Column title="Name" dataIndex="name" key="name" />
          <Table.Column title="Symbol" dataIndex="symbol" key="symbol" />
          <Table.Column title="Balance" dataIndex="free" key="balance" />
          <Table.Column title="Value" dataIndex="value" key="value" />
        </Table>

      </Col>
    </Row>
  )
}

export default UserAssetsScreen
