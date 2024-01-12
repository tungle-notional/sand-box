import { ContractExecutionAuthorization, ContractMigrationAuthorization, MaxCallsLimit, MaxFundsLimit, CombinedLimit, AllowAllMessagesFilter, AcceptedMessageKeysFilter, AcceptedMessagesFilter } from "cosmjs-types/cosmwasm/wasm/v1/authz";

export const snakeToCamel = (str) =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );

export const convertStruct = (type, value) => {
    switch (type) {
        case "ContractExecutionAuthorization":
            return ContractExecutionAuthorization.encode(value).finish()
        case "ContractMigrationAuthorization":
            return ContractMigrationAuthorization.encode(value).finish()
        case "MaxCallsLimit":
            return MaxCallsLimit.encode(value).finish()
        case "MaxFundsLimit":
            return MaxFundsLimit.encode(value).finish()
        case "CombinedLimit":
            return CombinedLimit.encode(value).finish()
        case "AllowAllMessagesFilter":
            return AllowAllMessagesFilter.encode(value).finish()
        case "AcceptedMessageKeysFilter":
            return AcceptedMessageKeysFilter.encode(value).finish()
        case "AcceptedMessagesFilter":
            return AcceptedMessagesFilter.encode(value).finish()
        default:
            throw "Type not supported"
    }
}

export const convertObjProperties = (obj) => {
    let newObj = {}
    for (const [key, value] of Object.entries(obj)) {
        if (key !== 'msg' && !Array.isArray(value)) {
            const camelCaseKey = snakeToCamel(key)
            if (typeof value === 'object') {
                const newVal = convertObjProperties(value)
                newObj[camelCaseKey] = newVal
                continue
            }
            newObj[camelCaseKey] = value
        } else {
            newObj[key] = value
        }
    }

    return newObj
}

function recursivelyEncodeObjectToBytes(obj) {
    let grantCon = obj.value.grant.authorization.value.grants
    for (let key in grantCon) {
        if (grantCon[key].limit) {
            let lastVal = grantCon[key].limit.value;
            delete grantCon[key].limit.value
            let splitArr = grantCon[key].limit.typeUrl.split(".")
            grantCon[key].limit["value"] = convertStruct(splitArr[splitArr.length-1], lastVal)
        }
        if (grantCon[key].filter) {
            let lastVal = grantCon[key].filter.value;
            delete grantCon[key].filter.value
            let splitArr = grantCon[key].limit.typeUrl.split(".")
            grantCon[key].filter["value"] = convertStruct(splitArr[splitArr.length-1], lastVal)
        }
    }
    let lastValGrants = obj.value.grant.authorization.value
    delete obj.value.grant.authorization.value
    let splitArr = obj.value.grant.authorization.typeUrl.split(".")
    obj.value.grant.authorization["value"] = convertStruct(splitArr[splitArr.length-1], lastValGrants)
    return obj
}

export const convertObjEncode = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
        
    }
}

const runAll = async () => {
    let mock = {
        grantee: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
        granter: "migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8",
        grant: {
            authorization: {
                typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
                value: {
                    grants: [
                        {
                            contract: "migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z",
                            limit: {
                                typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
                                value: {
                                    callsRemaining: BigInt("100"),
                                    amounts: [
                                        {
                                            denom: "uwhale",
                                            amount: "250",
                                        }
                                    ]
                                }
                            },
                            filter: {
                                typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
                                value: {
                                    keys: [
                                        'transfer_price'
                                    ]
                                }
                            },
                        }
                    ],
                }
            },
            expiration: undefined
        }
    }
    const encoder = new TextEncoder();
    let rightMock = {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: {
            grantee: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
            granter: "migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8",
            grant: {
                authorization: {
                    typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
                    value: encoder.encode(JSON.stringify({
                        grants: [
                            {
                                contract: "migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z",
                                limit: {
                                    typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
                                    value: encoder.encode(JSON.stringify({
                                        callsRemaining: "100",
                                        amounts: [
                                            {
                                                denom: "uwhale",
                                                amount: "250",
                                            }
                                        ]
                                    })),
                                },
                                filter: {
                                    typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
                                    value: encoder.encode(JSON.stringify({
                                        keys: [
                                            'transfer_price'
                                        ]
                                    })),
                                },
                            }
                        ],
                    })),
                },
                expiration: undefined
            }
        },
    }
    console.log(rightMock.value.grant)
    convertObjProperties(mock)
}

runAll()
