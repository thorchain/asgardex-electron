import { DATA_TYPE } from 'jsstore';
export const UserSettingsTable = {
  name: 'UserSettings',
  columns: {
    _id: {
      primaryKey: true,
      autoIncrement: true
    },
    locked: {
      dataType: DATA_TYPE.Boolean
    },
    pwHash: {
      dataType: DATA_TYPE.String
    },
    theme: {
      dataType: DATA_TYPE.String
    },
    locale: {
      dataType: DATA_TYPE.String
    },
    baseCurrency: {
      dataType: DATA_TYPE.String
    }
  }
};
