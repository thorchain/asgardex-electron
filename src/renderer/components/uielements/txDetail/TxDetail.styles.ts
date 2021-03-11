import styled from 'styled-components'
import { palette } from 'styled-theme'

const SIDE_MARGIN = '10px'

export const Container = styled.div`
  display: flex;
  align-items: center;
`

export const ContainerWithDelimeter = styled.div`
  display: inline-block;
  position: relative;
  margin: 0 10px;

  &:after {
    content: ' ';
    height: 100%;
    border-right: ${palette('gray', 2)} 1px solid;
    position: absolute;
    top: 0;
    right: -${SIDE_MARGIN};
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
    &:after {
      content: none;
      display: none;
    }
  }
`

export const ValuesContainer = styled.span`
  margin-right: 15px;

  &:last-child {
    margin: 0;
  }
`

export const InOutValeContainer = styled(ContainerWithDelimeter)`
  background: ${palette('gray', 1)};
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-size: 16px;
  line-height: 1.375rem;
  padding: 10px 20px;

  &:first-child {
    border-top-left-radius: 1.7rem;
    border-bottom-left-radius: 1.7rem;
  }

  &:last-child {
    border-top-right-radius: 1.7rem;
    border-bottom-right-radius: 1.7rem;
  }
`

export const InOutValue = styled(ContainerWithDelimeter)``

export const InOutText = styled.span`
  font-size: 0.75rem;
  color: ${palette('text', 2)};

  &:first-child {
    margin-right: 15px;
  }
  &:last-child {
    margin-left: 15px;
  }
  &:only-child {
    margin: 0;
  }
`

export const AdditionalInfoContainer = styled.span`
  &,
  & .label-wrapper {
    padding: 0;
    color: ${palette('gray', 2)};
    font-size: 0.875rem;
  }
`
