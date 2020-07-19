import React, { useMemo, useState } from 'react'

import { Tabs as ATabs } from 'antd'

import * as Styled from './Tabs.styles'

type Props = {
  defaultTabIndex?: number
  tabs: { label: React.ReactNode; key: string; content: React.ReactNode }[]
  centerContent?: boolean
  activeTabKey?: string
}

export const Tabs: React.FC<Props> = ({ tabs, defaultTabIndex, centerContent, ...props }): JSX.Element => {
  const [activeTabKey, setActiveTabKey] = useState(tabs[defaultTabIndex || 0].key)
  const content = useMemo(
    () =>
      tabs.map(({ label, key, content }) => (
        <ATabs.TabPane tab={<Styled.TabLabel onClick={() => setActiveTabKey(key)}>{label}</Styled.TabLabel>} key={key}>
          <Styled.ContentWrapper centerContent={centerContent}>{content}</Styled.ContentWrapper>
        </ATabs.TabPane>
      )),
    [tabs, centerContent]
  )

  return (
    <Styled.Tabs centered={true} activeKey={props.activeTabKey || activeTabKey}>
      {content}
    </Styled.Tabs>
  )
}
