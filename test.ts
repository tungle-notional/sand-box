import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import axios from "axios";
import { SigningStargateClient, StargateClient, makeMultisignedTx } from "@cosmjs/stargate"
import { toBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { AcceptedMessageKeysFilter, ContractExecutionAuthorization, CombinedLimit, ContractMigrationAuthorization, MaxCallsLimit, MaxFundsLimit, AllowAllMessagesFilter, AcceptedMessagesFilter } from "cosmjs-types/cosmwasm/wasm/v1/authz";
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { createMultisigThresholdPubkey, pubkeyToAddress, } from "@cosmjs/amino";

const rpc = "http://localhost:26657"
// tcp://localhost:26657

const getAliceSignerFromMnemonic = async () => {
    return DirectSecp256k1HdWallet.fromMnemonic("solar chronic hundred economy fresh surround gauge arrest fashion goat pizza illness", {
        prefix: "migaloo",
    })
}

const grant = async () => {
    // expire in 2.5 minute
    // // wallet1 is granter
    // createSignBroadcastCatch(wallet1, [grantGenericAuthorizationMsg]);
    const apiUrl = `http://localhost:1317/cosmos/tx/v1beta1`; // Replace with the URL of your Cosmos SDK node
    const aliceSigner = await getAliceSignerFromMnemonic()
    const alice = "migaloo10jx4vpu4uddyl7zvy24upy4kzkazxchkcd2xj5"
    const signingClient = await SigningStargateClient.offline(aliceSigner)

    const fee = getDefaultStdFee()

    const msg = [
        {
            typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
            value: {
                grantee: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
                granter: "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
                grant: {
                    authorization: {
                        typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
                        value: ContractExecutionAuthorization.encode({
                            grants: [
                                {
                                    contract: "migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z",
                                    limit: {
                                        typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
                                        value: CombinedLimit.encode({
                                            callsRemaining: BigInt("100"),
                                            amounts: [
                                                {
                                                    denom: "uwhale",
                                                    amount: "250",
                                                }
                                            ]
                                        }).finish(),
                                    },
                                    filter: {
                                        typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
                                        value: AcceptedMessageKeysFilter.encode({
                                            keys: [
                                                'transfer_price'
                                            ]
                                        }).finish(),
                                    },
                                }
                            ],
                        }).finish(),
                    },
                    expiration: undefined
                }
            },
        }
    ]
    // let mock = {
    //     "typeUrl": "/cosmos.authz.v1beta1.MsgGrant",
    //     "value": {
    //       "grantee": "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
    //       "granter": "migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8",
    //       "grant": {
    //         "authorization": {
    //           "typeUrl": "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
    //           "value": {
    //             "grants": [
    //               {
    //                 "contract": "migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z",
    //                 "limit": {
    //                   "typeUrl": "/cosmwasm.wasm.v1.CombinedLimit",
    //                   "value": {
    //                     "callsRemaining": "100",
    //                     "amounts": [
    //                       {
    //                         "denom": "uwhale",
    //                         "amount": "250"
    //                       }
    //                     ]
    //                   }
    //                 },
    //                 "filter": {
    //                   "typeUrl": "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
    //                   "value": {
    //                     "keys": [
    //                       "transfer_price"
    //                     ]
    //                   }
    //                 }
    //               }
    //             ]
    //           }
    //         }
    //       }
    //     }
    //   };

    // let new_msg = encodeObjectToBytes(mock)

    // let encodedMsg = {
    //     "dataJSON": "{\"chainId\":\"test-1\",\"msgs\":[{\"value\":{\"grantee\":\"migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0\",\"granter\":\"migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8\",\"grant\":{\"authorization\":{\"typeUrl\":\"/cosmwasm.wasm.v1.ContractExecutionAuthorization\",\"value\":{\"0\":10,\"1\":187,\"2\":1,\"3\":10,\"4\":66,\"5\":109,\"6\":105,\"7\":103,\"8\":97,\"9\":108,\"10\":111,\"11\":111,\"12\":49,\"13\":52,\"14\":104,\"15\":106,\"16\":50,\"17\":116,\"18\":97,\"19\":118,\"20\":113,\"21\":56,\"22\":102,\"23\":112,\"24\":101,\"25\":115,\"26\":100,\"27\":119,\"28\":120,\"29\":120,\"30\":99,\"31\":117,\"32\":52,\"33\":52,\"34\":114,\"35\":116,\"36\":121,\"37\":51,\"38\":104,\"39\":104,\"40\":57,\"41\":48,\"42\":118,\"43\":104,\"44\":117,\"45\":106,\"46\":114,\"47\":118,\"48\":99,\"49\":109,\"50\":115,\"51\":116,\"52\":108,\"53\":52,\"54\":122,\"55\":114,\"56\":51,\"57\":116,\"58\":120,\"59\":109,\"60\":102,\"61\":118,\"62\":119,\"63\":57,\"64\":115,\"65\":53,\"66\":56,\"67\":118,\"68\":52,\"69\":56,\"70\":122,\"71\":18,\"72\":52,\"73\":10,\"74\":31,\"75\":47,\"76\":99,\"77\":111,\"78\":115,\"79\":109,\"80\":119,\"81\":97,\"82\":115,\"83\":109,\"84\":46,\"85\":119,\"86\":97,\"87\":115,\"88\":109,\"89\":46,\"90\":118,\"91\":49,\"92\":46,\"93\":67,\"94\":111,\"95\":109,\"96\":98,\"97\":105,\"98\":110,\"99\":101,\"100\":100,\"101\":76,\"102\":105,\"103\":109,\"104\":105,\"105\":116,\"106\":18,\"107\":17,\"108\":8,\"109\":100,\"110\":18,\"111\":13,\"112\":10,\"113\":6,\"114\":117,\"115\":119,\"116\":104,\"117\":97,\"118\":108,\"119\":101,\"120\":18,\"121\":3,\"122\":50,\"123\":53,\"124\":48,\"125\":26,\"126\":63,\"127\":10,\"128\":43,\"129\":47,\"130\":99,\"131\":111,\"132\":115,\"133\":109,\"134\":119,\"135\":97,\"136\":115,\"137\":109,\"138\":46,\"139\":119,\"140\":97,\"141\":115,\"142\":109,\"143\":46,\"144\":118,\"145\":49,\"146\":46,\"147\":65,\"148\":99,\"149\":99,\"150\":101,\"151\":112,\"152\":116,\"153\":101,\"154\":100,\"155\":77,\"156\":101,\"157\":115,\"158\":115,\"159\":97,\"160\":103,\"161\":101,\"162\":75,\"163\":101,\"164\":121,\"165\":115,\"166\":70,\"167\":105,\"168\":108,\"169\":116,\"170\":101,\"171\":114,\"172\":18,\"173\":16,\"174\":10,\"175\":14,\"176\":116,\"177\":114,\"178\":97,\"179\":110,\"180\":115,\"181\":102,\"182\":101,\"183\":114,\"184\":95,\"185\":112,\"186\":114,\"187\":105,\"188\":99,\"189\":101}}}},\"typeUrl\":\"/cosmos.authz.v1beta1.MsgGrant\"}],\"fee\":{\"gas\":\"250000\",\"amount\":[{\"denom\":\"uwhale\",\"amount\":\"0\"}]},\"memo\":\"\"}",
    //     "createBy": "migaloo17g7kwa8qhsp0zptmt0sqtmkc237t7zpnj4gxg2",
    //     "status": "PENDING"
    // }
    // console.log(new_msg);
    // let workedObject = [
    //     {
    //         "typeUrl": "/cosmos.authz.v1beta1.MsgGrant",
    //         "value": {
    //             "grantee": "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
    //             "granter": "migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8",
    //             "grant": {
    //                 "authorization": {
    //                     "typeUrl": "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
    //                     "value": {
    //                         "0": 10,
    //                         "1": 187,
    //                         "2": 1,
    //                         "3": 10,
    //                         "4": 66,
    //                         "5": 109,
    //                         "6": 105,
    //                         "7": 103,
    //                         "8": 97,
    //                         "9": 108,
    //                         "10": 111,
    //                         "11": 111,
    //                         "12": 49,
    //                         "13": 52,
    //                         "14": 104,
    //                         "15": 106,
    //                         "16": 50,
    //                         "17": 116,
    //                         "18": 97,
    //                         "19": 118,
    //                         "20": 113,
    //                         "21": 56,
    //                         "22": 102,
    //                         "23": 112,
    //                         "24": 101,
    //                         "25": 115,
    //                         "26": 100,
    //                         "27": 119,
    //                         "28": 120,
    //                         "29": 120,
    //                         "30": 99,
    //                         "31": 117,
    //                         "32": 52,
    //                         "33": 52,
    //                         "34": 114,
    //                         "35": 116,
    //                         "36": 121,
    //                         "37": 51,
    //                         "38": 104,
    //                         "39": 104,
    //                         "40": 57,
    //                         "41": 48,
    //                         "42": 118,
    //                         "43": 104,
    //                         "44": 117,
    //                         "45": 106,
    //                         "46": 114,
    //                         "47": 118,
    //                         "48": 99,
    //                         "49": 109,
    //                         "50": 115,
    //                         "51": 116,
    //                         "52": 108,
    //                         "53": 52,
    //                         "54": 122,
    //                         "55": 114,
    //                         "56": 51,
    //                         "57": 116,
    //                         "58": 120,
    //                         "59": 109,
    //                         "60": 102,
    //                         "61": 118,
    //                         "62": 119,
    //                         "63": 57,
    //                         "64": 115,
    //                         "65": 53,
    //                         "66": 56,
    //                         "67": 118,
    //                         "68": 52,
    //                         "69": 56,
    //                         "70": 122,
    //                         "71": 18,
    //                         "72": 52,
    //                         "73": 10,
    //                         "74": 31,
    //                         "75": 47,
    //                         "76": 99,
    //                         "77": 111,
    //                         "78": 115,
    //                         "79": 109,
    //                         "80": 119,
    //                         "81": 97,
    //                         "82": 115,
    //                         "83": 109,
    //                         "84": 46,
    //                         "85": 119,
    //                         "86": 97,
    //                         "87": 115,
    //                         "88": 109,
    //                         "89": 46,
    //                         "90": 118,
    //                         "91": 49,
    //                         "92": 46,
    //                         "93": 67,
    //                         "94": 111,
    //                         "95": 109,
    //                         "96": 98,
    //                         "97": 105,
    //                         "98": 110,
    //                         "99": 101,
    //                         "100": 100,
    //                         "101": 76,
    //                         "102": 105,
    //                         "103": 109,
    //                         "104": 105,
    //                         "105": 116,
    //                         "106": 18,
    //                         "107": 17,
    //                         "108": 8,
    //                         "109": 100,
    //                         "110": 18,
    //                         "111": 13,
    //                         "112": 10,
    //                         "113": 6,
    //                         "114": 117,
    //                         "115": 119,
    //                         "116": 104,
    //                         "117": 97,
    //                         "118": 108,
    //                         "119": 101,
    //                         "120": 18,
    //                         "121": 3,
    //                         "122": 50,
    //                         "123": 53,
    //                         "124": 48,
    //                         "125": 26,
    //                         "126": 63,
    //                         "127": 10,
    //                         "128": 43,
    //                         "129": 47,
    //                         "130": 99,
    //                         "131": 111,
    //                         "132": 115,
    //                         "133": 109,
    //                         "134": 119,
    //                         "135": 97,
    //                         "136": 115,
    //                         "137": 109,
    //                         "138": 46,
    //                         "139": 119,
    //                         "140": 97,
    //                         "141": 115,
    //                         "142": 109,
    //                         "143": 46,
    //                         "144": 118,
    //                         "145": 49,
    //                         "146": 46,
    //                         "147": 65,
    //                         "148": 99,
    //                         "149": 99,
    //                         "150": 101,
    //                         "151": 112,
    //                         "152": 116,
    //                         "153": 101,
    //                         "154": 100,
    //                         "155": 77,
    //                         "156": 101,
    //                         "157": 115,
    //                         "158": 115,
    //                         "159": 97,
    //                         "160": 103,
    //                         "161": 101,
    //                         "162": 75,
    //                         "163": 101,
    //                         "164": 121,
    //                         "165": 115,
    //                         "166": 70,
    //                         "167": 105,
    //                         "168": 108,
    //                         "169": 116,
    //                         "170": 101,
    //                         "171": 114,
    //                         "172": 18,
    //                         "173": 16,
    //                         "174": 10,
    //                         "175": 14,
    //                         "176": 116,
    //                         "177": 114,
    //                         "178": 97,
    //                         "179": 110,
    //                         "180": 115,
    //                         "181": 102,
    //                         "182": 101,
    //                         "183": 114,
    //                         "184": 95,
    //                         "185": 112,
    //                         "186": 114,
    //                         "187": 105,
    //                         "188": 99,
    //                         "189": 101
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // ]
    // let packedData = {
    //     "dataJSON": JSON.stringify({
    //         chainId: "test-1",
    //         msgs: msg,
    //         fee: {
    //             gas: "250000",
    //             amount: [{
    //                 denom: "uwhale",
    //                 amount: "0"
    //             }]
    //         },
    //         memo: ""
    //     }),
    //     "createBy": "migaloo17g7kwa8qhsp0zptmt0sqtmkc237t7zpnj4gxg2",
    //     "status": "PENDING"
    // }
    // let newdata = JSON.parse(packedData.dataJSON)
    // console.log(newdata.msgs[0].value.grant);
    // console.log(msg[0].value.grant);
    console.log(alice);
    let signerData = {
        accountNumber: 13,
        sequence: 30,
        chainId: "test-1"
    }
    let { bodyBytes, signatures } = await signingClient.sign(alice, msg, fee, "", signerData)
    // let pubkeys = {
    //     "type": "tendermint/PubKeyMultisigThreshold",
    //     "value": {
    //         "threshold": "1",
    //         "pubkeys": [
    //             {
    //                 "type": "tendermint/PubKeySecp256k1",
    //                 "value": "A3/IPf54vmZxNLqncfbimECO0KsX9YGElfTdYNZF6Gdz"
    //             },
    //             {
    //                 "type": "tendermint/PubKeySecp256k1",
    //                 "value": "AyzsEpUQCfVAzdZCSh2FUgkL+5sv2uLUdn4dSdbhTqvo"
    //             }
    //         ]
    //     }
    // }
    
    let pubkeyss = ["A3/IPf54vmZxNLqncfbimECO0KsX9YGElfTdYNZF6Gdz", "AyzsEpUQCfVAzdZCSh2FUgkL+5sv2uLUdn4dSdbhTqvo"].map((compressedPubkey) => {
        return {
            type: "tendermint/PubKeySecp256k1",
            value: compressedPubkey,
        };
    });
    let multipubkeys = createMultisigThresholdPubkey(pubkeyss, 1);
    const signedTx = makeMultisignedTx(
        multipubkeys,
        30,
        fee,
        bodyBytes,
        new Map([
            [alice, signatures[0]]
        ])
    );
    
    // const broadcaster = await StargateClient.connect(rpc);
    // const result = await broadcaster.broadcastTx(
    //     Uint8Array.from(TxRaw.encode(signedTx).finish())
    // );
    // console.log(result);

    let payload = {
        tx_bytes: toBase64(TxRaw.encode(signedTx).finish()),
        mode: 'BROADCAST_MODE_SYNC',
    }
    // Send the transaction to the REST API
    const response = await axios.post(`${apiUrl}/txs`, payload);
    console.log(response);
};

grant();

const network = {
    provider: "http://localhost:2281",
    api: 'http://localhost:1317',
    bech32Prefix: "whale",
    nativeDenom: "uwhale",
    defaultTxFee: 100,
    defaultGas: 200000,
};

function getDefaultStdFee() {
    return {
        amount: [
            {
                amount: network.defaultTxFee.toString(),
                denom: network.nativeDenom,
            },
        ],
        gas: network.defaultGas.toString(),
    }
}

function encodeObjectToBytes(obj) {
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
            let splitArr = grantCon[key].filter.typeUrl.split(".")
            grantCon[key].filter["value"] = convertStruct(splitArr[splitArr.length-1], lastVal)
        }
    }
    let lastValGrants = obj.value.grant.authorization.value
    delete obj.value.grant.authorization.value
    let splitArr = obj.value.grant.authorization.typeUrl.split(".")
    obj.value.grant.authorization["value"] = convertStruct(splitArr[splitArr.length-1], lastValGrants)
    return obj
}

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

