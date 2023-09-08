// const RippleAPI = require('ripple-lib').RippleAPI;
// const xrpl = require('xrpl')
import { Wallet, Client, AccountSet, AccountSetAsfFlags, TrustSet, TrustSetFlags } from 'xrpl';
import { ISSUER_WALLET_ETB_CURRENCY, ISSUER_WALLET_ETB_SEED, ISSUER_WALLET_GBP_CURRENCY, ISSUER_WALLET_GBP_SEED, USER_1_SEED, XRPL_NODE } from './0_config'
// const api = new RippleAPI({
//     server: 'wss://s.altnet.rippletest.net:51233' // Testnet server
// });

// const secret_Account1 = 'sEdSRUJ3juriToePURnifLMkDSBTcNi';
// const address_Account1 = 'rEJxVWaALpkytpKe9VX29tBFCJ8xRZRyx2';
// const secret_Account2 = 'sEdTZFu2PNQXPZyQCbzuGVmjp5BHdF3';
// const address_Account2 = 'raUwh2SBXdXytWuK7a9RVGwGSzXhLdgjBk';

async function setTrustLine() {

    let issuer_wallet = Wallet.fromSecret(ISSUER_WALLET_GBP_SEED);
    let user_wallet = Wallet.fromSecret(USER_1_SEED);
    //console.log(wallet);
    let client = new Client(XRPL_NODE);
    await client.connect();

    let trustSetTransaction:TrustSet = {
        TransactionType: "TrustSet",
        Account: user_wallet.classicAddress,
        Flags: TrustSetFlags.tfSetNoRipple,
        LimitAmount: {
            issuer: issuer_wallet.classicAddress,
            currency: ISSUER_WALLET_GBP_CURRENCY,
            value: "400000"
        }
    }

    let trustSetResponse = await client.submit(trustSetTransaction, {autofill: true, wallet: user_wallet});

    console.log(trustSetResponse);

}

setTrustLine();

// async function createTrustline() {
//     try {
//         const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
//         results = 'Connecting to testnet....'
//         // operationalResultField.value = results // Use operationalResultField
//         await client.connect()
//         results += '\nConnected.'
//         // operationalResultField.value = results
//         // await api.connect();

//         const trustSet_tx = {
//             "TransactionType": "TrustSet",
//             "Account": address_Account1,
//             "LimitAmount": {
//                 "currency": 'USD',
//                 "issuer": address_Account1,
//                 "value": 100
//             }
//         }
//         const ts_prepared = await client.autofill(trustSet_tx)
//         const ts_signed = operational_wallet.sign(ts_prepared)
//         results += '\nCreating trust line from operational account to standby account...'
//         standbyResultField.value = results
//         const ts_result = await client.submitAndWait(ts_signed.tx_blob)
//         if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
//             results += '\nTrustline established between account \n' +
//                 standbyDestinationField.value + ' \n and account\n' + standby_wallet.address + '.'
//             standbyResultField.value = results
//         } else {
//             results += '\nTrustLine failed. See JavaScript console for details.'
//             document.getElementById('standbyResultField').value = results
//             throw 'Error sending transaction: ${ts_result.result.meta.TransactionResult}'
//         }

//         await client.disconnect();
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// createTrustline();