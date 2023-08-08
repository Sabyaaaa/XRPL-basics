// Simulated conversion rate for USD to XRP (1 USD = 0.25 XRP)
const usdToXrpRate = 0.25;

// Function to convert USD to XRP
function convertUsdToXrp(usdAmount) {
  // Ensure the input is a valid number
  const amountInUSD = parseFloat(usdAmount);
  if (isNaN(amountInUSD)) {
    throw new Error('Invalid USD amount');
  }

  // Calculate the equivalent XRP amount
  const xrpAmount = amountInUSD * usdToXrpRate;

  return xrpAmount;
}

// Example usage: Convert 10 USD to XRP
const usdAmount = 10;
const xrpAmount = convertUsdToXrp(usdAmount);
console.log(`${usdAmount} USD is equivalent to ${xrpAmount} XRP`);
