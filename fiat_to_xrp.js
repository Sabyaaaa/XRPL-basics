const fetch = require('node-fetch');

// Hypothetical API endpoint to fetch the USD to XRP conversion rate
const apiUrl = 'https://api.example.com/usd-to-xrp';

// Function to fetch the conversion rate from the API
async function getUSDtoXRPConversionRate() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.success) {
      return data.rate; // Return the conversion rate
    } else {
      throw new Error('Failed to fetch conversion rate.');
    }
  } catch (error) {
    throw new Error('Failed to fetch conversion rate: ' + error.message);
  }
}

// Function to convert USD to XRP
async function usdToXrpConversion(usdAmount) {
  // Fetch the conversion rate
  const usdToXrpRate = await getUSDtoXRPConversionRate();

  // Perform the conversion
  const xrpAmount = usdAmount / usdToXrpRate;

  return xrpAmount;
}

// Example usage:
const senderInputUSD = 10;
usdToXrpConversion(senderInputUSD)
  .then((xrpAmount) => {
    console.log(`${senderInputUSD} USD is approximately equal to ${xrpAmount.toFixed(2)} XRP.`);
  })
  .catch((error) => {
    console.error(error.message);
  });
