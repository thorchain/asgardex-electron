import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { ContainerWithDelimeter } from '../containerWithDelimeter'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const ValuesContainer = styled.span`
  text-align: left;
  ${media.md`
    margin: 0 15px 0 0;
  `}

  &:last-child {
    margin: 0;
  }
`

export const InOutValeContainer = styled(ContainerWithDelimeter)`
  font-size: 12px;
  text-transform: uppercase;
  padding: 3px 5px;
  line-height: 22px;
  margin-bottom: 5px;
  background: ${palette('gray', 1)};
  color: ${palette('text', 0)};

  &:first-child {
    border-top-left-radius: 1.7rem;
    border-bottom-left-radius: 1.7rem;
  }

  &:last-child {
    border-top-right-radius: 1.7rem;
    border-bottom-right-radius: 1.7rem;
  }

  ${media.md`
    font-size: 16px;
    padding: 10px 20px;
    &:after {
      content: ' ';
    }
  `}
`

export const InOutValue = styled(ContainerWithDelimeter)``

export const InOutText = styled.span`
  font-size: 14px;
  color: ${palette('text', 2)};
  text-transform: uppercase;
  margin-right: 5px;

  &:first-child {
    margin-right: 10px;
  }
  &:last-child {
    margin-left: 10px;
  }

  ${media.md`
   &:first-child {
    margin-right: 15px;
    }
    &:last-child {
      margin-left: 15px;
    }
  `}

  &:only-child {
    margin: 0;
  }
`

export const AdditionalInfoContainer = styled.span`
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }

  &,
  & .label-wrapper {
    padding: 0;
    color: ${palette('gray', 2)};
    font-size: 14px;
  }
`
