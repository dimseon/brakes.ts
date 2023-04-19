'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bucket = void 0;
//import {Stats} from "./Stats";
const consts = require('./consts');
const stats = require('./Stats');
class Bucket {
    constructor(cumStats) {
        this.failed = 0;
        this.successful = 0;
        this.total = 0;
        this.shortCircuited = 0;
        this.timedOut = 0;
        this.requestTimes = [];
        this.cummulativeStats = cumStats;
    }
    /* Calculate % of a given field */
    percent(field) {
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
    failure(runTime) {
        var _a;
        this.total++;
        this.cummulativeStats["countTotal"]++;
        this.cummulativeStats["countTotalDeriv"]++;
        this.failed++;
        this.cummulativeStats["countFailure"]++;
        this.cummulativeStats["countFailureDeriv"]++;
        (_a = this.requestTimes) === null || _a === void 0 ? void 0 : _a.push(runTime);
    }
    /* Register a success */
    success(runTime) {
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
    timeout(runTime) {
        this.total++;
        this.cummulativeStats["countTotal"]++;
        this.cummulativeStats["countTotalDeriv"]++;
        this.timedOut++;
        this.cummulativeStats["countTimeout"]++;
        this.cummulativeStats["countTimeoutDeriv"]++;
        this.requestTimes.push(runTime);
    }
}
exports.Bucket = Bucket;
module.exports = Bucket;
