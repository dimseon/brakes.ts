'use strict';

import {Stats} from "./Stats"; 

const consts = require('./consts');

export class CircuitBrokenError extends Error {
  totals: Stats;
  constructor(name: string, totals: Stats, threshold: number) {
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

//module.exports = CircuitBrokenError;
