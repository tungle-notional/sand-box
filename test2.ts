import { Coin, DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx"
import { toBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import axios from "axios";

const rpc = "http://localhost:26657"
// tcp://localhost:26657

const getAliceSignerFromMnemonic = async () => {
    return DirectSecp256k1HdWallet.fromMnemonic("brain vote immense neutral check example meat gold hover quote draft nasty acquire antique all flash trash harbor aerobic moon welcome mutual february sketch", {
        prefix: "migaloo",
    })
}

const runAll = async () => {
    const client = await StargateClient.connect(rpc)

    const aliceSigner = await getAliceSignerFromMnemonic()
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice's address from signer", alice)
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "With signing client, chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight()
    )
    console.log("Alice balance after:", await client.getAllBalances(alice))

    const sendAmt: Coin[] = [{ denom: network.nativeDenom, amount: "10" }]

    const fee = getDefaultStdFee()

    // create tx_bytes
    let msgs = [
        {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
                fromAddress: alice,
                toAddress: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
                amount: sendAmt,
            },
        },
    ]
    // sign tx
    let bodyBytes = await signingClient.sign(alice, msgs, fee, "")

    // construct payload with signed tx and broadcast it through API
    let payload = {
        tx_bytes: toBase64(TxRaw.encode(bodyBytes).finish()),
        mode: 'BROADCAST_MODE_SYNC'
    }

    
    let res = await axios.post(network.api + '/cosmos/tx/v1beta1/txs', payload);

    // await signingClient.signAndBroadcast(alice, [msg], { gas: "100000", amount: [{ amount: "1000", denom: "uwhale" }] })

    // console.log("Alice balance before:", await client.getAllBalances(alice))
    // const result = await signingClient. sendTokens(alice, "migaloo1jf65e4zye3jw9phteud8sl5llzwkulumrvzxsr", [{ denom: "uwhale", amount: "1" }], {
    //     amount: [{ denom: "uwhale", amount: "5" }],
    //     gas: "200000",
    // })
    // console.log("Transfer result:", result)
    
    console.log("Alice balance after:", await client.getAllBalances(alice))
}

runAll()

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