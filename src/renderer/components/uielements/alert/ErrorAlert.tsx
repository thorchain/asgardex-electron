import React from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { AlertProps } from 'antd/lib/alert'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import * as Styled from './ErrorAlert.style'

type Props = Omit<AlertProps, 'description' | 'type' | 'showIcon' | 'icon'> & { descriptions?: string[] }

const ErrorAlert: React.FC<Props> = (props: Props): JSX.Element => {
  const { descriptions } = props

  const description = FP.pipe(
    descriptions,
    O.fromNullable,
    O.map(A.mapWithIndex((i, description) => <Styled.Description key={i}>{description}</Styled.Description>)),
    O.fold(
      () => <></>,
      (descriptionList) => <>{descriptionList}</>
    )
  )

  return <Styled.Alert type="error" showIcon icon={<InfoCircleOutlined />} description={description} {...props} />
}

export default ErrorAlert
