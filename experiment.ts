import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx"

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

    // const msg = {
    //     typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    //     value: MsgSend.fromPartial({
    //       fromAddress: alice,
    //       toAddress: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
    //       amount: [{ denom: "uwhale", amount: "1" }],
    //     }),
    //   };

    let data = {
        // grants: [
        //     {
        //         // contract: 'migaloo14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s58v48z',
        //         // limit: {
        //         //     typeUrl: '/cosmwasm.wasm.v1.CombinedLimit',
        //         //     value: Buffer.from(JSON.stringify({
        //         //         calls_remaining: 1000,
        //         //         amounts: [
        //         //             {
        //         //                 denom: 'uwhale',
        //         //                 amount: 250
        //         //             }
        //         //         ]
        //         //     }))
        //         // },
        //         // filter: {
        //         //     typeUrl: '/cosmwasm.wasm.v1.AcceptedMessageKeysFilter',
        //         //     value: Buffer.from(JSON.stringify({
        //         //         keys: [
        //         //             'transfer_price'
        //         //         ]
        //         //     }))
        //         // }
        //     }
        // ]
    }

    const msg = {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: MsgGrant.fromPartial({
            grantee: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
            granter: "migaloo1s5898aa2tj0yaccg3xwewv3dft3q5nf8x7fvr8",
            grant: {
                authorization: {
                    typeUrl: '/cosmwasm.wasm.v1.ContractExecutionAuthorization',
                    value: Buffer.from(JSON.stringify(data))
                },
                // expiration: null
            }
        }),
    }
    
    await signingClient.signAndBroadcast(alice, [msg], { gas: "100000", amount: [{ amount: "1000", denom: "uwhale" }] })

    // console.log("Alice balance before:", await client.getAllBalances(alice))
    // const result = await signingClient. sendTokens(alice, "migaloo1jf65e4zye3jw9phteud8sl5llzwkulumrvzxsr", [{ denom: "uwhale", amount: "1" }], {
    //     amount: [{ denom: "uwhale", amount: "5" }],
    //     gas: "200000",
    // })
    // console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
}

runAll()
