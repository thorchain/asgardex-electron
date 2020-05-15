import React from 'react'
import { Card, Tag, Button, Typography } from 'antd'
const { Paragraph, Text } = Typography

// dummy data. actuall testnet wallet seed
const mnemonic = 'real debris regret sea auto random agree police uncover gloom cloud ribbon'
const NewMnemonic: React.FC = (): JSX.Element => {
  const wordsList = () => {
    return mnemonic.length ? mnemonic.split(' ') : []
  }
  const handleBtnClick = () => {
    console.log('go to next step...')
  }
  return (
    <>
      <label>Mnemonic HD wallet seed phrase</label>
      <Card>
        {wordsList().map((word: string, i) => (
          <Tag key={i}>{word}</Tag>
        ))}
      </Card>
      <Paragraph className="text-warning my-4 font-weight-bold">
        This is the phrase used to seed your wallet accounts. Record and keep this in a safe place. If you loose access
        to your wallet and backups, your account can <Text strong>only</Text> be recovered using this phrase.
      </Paragraph>
      <Button type="primary" size="large" block onClick={handleBtnClick}>
        Next
      </Button>
    </>
  )
}

export default NewMnemonic
