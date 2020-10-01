import styled from 'styled-components'

import UIHeadline from '../../../uielements/headline'

type TableHeadlineProps = {
  isDesktop: boolean
}

export const TableHeadline = styled(UIHeadline)`
  padding: 40px 0 20px 0;
  width: 100%;
  text-align: ${({ isDesktop }: TableHeadlineProps) => (isDesktop ? 'left' : 'center')};
`
