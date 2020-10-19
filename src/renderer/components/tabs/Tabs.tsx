import React, { useMemo, useState } from 'react'

import { Tabs as ATabs } from 'antd'
import { TabsProps } from 'antd/lib/tabs'

import * as Styled from './Tabs.styles'

type Props = TabsProps & {
  defaultTabIndex?: number
  tabs: { label: React.ReactNode; key: string; content: React.ReactNode }[]
  centerContent?: boolean
  activeTabKey?: string
}

export const Tabs: React.FC<Props> = ({
  tabs,
  defaultTabIndex,
  centerContent,
  activeTabKey: activeTabKeyProp,
  centered = true,
  className,
  tabBarExtraContent
}): JSX.Element => {
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
    <Styled.Tabs
      tabBarExtraContent={tabBarExtraContent}
      className={className}
      centered={centered}
      activeKey={activeTabKeyProp || activeTabKey}>
      {content}
    </Styled.Tabs>
  )
}
