/** Implementation of Payment Multisignature */
/** Not working */

const RippleAPI = require('ripple-lib').RippleAPI
const api = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' }) // Public rippled test server

var _fee = 30000; // drops
var sender = 'ryi3sp5xTJbgwidcBbDF46upGEfY1mTqy';
var signer1 = 'raUwh2SBXdXytWuK7a9RVGwGSzXhLdgjBk';
var signer2 = 'r4eKiKWojVgqPkygEtLmAcPHAs3Q5Ju5xU';
var signer3 = 'r4gWgUjX57qKBSHCvTNSaXRL4VAWoG5DFi';
var receiver = 'rhZWywFvhbtmaDA2P54m3Lha8Ba3rHYCTr';

var senderSecret = 'sEd7QH3XnW2VQvfUJ1u6uZ6hFgKyxnL';
var signer1Secret = 'sEdTZFu2PNQXPZyQCbzuGVmjp5BHdF3';
var signer2Secret = 'sEdV4S3Xsxg3XSYkZ1atm6iaSQMwXmk';

var xrpAmount = 99;

// currentSequence is the number of transactions that an account has done
var setSignerList = function (currentSequence) {
    console.log('=== START OF setSignerList() FUNCTION ===');
    // payload for signer list
    var signerListSetTransaction = {
        "Flags": 0,
        "TransactionType": "SignerListSet",
        "Account": sender,
        "SignerQuorum": 3,  // quorum is the number of votes required for the transaction to be successfull.
        "Fee": "10000",
        "Sequence": currentSequence,
        "SignerEntries": [
            {
                "SignerEntry": {
                    "Account": signer1,
                    "SignerWeight": 2 // has the max weight so its vote becomes important
                }
            },
            {
                "SignerEntry": {
                    "Account": signer2,
                    "SignerWeight": 1
                }
            },
            {
                "SignerEntry": {
                    "Account": signer3,
                    "SignerWeight": 1
                }
            }
        ]
    };
    // signer will sign the signer list 
    var signerListSetTxJSON = JSON.stringify(signerListSetTransaction)
    signed_tx = api.sign(signerListSetTxJSON, senderSecret)
    console.log('-------- Signed TX ID : --------', signed_tx.id)
    console.log('-------- SUBMITTING signerListSet TRANSACTION --------')
    api.submit(signed_tx.signedTransaction).then(function (tx_data) {
        console.log(tx_data)

        console.log('   >>  Result: ', tx_data.resultCode)
        console.log('   >>  Message: ', tx_data.resultMessage)
    }).catch(function (e) {
        console.log('-- ERROR SUBMITTING SignerListSet TRANSACTION: ', e)
        process.exit(1)
    })

    console.log('=== END OF setSignerList() FUNCTION ===');

}

// function to make payment and ensure that atleast two signers are signing the transaction
var performPaymentTransaction = function (currentSequence) {
    console.log('=== START OF performPaymentTransaction() FUNCTION ===');
    var paymentTransaction = {
        "TransactionType": "Payment",
        "Account": sender,
        "Fee": _fee + "",
        "Destination": receiver,
        "DestinationTag": "111",
        "Amount": (xrpAmount * 1000 * 1000) + "",
        "Sequence": currentSequence
    }
    // implementation of multisign
    var paymentTxJSON = JSON.stringify(paymentTransaction)
    options = { signAs: signer1 }
    signed_tx1 = api.sign(paymentTxJSON, signer1Secret, options)
    options = { signAs: signer2 }
    signed_tx2 = api.sign(paymentTxJSON, signer2Secret, options)
    signedTxns = []
    signedTxns.push(signed_tx1.signedTransaction)
    signedTxns.push(signed_tx2.signedTransaction)
    combineTxns = api.combine(signedTxns)


    console.log('-------- COMBINED SIGNED TX : --------', combineTxns)
    console.log('-------- SUBMITTING Multisigned TRANSACTION --------')
    api.submit(combineTxns.signedTransaction).then(function (tx_data) {
        console.log(tx_data)
        console.log('   >>  Result: ', tx_data.resultCode)
        console.log('   >>  Message: ', tx_data.resultMessage)
    }).catch(function (e) {
        console.log('-- ERROR SUBMITTING performPaymentTransaction TRANSACTION: ', e)
        process.exit(1)
    })

    console.log('=== END OF performPaymentTransaction() FUNCTION ===');

    api.disconnect().then(() => {
        console.log('=== DISCONNECTED FROM RIPPLE NETWORK ===');
    })

}

api.connect().then(() => {
    api.getAccountInfo(sender).then(function (accountInfo) {
        currentSequence = accountInfo.sequence;
        setSignerList(currentSequence);
        currentSequence = currentSequence + 1
        performPaymentTransaction(currentSequence)
    })



}).then(() => {
}).catch(console.error)


