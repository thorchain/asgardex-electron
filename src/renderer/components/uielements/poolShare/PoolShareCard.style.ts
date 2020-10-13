import { Col, Row } from 'antd'
import { ColProps } from 'antd/lib/grid'
import styled from 'styled-components'
import { font, key, palette } from 'styled-theme'

import Label from '../label'

export const ComponentWrapper = styled('div')`
  margin-bottom: 20px;
  background: ${palette('background', 1)};

  border-radius: 2px;
  border: 1px solid ${palette('background', 2)};
`
export const ContentWrapper = styled.div`
  padding: 20px;
`

export const TitleWrapper = styled.div`
  &:after {
    content: '';
    display: block;
    height: 3px;
    width: 100%;
    background: ${palette('gradient', 0)};
  }
`

export const Title = styled(Label).attrs({
  textTransform: 'uppercase',
  align: 'center'
})`
  padding: 20px;
  font-weight: 600;
  font-family: ${font('primary')};
  font-size: 0.875em;
`

export const PoolCardRow = styled(Row)`
  padding: ${key('sizes.gutter.vertical')};
  background: ${palette('background', 1)};
  border-bottom: 1px solid ${palette('background', 2)};
  justify-content: space-around;

  &:last-child {
    border: none;
  }
`

export const AssetName = styled(Label).attrs({
  align: 'center'
})`
  text-transform: uppercase;
  font-weight: 600;
  font-family: ${font('primary')};
  color: ${palette('text', 2)};
  font-size: 1em;
`

export const ValuesWrapper = styled(Col)<
  ColProps & {
    /**
     * Store value as string as A.Col passes ...rest props as is.
     * In this case there is a DOM validation errors in a console
     */
    loading?: string
  }
>`
  width: ${({ loading }) => (loading === 'true' ? '100%' : 'auto')};
  display: ${({ loading }) => (loading === 'true' ? 'flex' : 'initial')};
  padding-top: 20px;
  padding-bottom: 20px;
  .label-wrapper {
    font-size: 1em;
    padding-top: 2px;
    padding-bottom: 2px;

    &:first-child {
      font-weight: bold;
    }
  }
`

export const ValueLabel = styled(Label).attrs({
  align: 'center',
  color: 'dark'
})``

export const ValueSubLabel = styled(Label).attrs({
  align: 'center',
  size: 'normal',
  color: 'light'
})``
