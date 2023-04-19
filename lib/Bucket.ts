'use strict';

//import {Stats} from "./Stats";
const consts = require('./consts');
type allowedFields = 'failed' | 'successful' | 'total' | 'shortCircuited' | 'timedOut' | 'requestTimes' | 'cummulativeStats';
const stats = require('./Stats');

export class Bucket {
  failed: number;
  successful: number;
  total: number;
  shortCircuited: number;
  timedOut: number;
  requestTimes: number[];
  cummulativeStats: typeof stats;
  
  constructor(cumStats: typeof stats) {
    this.failed = 0;
    this.successful = 0;
    this.total = 0;
    this.shortCircuited = 0;
    this.timedOut = 0;
    this.requestTimes = [];
    this.cummulativeStats = cumStats;
  }
  
  /* Calculate % of a given field */
  percent(field: allowedFields) {
    // eslint-disable-next-line no-prototype-builtins
    if (!Object(this).hasOwnProperty(field)) {
      throw new Error(consts.INVALID_BUCKET_PROP);
    }

    if (!this.total) {
      return 0;
    }
    //@ts-ignore
    return this[field] / this.total;

  }

  /* Register a failure */
  failure(runTime: number) {
    this.total++;
    this.cummulativeStats["countTotal"]++;
    this.cummulativeStats["countTotalDeriv"]++;
    this.failed++;
    this.cummulativeStats["countFailure"]++;
    this.cummulativeStats["countFailureDeriv"]++;
    this.requestTimes?.push(runTime);
  }

  /* Register a success */
  success(runTime: number) {
    this.total++;
    this.cummulativeStats["countTotal"]++;
    this.cummulativeStats["countTotalDeriv"]++;
    this.successful++;
    this.cummulativeStats["countSuccess"]++;
    this.cummulativeStats["countSuccessDeriv"]++;
    this.requestTimes.push(runTime);
  }

  /* Register a short circuit */
  shortCircuit() {
    this.shortCircuited++;
    this.cummulativeStats["countShortCircuited"]++;
    this.cummulativeStats["countShortCircuitedDeriv"]++;
  }

  /* Register a timeout */
  timeout(runTime: number) {
    this.total++;
    this.cummulativeStats["countTotal"]++;
    this.cummulativeStats["countTotalDeriv"]++;
    this.timedOut++;
    this.cummulativeStats["countTimeout"]++;
    this.cummulativeStats["countTimeoutDeriv"]++;
    this.requestTimes.push(runTime);
  }
}

//module.exports = Bucket;
