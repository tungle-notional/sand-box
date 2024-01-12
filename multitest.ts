import {
    createMultisigThresholdPubkey,
    encodeSecp256k1Pubkey,
    pubkeyToAddress,
    Secp256k1HdWallet,
  } from "@cosmjs/amino";
  import { coins } from "@cosmjs/proto-signing";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
  import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { AminoTypes, SigningStargateClient, StargateClient, makeMultisignedTx, makeMultisignedTxBytes } from "@cosmjs/stargate"
import { AcceptedMessageKeysFilter, ContractExecutionAuthorization, CombinedLimit, ContractMigrationAuthorization, MaxCallsLimit, MaxFundsLimit, AllowAllMessagesFilter, AcceptedMessagesFilter } from "cosmjs-types/cosmwasm/wasm/v1/authz";
import { MsgGrant } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import {
    createBankAminoConverters,
  } from '@cosmjs/stargate'
const grant = async () => {
    const multisigAccountAddress = "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0";
    
    // On the composer's machine signing instructions are created.
    // The composer does not need to be one of the signers.
    const signingInstruction = await (async () => {
      const client = await StargateClient.connect("http://localhost:26657");
      let x = await client.getChainId()
      const msgs = [
        {
            typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
            value: {
                grantee: "migaloo1sxpxhzprejg5rgth0k74ws782mw00ten640zl0",
                granter: "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
                grant: {
                    authorization: {
                        typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
                        value: ContractExecutionAuthorization.encode(
                            {
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
                                                        'create_pair'
                                                    ]
                                            }).finish(),
                                        },
                                    }
                                ],
                            }
                        ).finish(),
                    },
                    expiration: undefined
                }
            },
        }
    ]
    // const msgs = [
    //     {
    //         typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    //         value: {
    //             fromAddress: "migaloo17gayusvse9e9espd0ym66eju5jymshsz6etlx0",
    //             toAddress: "migaloo10jx4vpu4uddyl7zvy24upy4kzkazxchkcd2xj5",
    //             amount: [
    //                 {
    //                     denom: "uwhale",
    //                     amount: "1"
    //                 }
    //             ]
    //         }
    //     }
    // ]
      const gasLimit = 200000;
      const fee = {
        amount: coins(2000, "uwhale"),
        gas: gasLimit.toString(),
      };

      return {
        accountNumber: 13,
        sequence: 43,
        chainId: await client.getChainId(),
        msgs: msgs,
        fee: fee,
        memo: "Use your tokens wisely",
      };
    })();

    const [
      [pubkey0, signature0, bodyBytes],
      [pubkey1, signature1],
    ] = await Promise.all(
        ["solar chronic hundred economy fresh surround gauge arrest fashion goat pizza illness",
        "erode curtain genius hurry panic arm then afford fantasy ankle fade tag"].map(async (i) => {
        // Signing environment
        const wallet = await Secp256k1HdWallet.fromMnemonic(i);
        const pubkey = encodeSecp256k1Pubkey((await wallet.getAccounts())[0].pubkey);
        const address = (await wallet.getAccounts())[0].address;
        let aminoTypes = new AminoTypes({})
        
        aminoTypes['register']['/cosmos.authz.v1beta1.MsgGrant'] = {
            aminoType: 'cosmos-sdk/MsgGrant',
            toAmino: ({ grant, grantee, granter }) => ({
                    grant,
                    grantee,
                    granter,
                })
            ,
            fromAmino: ({ grant, grantee, granter }) => {
                // grant.authorization.value = Uint8Array.from(Object.values(grant.authorization.value))
                return MsgGrant.fromPartial({
                    grant,
                    grantee,
                    granter,
                })
            },
        }
        
        const signingClient = await SigningStargateClient.offline(wallet, {
            aminoTypes
        });
        const signerData = {
          accountNumber: signingInstruction.accountNumber,
          sequence: signingInstruction.sequence,
          chainId: signingInstruction.chainId,
        };
        const { bodyBytes: bb, signatures } = await signingClient.sign(
          address,
          signingInstruction.msgs,
          signingInstruction.fee,
          signingInstruction.memo,
          signerData,
        );
        return [pubkey, signatures[0], bb] as const;
      }),
    );

    // From here on, no private keys are required anymore. Any anonymous entity
    // can collect, assemble and broadcast.
    {
      const multisigPubkey = createMultisigThresholdPubkey(
        [pubkey0, pubkey1],
        1,
      );
      const address0 = pubkeyToAddress(pubkey0, "migaloo");
      const address1 = pubkeyToAddress(pubkey1, "migaloo");

      const broadcaster = await StargateClient.connect("http://localhost:26657");
      const signedTx = makeMultisignedTxBytes(
        multisigPubkey,
        signingInstruction.sequence,
        signingInstruction.fee,
        bodyBytes,
        new Map<string, Uint8Array>([
          [address0, signature0],
          [address1, signature1],
        ]),
      );
      // ensure signature is valid
      const result = await broadcaster.broadcastTx(signedTx);
      console.log(result);
    }
  }

  grant()
