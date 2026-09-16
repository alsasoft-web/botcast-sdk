"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotcastSocketClient = exports.BotcastWebhook = exports.BotcastAdminClient = exports.BotcastClient = void 0;
var client_js_1 = require("./client.js");
Object.defineProperty(exports, "BotcastClient", { enumerable: true, get: function () { return client_js_1.BotcastClient; } });
var admin_js_1 = require("./admin.js");
Object.defineProperty(exports, "BotcastAdminClient", { enumerable: true, get: function () { return admin_js_1.BotcastAdminClient; } });
var index_js_1 = require("./webhooks/index.js");
Object.defineProperty(exports, "BotcastWebhook", { enumerable: true, get: function () { return index_js_1.BotcastWebhook; } });
var index_js_2 = require("./socket/index.js");
Object.defineProperty(exports, "BotcastSocketClient", { enumerable: true, get: function () { return index_js_2.BotcastSocketClient; } });
__exportStar(require("./errors.js"), exports);
__exportStar(require("./types/index.js"), exports);
// Default export
const client_js_2 = require("./client.js");
exports.default = client_js_2.BotcastClient;