// {
//     "chain_id": "test-1",
//     "fee": {
//         "gas": "250000",
//         "amount": [
//             {
//                 "denom": "uwhale",
//                 "amount": "0"
//             }
//         ]
//     },
//     "msgs": [
//         {
//             "typeUrl": "/cosmos.authz.v1beta1.MsgGrant",
//             "value": {
//               "grantee": "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
//               "granter": "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
//               "grant": {
//                 "authorization": {
//                   "typeUrl": "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
//                   "value": {
//                     "grants": [
//                       {
//                         "contract": "migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z",
//                         "limit": {
//                           "typeUrl": "/cosmwasm.wasm.v1.CombinedLimit",
//                           "value": {
//                             "callsRemaining": "100",
//                             "amounts": [
//                               {
//                                 "denom": "uwhale",
//                                 "amount": "250"
//                               }
//                             ]
//                           }
//                         },
//                         "filter": {
//                           "typeUrl": "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
//                           "value": {
//                             "keys": [
//                               "transfer_price"
//                             ]
//                           }
//                         }
//                       }
//                     ]
//                   }
//                 }
//               }
//             }
//           }
//     ],
//     "memo": ""
// }

// {
//     "chain_id": "test-1",
//     "fee": {
//         "gas": "250000",
//         "amount": [
//             {
//                 "denom": "uosmo",
//                 "amount": "0"
//             }
//         ]
//     },
//     "msgs": [
//         {
//             "type": "cosmos-sdk/MsgUndelegate",
//             "value": {
//                 "delegator_address": "osmo1dkf74alrfzarkac93a5tzrqsfd47juldfgdgxj",
//                 "validator_address": "osmovaloper1083svrca4t350mphfvdfgdgwq9asrs60c6rv0j5",
//                 "amount": {
//                     "denom": "uosmo",
//                     "amount": "100000"
//                 }
//             }
//         }
//     ],
//     "memo": ""
// }

// {
//     "body": {
//       "messages": [
//         {
//           "@type": "/cosmos.bank.v1beta1.MsgSend",
//           "from_address": "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
//           "to_address": "migaloo18hs8uc8mmyj97esm33e66gk7z859f20rg40fvd",
//           "amount": [
//             {
//               "denom": "uwhale",
//               "amount": "1"
//             }
//           ]
//         }
//       ],
//       "memo": "Use your tokens wisely",
//       "timeout_height": "0",
//       "extension_options": [],
//       "non_critical_extension_options": []
//     },
//     "auth_info": {
//       "signer_infos": [],
//       "fee": {
//             "amount": [
//                 {
//                     "denom": "uwhale",
//                     "amount": "2000"
//                 }
//             ],
//         "gas_limit": "200000",
//         "payer": "",
//         "granter": ""
//       }
//     },
//     "signatures": []
//   }