import * as RD from '@devexperts/remote-data-ts'

export type RDStatus = 'initial' | 'pending' | 'error' | 'success'

export const rdStatusOptions: RDStatus[] = ['initial', 'pending', 'error', 'success']

export const getMockRDValueFactory = <L, T>(success: () => T, failure: () => L) => (
  status?: RDStatus
): RD.RemoteData<L, T> => {
  switch (status) {
    case 'initial': {
      return RD.initial
    }
    case 'pending': {
      return RD.pending
    }
    case 'error': {
      return RD.failure(failure())
    }
    case 'success': {
      return RD.success(success())
    }
    default: {
      return RD.failure(failure())
    }
  }
}
