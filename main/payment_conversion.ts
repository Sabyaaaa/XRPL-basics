import { Wallet, Client, Payment } from 'xrpl';
import { ISSUER_WALLET_ETB_CURRENCY, ISSUER_WALLET_ETB_SEED, ISSUER_WALLET_GBP_CURRENCY, ISSUER_WALLET_GBP_SEED, USER_1_SEED, XRPL_NODE } from './0_config';

// Exchange rate data (this is just an example, you need to fetch real-time rates)
const etbToXrpRate = 0.0005;
const xrpToGbpRate = 0.25;

async function performCurrencyConversion() {
    const issuerWalletETB = Wallet.fromSeed(ISSUER_WALLET_ETB_SEED);
    const issuerWalletGBP = Wallet.fromSeed(ISSUER_WALLET_GBP_SEED);
    const userWallet = Wallet.fromSecret(USER_1_SEED);

    const client = new Client(XRPL_NODE);
    await client.connect();

    const etbAmount = 1000; // ETB amount to convert
    const xrpEquivalent = etbAmount * etbToXrpRate;
    const gbpEquivalent = xrpEquivalent * xrpToGbpRate;

    const payment: Payment = {
        TransactionType: "Payment",
        Account: userWallet.classicAddress,
        Destination: issuerWalletGBP.classicAddress,
        DestinationTag: 12345,
        Amount: {
            issuer: issuerWalletGBP.classicAddress,
            currency: ISSUER_WALLET_GBP_CURRENCY,
            value: gbpEquivalent.toFixed(6) // adjust precision as needed
        },
        SendMax: {
            issuer: issuerWalletETB.classicAddress,
            currency: ISSUER_WALLET_ETB_CURRENCY,
            value: etbAmount.toFixed(2) // adjust precision as needed
        }
    };

    const paymentResponse = await client.submit(payment, { autofill: true, wallet: userWallet });

    console.log(paymentResponse);
    process.exit();
}

performCurrencyConversion();
