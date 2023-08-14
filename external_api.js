const xrpl = require("xrpl");

const axios = require("axios");

// In browsers, use a <script> tag. In Node.js, uncomment the following line:
// const xrpl = require('xrpl')
// Wrap code in an async function so we can use await
async function main() {
    // Define the network client
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    const RippleAPI = require('ripple-lib').RippleAPI;

    const api = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' }); // Use an appropriate XRPL server

    async function getXRPBalanceAndConvertToUSD(accountAddress) {

        try {
            await api.connect();

            const accountInfo = await api.getAccountInfo(accountAddress);

            const xrpBalance = parseFloat(accountInfo.xrpBalance);

            // Replace with actual exchange rate retrieval
            // const xrpToUsdExchangeRate = 0.5;
            // const usdEquivalent = xrpBalance * xrpToUsdExchangeRate;
            // Fetch real-time exchange rate from CoinGecko API

            const exchangeRateResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');

            const xrpToUsdExchangeRate = exchangeRateResponse.data.ripple.usd;
            const usdEquivalent = xrpBalance * xrpToUsdExchangeRate;
            console.log(`XRP Balance: ${xrpBalance} XRP`);
            console.log(`Equivalent in USD: $${usdEquivalent.toFixed(2)}`);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            await api.disconnect();
        }
    }
    getXRPBalanceAndConvertToUSD('r4AGCoybiZ2XfjY4nh79AKidSFgg1Bo24A');
    // Account: 'r4AGCoybiZ2XfjY4nh79AKidSFgg1Bo24A',
    // Amount: '22000000',

}

main();