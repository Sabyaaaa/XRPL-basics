/**
 * Use: node transaction.js AMOUNT:FROMADDR:TOADDR:TOTAG 
 *  eg: node transaction.js 10:rXXXXXXX:rXXXXXX:1337
 * To be able to sign the transaction, the object 'wallets'
 * below should contain the secret key for the used from-wallet.
 */

// code not working properly

const RippleAPI = require('ripple-lib').RippleAPI;
const RippleKeypairs = require('ripple-keypairs');
const api = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233/' }) // Public rippled server
//const fetch     = require('node-fetch')

// wallet is a combination of secret : account address
// Account-1 is the sender so we are using its secret and account address
const wallets = {
    'sEdTYQ7Wg1KMbiitJVgj1pkF4F5xRRU': 'rUcFqeJYyTSc67u7dbMTQbZpYJsz2xLqWt',
}

var closedLedger = 0
var fee = 0 // in ripple drops
var startLedger = 0

/* * * * * * * * * * */

var feeLimit = 100 // drops
var ledgerAwait = 5

var argv = process.argv.reverse()[0].split(':')

if (argv.length !== 4) {
    console.log('Invalid # arguments')
    process.exit(1)
}

var payFrom = argv[1]
var payTo = argv[2]
var payTo_tag = parseInt(argv[3])
var xrpAmount = parseFloat(argv[0])

console.log('< PAY ' + xrpAmount + ' XRP FROM ' + payFrom + ' TO ' + payTo + ':' + payTo_tag)

var signed_tx = null
var tx_at_ledger = 0
var tx_result = null

/* * * * * * * * * * */

var _processTransaction = function () {
    var _fee = fee
    if (fee > feeLimit) _fee = feeLimit

    console.log('>> Getting account info for: ', payFrom)
    api.getAccountInfo(payFrom).then(function (accInfo) {
        console.log('<< [getAccountInfo] done, info: ', accInfo)

        // transaction payload
        var transaction = {
            "TransactionType": "Payment",
            "Account": payFrom,
            "Fee": _fee + "",
            "Destination": payTo,
            "DestinationTag": payTo_tag,
            "Amount": (xrpAmount * 1000 * 1000) + "",
            "LastLedgerSequence": closedLedger + ledgerAwait,
            "Sequence": accInfo.sequence
        }

        console.log('===> Transaction: ', transaction)

        var txJSON = JSON.stringify(transaction)
        var secret = Object.keys(wallets)[Object.values(wallets).indexOf(payFrom)];
        console.log('Secret Key for PayFrom: ', secret);


        if (typeof secret === 'undefined') {
            console.log('-- ERROR RETRIEVING SECRET')
            process.exit(1)
        }

        console.log("Sign the transaction");
        // Use ripple-keypairs to derive the keypair from the secret
        // var txJSON = JSON.stringify(transaction);
        // var keypair = RippleKeypairs.deriveKeypair(secret);
        // var signature = RippleKeypairs.sign(txJSON, keypair.privateKey);
        // signed_tx = JSON.parse(txJSON);
        // signed_tx.TxnSignature = signature;
        signed_tx = api.sign(txJSON, secret)
        console.log("Signed successfully");
        tx_at_ledger = closedLedger

        // sign the transaction with either master or standard key of the sender else the transaction will fail
        console.log('===> Signed TX << ID >>: ', signed_tx.id)

        console.log('-------- SUBMITTING TRANSACTION --------')
        // submitting dosen't ensure that the transaction is completed successfully
        api.submit(signed_tx.signedTransaction).then(function (tx_data) {
            console.log(tx_data)
            console.log('   >> [Tentative] Result: ', tx_data.resultCode)
            console.log('   >> [Tentative] Message: ', tx_data.resultMessage)
        }).catch(function (e) {
            console.log('-- ERROR SUBMITTING TRANSACTION: ', e)
            process.exit(1)
        })
    })
}

// closed ledger will confirm whether transaction is successfull or not
var _lastClosedLedger = function (ledgerIndex) {
    var i = parseInt(ledgerIndex)
    if (ledgerIndex > closedLedger) {
        if (startLedger < 1) {
            startLedger = ledgerIndex
        }

        closedLedger = ledgerIndex
        console.log('# LEDGER CLOSED: ', closedLedger)

        if (closedLedger > startLedger + ledgerAwait + 1) {
            console.log('-- TIMEOUT AFTER # LEDGERS (+1): ', ledgerAwait)
            process.exit(1)
        }

        api.getFee().then(function (e) {
            _fee = parseFloat(e) * 1000 * 1000
            if (_fee !== fee) {
                fee = _fee
                console.log('New estimated fee: ', fee)
            }
        })

        if (signed_tx !== null && tx_result === null && (closedLedger - tx_at_ledger) <= ledgerAwait) {
            api.getTransaction(signed_tx.id, {
                minLedgerVersion: tx_at_ledger,
                maxLedgerVersion: closedLedger
            }).then(function (d) {
                console.log('<< TX RESPONSE @ Ledger:' + (closedLedger - tx_at_ledger) + '] >> ', d)
                tx_result = d
                process.exit(0)
            }).catch(function (e, x) {
            })
        } else {
            if (signed_tx !== null && (closedLedger - tx_at_ledger) > ledgerAwait) {
                console.log('TX FAILED')
                process.exit(1)
            }
        }
    }
}

var _bootstrap = function () {
    // establish connection
    api.connection._ws.on('message', function (m) {
        var message = JSON.parse(m)
        if (message.type === 'ledgerClosed') {
            _lastClosedLedger(message.ledger_index)
        } else {
            if (message.type !== 'response') {
                console.log('    # < msg ', message.type)
            }
        }
    })
    // subscribe to the ledger so as to receive ledger updates
    api.connection.request({
        command: 'subscribe',
        accounts: Object.values(wallets)
    })

    api.connection.request({
        command: 'subscribe',
        streams: ['ledger']
    })

    return

} /* end _bootstrap */

api.on('error', (errorCode, errorMessage) => {
    console.log(errorCode + ': ' + errorMessage)
    process.exit(1);
})
api.on('connected', () => {
    console.log('<< connected >>');
})
api.on('disconnected', (code) => {
    console.log('<< disconnected >> code:', code)
    process.exit(1);
})
api.connect().then(() => {
    api.getServerInfo().then(function (server) {
        fee = parseFloat(server.validatedLedger.baseFeeXRP) * 1000 * 1000
        console.log('Server base fee: ', fee)
        _lastClosedLedger(server.validatedLedger.ledgerVersion)
        _bootstrap()

        _processTransaction()
    })
}).then(() => {
}).catch(console.error)