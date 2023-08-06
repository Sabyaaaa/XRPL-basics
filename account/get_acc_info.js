/** This code prints the account info for a given (pre-defined) account */
'use strict';
console.log("connecting");
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233/' // Public rippled server
});
api.connect().then(() => {
  /* begin custom code ------------------------------------ */
  // const myAddress = 'raQZvxqUfKW3fHjxfSriAgC9Xo3sZDm9zT';
  const myAddress = 'rUcFqeJYyTSc67u7dbMTQbZpYJsz2xLqWt';

  console.log('getting account info for', myAddress);
  return api.getAccountInfo(myAddress);

}).then(info => {
  console.log(info);
  console.log('getAccountInfo done');

  /* end custom code -------------------------------------- */
}).then(() => {
  return api.disconnect();
}).then(() => {
  console.log('done and disconnected.');
}).catch(console.error);

// rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn