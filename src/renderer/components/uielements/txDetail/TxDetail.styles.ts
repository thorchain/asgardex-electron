import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { TxType as TxTypeUIU } from '../txType'

const SIDE_MARGIN = '10px'

export const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  & > * {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ${media.lg`
    align-items: center;
    flex-direction: row;
    
    & >* {
      margin-bottom: none; 
    }
  `}
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

  &:last-of-type {
    margin-right: 0;
    &:after {
      content: none;
      display: none;
    }
  }
`

export const ValuesContainer = styled.span`
  margin: 0 0 10px 0;

  ${media.md`
    margin: 0 15px 0 0;
  `}

  &:last-child {
    margin: 0;
  }
`

export const InOutValeContainer = styled(ContainerWithDelimeter)`
  background: ${palette('gray', 1)};
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-size: 16px;
  padding: 5px 10px;
  line-height: 1.375rem;

  margin-bottom: 5px;

  ${media.md`
  padding: 10px 20px;
    margin-bottom: 0;
  `}

  &:first-child {
    border-top-left-radius: 1.7rem;
    border-bottom-left-radius: 1.7rem;
  }

  &:last-child {
    border-top-right-radius: 1.7rem;
    border-bottom-right-radius: 1.7rem;
    margin-bottom: 0;
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
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }

  &,
  & .label-wrapper {
    padding: 0;
    color: ${palette('gray', 2)};
    font-size: 0.875rem;
  }
`

export const DateContainer = styled.span`
  margin-left: 20px;
  color: ${palette('text', 0)};

  ${media.lg`
    display: none
   `}
`

export const TxType = styled(TxTypeUIU)`
  align-self: flex-start;
  font-weight: bold;
  ${media.lg`
    display: none
   `}
`

export const ContentContainer = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${media.md`
    display: inline;
  `}
`
