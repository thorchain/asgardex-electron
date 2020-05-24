import * as BIP39 from 'bip39'
import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Tabs, Steps, Button } from 'antd'
import ImportMnemonicForm from './forms/ImportMnemonicForm'
import NewMnemonic from './NewMnemonic'
import NewMnemonicConfirm from './NewMnemonicConfirm'
import NewMnemonicGenerate from './NewMnemonicGenerate'
const { Title } = Typography
const { Step } = Steps
const { TabPane } = Tabs

const WalletCreate: React.FC = (): JSX.Element => {
  const [step, setStep] = useState(0)
  const [confirmed, setConfirmed] = useState<number>(0)
  const [mnemonic, setMnemonic] = useState<string>('')
  const handleStepConfirm = (num: number) => {
    if (num + 1 > confirmed) setConfirmed(num + 1) // seperate tracking so steps can go back
    setStep(step + 1)
  }
  const handleStepChange = (newStep: number) => {
    if (newStep <= confirmed) setStep(newStep)
  }
  useEffect(() => {
    setMnemonic(BIP39.generateMnemonic())
  }, [])
  return (
    <Row>
      <Col md={{ span: 16, offset: 4 }}>
        <Title level={4}>New Wallet</Title>
        <Tabs defaultActiveKey="1" size="large">
          <TabPane tab="Import" key="1">
            <ImportMnemonicForm />
          </TabPane>
          <TabPane tab="Create" key="2">
            <Steps current={step} onChange={handleStepChange}>
              <Step title="New Mnemonic" />
              <Step title="Confirm Mnemonic" />
              <Step title="Set Encryption" />
            </Steps>
            <div className="steps-content">
              {step === 0 && (
                <>
                  <NewMnemonic mnemonic={mnemonic} />
                  <Button type="primary" size="large" block onClick={() => handleStepConfirm(0)}>
                    Next
                  </Button>
                </>
              )}
              {step === 1 && <NewMnemonicConfirm mnemonic={mnemonic} onConfirm={() => handleStepConfirm(1)} />}
              {step === 2 && <NewMnemonicGenerate mnemonic={mnemonic} />}
            </div>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}
export default WalletCreate
