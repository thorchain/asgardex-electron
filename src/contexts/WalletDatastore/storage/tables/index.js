import { DATA_TYPE } from 'jsstore';

export const TransactionTable = {
    name: 'Transactions',
    columns: {
        _id: {
            primaryKey: true,
            autoIncrement: true
        },
        txHash: { dataType: DATA_TYPE.String},  // "4B8C65F00CDFFF0EEE11E670D0522F2A356CC4E4CC8760C60D29B1A2CBB03EED",
        blockHeight: { dataType: DATA_TYPE.Number},  // 66083157
        code: { dataType: DATA_TYPE.Number},  // 0
        confirmBlocks: { dataType: DATA_TYPE.Number},  // 0
        data: { dataType: DATA_TYPE.String},  // null
        fromAddr: { dataType: DATA_TYPE.String},  // "tbnb1u4s75mmna5mwqzkj63vye5ykq4numzrnww4rnu"
        // id: { dataType: DATA_TYPE.},  // 23
        memo: { dataType: DATA_TYPE.String},  // ""
        orderId: { dataType: DATA_TYPE.String},  // null
        proposalId: { dataType: DATA_TYPE.String},  // null
        sequence: { dataType: DATA_TYPE.Number},  // 53
        source: { dataType: DATA_TYPE.Number},  // 0
        timeStamp: { dataType: DATA_TYPE.String},  // "2020-02-13T23:58:21.941Z"
        toAddr: { dataType: DATA_TYPE.String},  // "tbnb1ewk0yypfhuw358qw35rw059jkfym96rt7hrykm"
        txAge: { dataType: DATA_TYPE.Number},  // 6961065
        txAsset: { dataType: DATA_TYPE.String},  // "TCAN-014"
        txFee: { dataType: DATA_TYPE.String},  // "0.00037500"
        txHash: { dataType: DATA_TYPE.String},  // "4B8C65F00CDFFF0EEE11E670D0522F2A356CC4E4CC8760C60D29B1A2CBB03EED"
        txType: { dataType: DATA_TYPE.String},  // "TRANSFER"
        value: { dataType: DATA_TYPE.String},  // "23.00000000"
    }
};
export const AssetTable = {
    name: 'Assets',
    columns: {
        _id: {
            primaryKey: true,
            autoIncrement: true
        },
        free: {
            dataType: DATA_TYPE.Number
        },
        frozen: {
            dataType: DATA_TYPE.Number
        },
        locked: {
            dataType: DATA_TYPE.Number
        },
        symbol: {
            dataType: DATA_TYPE.String
        }
    }
};
export const AccountTable = {
    name: 'Accounts',
    columns: {
        _id: {
            primaryKey: true,
            autoIncrement: true
        },
        address: {
            dataType: DATA_TYPE.String
        },
        // keystore: {
        //     dataType: DATA_TYPE.Object,
        // },
        locked: {
            dataType: DATA_TYPE.Boolean
        },
        pwHash: {
            dataType: DATA_TYPE.String,
        }
    }
};

export const TokenTable = {
    name: 'Tokens',
    columns: {
        _id: {
            primaryKey: true,
            autoIncrement: true
        },
        mintable: {
            dataType: DATA_TYPE.Boolean
        },
        name: {
            dataType: DATA_TYPE.String,
        },
        original_symbol: {
            dataType: DATA_TYPE.String
        },
        symbol: {
            dataType: DATA_TYPE.String,
        },
        owner: {
            dataType: DATA_TYPE.String,
        },
        total_supply: {
            dataType: DATA_TYPE.String
        }
    }
};