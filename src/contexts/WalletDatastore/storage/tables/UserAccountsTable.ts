import { DATA_TYPE } from 'jsstore';
export const UserAccountsTable = {
  name: 'UserAccounts',
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    addresses: {
      dataType: DATA_TYPE.Array
    },
    chainName: {
      dataType: DATA_TYPE.String
    },
    networkType: {
      dataType: DATA_TYPE.String
    }
  }
};
