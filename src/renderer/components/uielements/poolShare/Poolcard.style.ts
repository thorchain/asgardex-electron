import { Col, Row } from 'antd'
import { ColProps } from 'antd/lib/grid'
import styled from 'styled-components'
import { font, key, palette } from 'styled-theme'

import Label from '../label'

type PoolShareAccent = 'primary' | 'secondary'
type DetailsWrapperProps = { accent?: PoolShareAccent; gradient?: number }

export const PoolCardContainer = styled('div')`
  margin-bottom: 20px;

  &:last-child {
    margin: 0;
  }
`
export const PoolCardContent = styled('div')`
  border-radius: 2px;
  border: 1px solid ${palette('background', 2)};
`

export const PoolCardRow = styled(Row)`
  padding: ${key('sizes.gutter.vertical')};
  border-bottom: 1px solid ${palette('background', 2)};
  justify-content: space-around;

  &:last-child {
    border: none;
  }
`

export const DetailsWrapper = styled('div')<DetailsWrapperProps>`
  justify-content: space-around;

  &:after {
    content: '';
    display: block;
    height: 3px;
    width: 100%;
    background: ${(props) => palette('gradient', props.gradient)};
  }
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
export const SectionHeader = styled(Label).attrs({
  textTransform: 'uppercase',
  align: 'center'
})`
  padding: 0;
  margin-bottom: ${key('sizes.gutter.vertical')};
  font-weight: 600;
  font-family: ${font('primary')};
  font-size: 0.875em;
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
