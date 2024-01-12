import { Secp256k1HdWallet, createMultisigThresholdPubkey, encodeSecp256k1Pubkey, pubkeyToAddress } from "@cosmjs/amino"
import { DirectSecp256k1HdWallet, coins } from "@cosmjs/proto-signing"
import { MsgSendEncodeObject, SignerData, SigningStargateClient, StargateClient, makeMultisignedTx } from "@cosmjs/stargate"
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx"

const rpc = "http://localhost:26657"
// tcp://localhost:26657

const getAliceSignerFromMnemonic = async () => {
    return DirectSecp256k1HdWallet.fromMnemonic("brain vote immense neutral check example meat gold hover quote draft nasty acquire antique all flash trash harbor aerobic moon welcome mutual february sketch", {
        prefix: "migaloo",
    })
}

const runAll = async () => {
    const multisigAccountAddress = "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0";
    console.log("//////////");
    
    const signingInstruction = await (async () => {
        let client = await StargateClient.connect("http://localhost:26657");
        
        const accountOnChain = await client.getAccount(multisigAccountAddress);
        console.log(accountOnChain);

        const msgSend: MsgSend = {
            fromAddress: multisigAccountAddress,
            toAddress: "migaloo18hs8uc8mmyj97esm33e66gk7z859f20rg40fvd",
            amount: coins(1, "uwhale"),
        };
        const msg: MsgSendEncodeObject = {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: msgSend,
        };
        const gasLimit = 200000;
        const fee = {
            amount: coins(2000, "uwhale"),
            gas: gasLimit.toString(),
        };

        return {
            accountNumber: accountOnChain.accountNumber,
            sequence: accountOnChain.sequence,
            chainId: await client.getChainId(),
            msgs: [{
                "value": {
                    "fromAddress": "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
                    "toAddress": "migaloo18hs8uc8mmyj97esm33e66gk7z859f20rg40fvd",
                    "amount": [
                        {
                            "denom": "uwhale",
                            "amount": "1"
                        }
                    ]
                },
                "typeUrl": "/cosmos.bank.v1beta1.MsgSend"
            }],
            fee: fee,
            memo: "",
        };
    })();

    const wallet = await Secp256k1HdWallet.fromMnemonic("solar chronic hundred economy fresh surround gauge arrest fashion goat pizza illness", {
        prefix: "migaloo",
    })

    const accs = await wallet.getAccounts()
    console.log("acs: ", accs);
    

    const wallet2 = await Secp256k1HdWallet.fromMnemonic("erode curtain genius hurry panic arm then afford fantasy ankle fade tag", {
        prefix: "migaloo",
    })
    const [
        [pubkey0, signature0, bodyBytes],
        [pubkey1, signature1],
    ] = await Promise.all(
        [wallet, wallet2].map(async (i) => {
            // Signing environment
            const pubkey = encodeSecp256k1Pubkey((await i.getAccounts())[0].pubkey);
            const address = (await i.getAccounts())[0].address;
            const signingClient = await SigningStargateClient.offline(i);
            const signerData: SignerData = {
                accountNumber: signingInstruction.accountNumber,
                sequence: signingInstruction.sequence,
                chainId: signingInstruction.chainId,
            };
            console.log("sign");
            console.log(address, " ", typeof address);
            console.log(signingInstruction.msgs, " ", typeof signingInstruction.msgs);
            console.log(signingInstruction.fee, " ", typeof signingInstruction.fee);
            console.log(signingInstruction.memo, " ", typeof signingInstruction.memo);
            console.log(signerData);
            console.log("sign");
            const { bodyBytes: bb, signatures } = await signingClient.sign(
                "migaloo10jx4vpu4uddyl7zvy24upy4kzkazxchkcd2xj5",
                [{
                    "value": {
                        "fromAddress": "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
                        "toAddress": "migaloo18hs8uc8mmyj97esm33e66gk7z859f20rg40fvd",
                        "amount": [
                            {
                                "denom": "uwhale",
                                "amount": "1"
                            }
                        ]
                    },
                    "typeUrl": "/cosmos.bank.v1beta1.MsgSend"
                }],
                { amount: [ { amount: '2000', denom: 'uwhale' } ], gas: '200000' },
                "",
                { accountNumber: 13, sequence: 9, chainId: 'test-1' }
            );
            console.log("////////");
            
            console.log(signatures[0]);
            return [pubkey, signatures[0], bb] as const;
        }),
    );

    // From here on, no private keys are required anymore. Any anonymous entity
    // can collect, assemble and broadcast.
    const multisigPubkey = createMultisigThresholdPubkey(
        [pubkey0, pubkey1],
        1,
    );
    const address0 = pubkeyToAddress(pubkey0, "migaloo");
    const address1 = pubkeyToAddress(pubkey1, "migaloo");

    const broadcaster = await StargateClient.connect("http://localhost:26657/");
    console.log("checking");
    console.log(multisigPubkey.value.pubkeys);
    console.log(signingInstruction.sequence);
    console.log(signingInstruction.fee);
    console.log(bodyBytes);
    console.log(typeof bodyBytes);
    console.log(address0);
    console.log(signature0);
    const signedTx = makeMultisignedTx(
        multisigPubkey,
        7,
        signingInstruction.fee,
        bodyBytes,
        new Map<string, Uint8Array>([
            [address0, signature0],
        ]),
    );
    // const result = await broadcaster.broadcastTx(Uint8Array.from(TxRaw.encode(signedTx).finish()));
    // console.log(result);
};

runAll()
