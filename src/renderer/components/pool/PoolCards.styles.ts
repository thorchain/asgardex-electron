import * as A from 'antd'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { ErrorView as ErrorViewUI } from '../shared/error'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)`
  height: 100%;
`

export const Col = styled(A.Col).attrs({
  span: 12
})`
  margin-bottom: ${ITEM_GAP};

  // For larger views, this removes the margin from the last row of items.
  :nth-last-child(-n + 2) {
    ${media.md`
      margin-bottom: 0px;
    `}
  }

  // Note: we use padding-right instead of margin-right to
  // work with the Ant.Col width-value calculation strategy.
  padding-right: ${ITEM_GAP};

  :nth-child(even) {
    // For smaller views: we do not have any padding-right since
    // are no elements to the right of the cards.
    padding-right: 0px;
    ${media.md`
      // For larger views: we have padding-right since there are
      // elements to the right of the cards.
      padding-right: ${ITEM_GAP};
    `}
  }
`

export const ErrorView = styled(ErrorViewUI)`
  /* height: 100%; */
  /* width: 100%; */
`
