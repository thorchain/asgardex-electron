import React from 'react'

import { Card, Tag, Typography } from 'antd'
const { Paragraph, Text } = Typography

const NewMnemonic: React.FC<{ mnemonic: string }> = ({ mnemonic }): JSX.Element => {
  const wordsList = () => {
    return mnemonic.split(' ')
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
    </>
  )
}

export default NewMnemonic
