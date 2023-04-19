'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBrokenError = void 0;
const consts = require('./consts');
class CircuitBrokenError extends Error {
    constructor(name, totals, threshold) {
        super();
        let prefix = '';
        if (name) {
            prefix = `[Breaker: ${name}] `;
        }
        this.message = `${prefix}${consts.CIRCUIT_OPENED} - The percentage of failed requests (${Math.floor((1 - totals["successful"] / totals["total"]) * 100)}%) is greater than the threshold specified (${threshold * 100}%)`;
        this.totals = totals;
        this.name = name;
    }
}
exports.CircuitBrokenError = CircuitBrokenError;
module.exports = CircuitBrokenError;
