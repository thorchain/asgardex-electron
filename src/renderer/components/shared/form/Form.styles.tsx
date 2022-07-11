import React from 'react'

import * as A from 'antd'
import { FormProps } from 'antd/lib/form'

import { FixmeType } from '../../../types/asgardex'

// Note:
// We do need a custom "InnerForm" wrapper component created by `forwardRef`
// to keep a `ref`, which is needed for `onFinish` callback of `A.Form`
// Since `A.Form` does not support an accessible type for its `ref`, we use `FixmeType`
export const InnerForm = React.forwardRef<typeof A.Form, FormProps & { children: React.ReactNode }>(
  (props, ref: FixmeType) => <A.Form ref={ref} {...props} />
)
