import * as FP from 'fp-ts/lib/function'

export type ConfirmationModalProps = { onSuccess: FP.Lazy<void>; onClose: FP.Lazy<void> }
