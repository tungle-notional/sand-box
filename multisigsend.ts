import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { Secp256k1HdWallet, encodeSecp256k1Pubkey } from "@cosmjs/amino"
import axios from "axios";
import { SigningStargateClient, StargateClient, makeMultisignedTx } from "@cosmjs/stargate"
import { toBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { AcceptedMessageKeysFilter, ContractExecutionAuthorization, CombinedLimit, ContractMigrationAuthorization, MaxCallsLimit, MaxFundsLimit, AllowAllMessagesFilter, AcceptedMessagesFilter } from "cosmjs-types/cosmwasm/wasm/v1/authz";
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { createMultisigThresholdPubkey, pubkeyToAddress, } from "@cosmjs/amino";
import { encode, decode } from "uint8-to-base64";
import { coins } from "@cosmjs/proto-signing";

const rpc = "http://localhost:26657"
// tcp://localhost:26657

const getAliceSignerFromMnemonic = async () => {
    return Secp256k1HdWallet.fromMnemonic("solar chronic hundred economy fresh surround gauge arrest fashion goat pizza illness", {
        prefix: "migaloo",
    })
}

const getBobSignerFromMnemonic = async () => {
    return Secp256k1HdWallet.fromMnemonic("erode curtain genius hurry panic arm then afford fantasy ankle fade tag", {
        prefix: "migaloo",
    })
}

const grant = async () => {
    const apiUrl = `http://localhost:1317/cosmos/tx/v1beta1`; // Replace with the URL of your Cosmos SDK node
    const aliceSigner = await getAliceSignerFromMnemonic()
    const bobSigner = await getBobSignerFromMnemonic()
    let pub = await aliceSigner.getAccounts()
    let bpub = await bobSigner.getAccounts()

    console.log(encodeSecp256k1Pubkey(pub[0].pubkey));
    console.log(encodeSecp256k1Pubkey(bpub[0].pubkey));
    
    const alice = "migaloo10jx4vpu4uddyl7zvy24upy4kzkazxchkcd2xj5"
    const signingClient = await SigningStargateClient.offline(aliceSigner)

    const msg = [
        {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
                toAddress: "migaloo10jx4vpu4uddyl7zvy24upy4kzkazxchkcd2xj5",
                amount: [
                    {
                        denom: "uwhale",
                        amount: "1"
                    }
                ]
            }
        }
    ]
    const gasLimit = 200000;
    const fee = {
        amount: coins(2000, "uwhale"),
        gas: gasLimit.toString(),
      };
    const client = await StargateClient.connect("http://localhost:26657");
      let x = await client.getChainId()
    let { bodyBytes, signatures } = await signingClient.sign(alice, msg, fee, "", {
        accountNumber: 13,
        sequence: 41,
        chainId: x
    })

    
      let pubkey0 = encodeSecp256k1Pubkey((await aliceSigner.getAccounts())[0].pubkey);
      let pubkey1 = encodeSecp256k1Pubkey((await bobSigner.getAccounts())[0].pubkey);

      const multisigPubkey = createMultisigThresholdPubkey(
        [pubkey0, pubkey1],
        1,
      );
    const signedTx = makeMultisignedTx(
        multisigPubkey,
        41,
        fee,
        bodyBytes,
        new Map([
            [alice, signatures[0]]
        ])
    );
    
    const broadcaster = await StargateClient.connect(rpc);
    const result = await broadcaster.broadcastTx(
        Uint8Array.from(TxRaw.encode(signedTx).finish())
    );
    console.log(result);

    // let payload = {
    //     tx_bytes: toBase64(TxRaw.encode(signedTx0).finish()),
    //     mode: 'BROADCAST_MODE_SYNC',
    // }
    // // Send the transaction to the REST API
    // const response = await axios.post(`${apiUrl}/txs`, payload);
    // console.log(response);
};

grant();

const network = {
    provider: "http://localhost:2281",
    api: 'http://localhost:1317',
    bech32Prefix: "whale",
    nativeDenom: "uwhale",
    defaultTxFee: 0,
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
        payer: '',
        granter: ''
    }
}

function encodeObjectToBytes(obj) {
    let grantCon = obj.value.grant.authorization.value.grants
    for (let key in grantCon) {
        if (grantCon[key].limit) {
            let lastVal = grantCon[key].limit.value;
            delete grantCon[key].limit.value
            let splitArr = grantCon[key].limit.typeUrl.split(".")
            grantCon[key].limit["value"] = convertStruct(splitArr[splitArr.length - 1], lastVal)
        }
        if (grantCon[key].filter) {
            let lastVal = grantCon[key].filter.value;
            delete grantCon[key].filter.value
            let splitArr = grantCon[key].filter.typeUrl.split(".")
            grantCon[key].filter["value"] = convertStruct(splitArr[splitArr.length - 1], lastVal)
        }
    }
    let lastValGrants = obj.value.grant.authorization.value
    delete obj.value.grant.authorization.value
    let splitArr = obj.value.grant.authorization.typeUrl.split(".")
    obj.value.grant.authorization["value"] = convertStruct(splitArr[splitArr.length - 1], lastValGrants)
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