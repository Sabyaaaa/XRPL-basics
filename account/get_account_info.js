// ********** UDEMY **************

'use strict';
const rippleAPI = require('ripple-lib').RippleAPI;

const api = new rippleAPI({
    server:'wss://s.altnet.rippletest.net:51233/' // Public ripple server
});

api.connect().then(() => {
    /* begin custom code ........... */
    const myAddress = 'rJaeYKK27YWzg5FyRQCLQbdgVyiwnbyMgL';
    // const myAddress ='rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn';

    console.log('Getting account info for', myAddress);
    return api.getAccountInfo(myAddress);
}).then(info=>{
    console.log(info);
    console.log("Get account info is DONE");
     /* end custom code ........... */
}).then(()=>{
    return api.disconnect();
}).then(()=>{
    console.log("Operation completed successfully and disconnected");
}).catch(console.error);