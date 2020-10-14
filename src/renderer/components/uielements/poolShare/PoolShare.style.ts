import { Row } from 'antd'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import UILabel from '../label'

export const PoolShareWrapper = styled.div`
  width: 100%;
`

export const CardRow = styled(Row).attrs({
  justify: 'center',
  align: 'top'
})`
  padding: ${key('sizes.gutter.vertical')};
`

export const RedemptionHeader = styled.div`
  &:after {
    content: '';
    display: block;
    height: 3px;
    width: 100%;
    background: ${palette('gradient', 0)};
  }
`

export const RedemptionAsset = styled(UILabel).attrs({
  align: 'center',
  color: 'dark'
})`
  padding: 0;
  font-size: 16px;
  font-weight: 'bold';
  font-family: 'MainFontBold';
`

export const LabelPrimary = styled(UILabel).attrs({
  align: 'center',
  color: 'dark'
})`
  padding: 0 20px;
  font-size: 16px;
  font-weight: 'bold';
  font-family: 'MainFontBold';
`

export const LabelSecondary = styled(UILabel).attrs({
  align: 'center',
  color: 'dark'
})`
  padding: 0 20px;
  font-size: 16px;
  font-family: 'MainFontRegular';
`
