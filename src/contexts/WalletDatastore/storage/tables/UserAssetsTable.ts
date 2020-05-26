import { DATA_TYPE } from 'jsstore';
export const UserAssetsTable = {
  name: 'UserAssets',
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    free: {
      dataType: DATA_TYPE.String
    },
    frozen: {
      dataType: DATA_TYPE.String
    },
    locked: {
      dataType: DATA_TYPE.String
    },
    symbol: {
      dataType: DATA_TYPE.String
    }
  }
};
