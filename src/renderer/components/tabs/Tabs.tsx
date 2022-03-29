import React, { useMemo, useState } from 'react'

import { Tabs as ATabs } from 'antd'
import { TabsProps } from 'antd/lib/tabs'

import * as Styled from './Tabs.styles'

type Props = TabsProps & {
  defaultTabIndex?: number
  tabs: { label: React.ReactNode; key: string; content: React.ReactNode; disabled?: boolean }[]
  centerContent?: boolean
  activeTabKey?: string
  onChange?: (tabKey: string) => void
}

export const Tabs: React.FC<Props> = ({
  tabs,
  defaultTabIndex,
  defaultActiveKey,
  centerContent,
  activeTabKey: activeTabKeyProp,
  centered = true,
  className,
  tabBarExtraContent,
  destroyInactiveTabPane,
  onChange = (_: string) => {}
}): JSX.Element => {
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || tabs[defaultTabIndex || 0].key)

  const content = useMemo(
    () =>
      tabs.map(({ label, key, content, disabled = false }) => (
        <ATabs.TabPane
          tab={
            <Styled.TabLabel
              active={activeTabKey === key}
              onClick={!disabled ? () => setActiveTabKey(key) : undefined}
              disabled={disabled}>
              {label}
            </Styled.TabLabel>
          }
          key={key}
          disabled={disabled}>
          <Styled.ContentWrapper centerContent={centerContent}>{content}</Styled.ContentWrapper>
        </ATabs.TabPane>
      )),
    [tabs, activeTabKey, centerContent]
  )

  return (
    <Styled.Tabs
      destroyInactiveTabPane={destroyInactiveTabPane}
      tabBarExtraContent={tabBarExtraContent}
      className={className}
      centered={centered}
      onChange={onChange}
      activeKey={activeTabKeyProp || activeTabKey}>
      {content}
    </Styled.Tabs>
  )
}
