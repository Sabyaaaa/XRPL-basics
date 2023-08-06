"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Create and submit a SignerListSet and multisign a transaction.
 * Reference: https://xrpl.org/multi-signing.html
*/
var xrpl_1 = require("xrpl");
var client = new xrpl_1.Client('wss://s.altnet.rippletest.net:51233');
function multisigning() {
    return __awaiter(this, void 0, void 0, function () {
        var wallet1, wallet2, walletMaster, signerListSet, signerListResponse, accountSet, accountSetTx, tx_blob1, tx_blob2, multisignedTx, submitResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.connect()
                    /*
                     * This wallet creation is for demonstration purposes.
                     * In practice, users generally will not have all keys in one spot,
                     * hence, users need to implement a way to get signatures.
                     */
                ];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, client.fundWallet()];
                case 2:
                    wallet1 = (_a.sent()).wallet;
                    return [4 /*yield*/, client.fundWallet()];
                case 3:
                    wallet2 = (_a.sent()).wallet;
                    return [4 /*yield*/, client.fundWallet()];
                case 4:
                    walletMaster = (_a.sent()).wallet;
                    signerListSet = {
                        TransactionType: 'SignerListSet',
                        Account: walletMaster.classicAddress,
                        SignerEntries: [
                            {
                                SignerEntry: {
                                    Account: wallet1.classicAddress,
                                    SignerWeight: 1,
                                },
                            },
                            {
                                SignerEntry: {
                                    Account: wallet2.classicAddress,
                                    SignerWeight: 1,
                                },
                            },
                        ],
                        SignerQuorum: 2,
                    };
                    return [4 /*yield*/, client.submit(signerListSet, {
                            wallet: walletMaster,
                        })];
                case 5:
                    signerListResponse = _a.sent();
                    console.log('SignerListSet constructed successfully:');
                    console.log(signerListResponse);
                    accountSet = {
                        TransactionType: 'AccountSet',
                        Account: walletMaster.classicAddress,
                        Domain: (0, xrpl_1.convertStringToHex)('example.com'),
                    };
                    return [4 /*yield*/, client.autofill(accountSet, 2)];
                case 6:
                    accountSetTx = _a.sent();
                    console.log('AccountSet transaction is ready to be multisigned:');
                    console.log(accountSetTx);
                    tx_blob1 = wallet1.sign(accountSetTx, true).tx_blob;
                    tx_blob2 = wallet2.sign(accountSetTx, true).tx_blob;
                    multisignedTx = (0, xrpl_1.multisign)([tx_blob1, tx_blob2]);
                    return [4 /*yield*/, client.submit(multisignedTx)];
                case 7:
                    submitResponse = _a.sent();
                    if (submitResponse.result.engine_result === 'tesSUCCESS') {
                        console.log('The multisigned transaction was accepted by the ledger:');
                        console.log(submitResponse);
                        if (submitResponse.result.tx_json.Signers) {
                            console.log("The transaction had ".concat(submitResponse.result.tx_json.Signers.length, " signatures"));
                        }
                    }
                    else {
                        console.log("The multisigned transaction was rejected by rippled. Here's the response from rippled:");
                        console.log(submitResponse);
                    }
                    return [4 /*yield*/, client.disconnect()];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
void multisigning();
