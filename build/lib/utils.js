'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const bluebird_1 = __importDefault(require("bluebird"));
const callbacks = ['cb', 'callback', 'callback_', 'done'];
function hasCallback(fn) {
    const args = getFnArgs(fn);
    if (typeof args[args.length - 1] === "string") {
        const callbackCandidate = args[args.length - 1];
        return callbacks.indexOf(callbackCandidate) > -1;
    }
}
function promisifyIfFunction(fn, isPromise, isFunction) {
    if (isPromise) {
        return fn;
    }
    if (isFunction || hasCallback(fn)) {
        return bluebird_1.default.promisify(fn);
    }
    return fn;
}
/*
 * Return a list arguments for a function
 */
function getFnArgs(fn) {
    const match = fn.toString().match(/^[function\s]?.*?\(([^)]*)\)/);
    let args = '';
    if (!match) {
        const matchSingleArg = fn.toString().match(/^([^)]*) =>/);
        if (matchSingleArg) {
            args = matchSingleArg[1];
        }
    }
    else {
        args = match[1];
    }
    // Split the arguments string into an array comma delimited.
    return args.split(', ')
        .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
        .filter(arg => arg);
}
/*
 * Map a brakes stats object to a hystrix stats object
 */
// interface jsonInterface {
//   stats: any;
//   name: string;
//   group: string;
//   time: string;
//   open: boolean;
// }
function mapToHystrixJson(json) {
    const stats = json.stats;
    return {
        type: 'HystrixCommand',
        name: json.name,
        group: json.group,
        currentTime: json.time,
        isCircuitBreakerOpen: json.open,
        errorPercentage: (stats.total) ? Math.round((1 - stats.successful / stats.total) * 100) : 0,
        errorCount: stats.failed,
        requestCount: stats.total,
        rollingCountBadRequests: 0,
        rollingCountCollapsedRequests: 0,
        rollingCountExceptionsThrown: 0,
        rollingCountFailure: stats.failed,
        rollingCountFallbackFailure: 0,
        rollingCountFallbackRejection: 0,
        rollingCountFallbackSuccess: 0,
        rollingCountResponsesFromCache: 0,
        rollingCountSemaphoreRejected: 0,
        rollingCountShortCircuited: stats.shortCircuited,
        rollingCountSuccess: stats.successful,
        rollingCountThreadPoolRejected: 0,
        rollingCountTimeout: stats.timedOut,
        currentConcurrentExecutionCount: 0,
        latencyExecute_mean: stats.latencyMean,
        latencyExecute: {
            0: stats.percentiles['0'],
            25: stats.percentiles['0.25'],
            50: stats.percentiles['0.5'],
            75: stats.percentiles['0.75'],
            90: stats.percentiles['0.9'],
            95: stats.percentiles['0.95'],
            99: stats.percentiles['0.99'],
            99.5: stats.percentiles['0.995'],
            100: stats.percentiles['1']
        },
        latencyTotal_mean: 15,
        latencyTotal: {
            0: stats.percentiles['0'],
            25: stats.percentiles['0.25'],
            50: stats.percentiles['0.5'],
            75: stats.percentiles['0.75'],
            90: stats.percentiles['0.9'],
            95: stats.percentiles['0.95'],
            99: stats.percentiles['0.99'],
            99.5: stats.percentiles['0.995'],
            100: stats.percentiles['1']
        },
        propertyValue_circuitBreakerRequestVolumeThreshold: json.waitThreshold,
        propertyValue_circuitBreakerSleepWindowInMilliseconds: json.circuitDuration,
        propertyValue_circuitBreakerErrorThresholdPercentage: json.threshold,
        propertyValue_circuitBreakerForceOpen: false,
        propertyValue_circuitBreakerForceClosed: false,
        propertyValue_circuitBreakerEnabled: true,
        propertyValue_executionIsolationStrategy: 'THREAD',
        propertyValue_executionIsolationThreadTimeoutInMilliseconds: 800,
        propertyValue_executionIsolationThreadInterruptOnTimeout: true,
        propertyValue_executionIsolationThreadPoolKeyOverride: null,
        propertyValue_executionIsolationSemaphoreMaxConcurrentRequests: 20,
        propertyValue_fallbackIsolationSemaphoreMaxConcurrentRequests: 10,
        propertyValue_metricsRollingStatisticalWindowInMilliseconds: 10000,
        propertyValue_requestCacheEnabled: false,
        propertyValue_requestLogEnabled: false,
        reportingHosts: 1,
        countTotal: stats.countTotal,
        countSuccess: stats.countSuccess,
        countFailure: stats.countFailure,
        countTimeout: stats.countTimeout,
        countShortCircuited: stats.countShortCircuited,
        countTotalDeriv: stats.countTotalDeriv,
        countSuccessDeriv: stats.countSuccessDeriv,
        countFailureDeriv: stats.countFailureDeriv,
        countTimeoutDeriv: stats.countTimeoutDeriv,
        countShortCircuitedDeriv: stats.countShortCircuitedDeriv,
    };
}
module.exports = {
    callbacks,
    hasCallback,
    promisifyIfFunction,
    getFnArgs,
    mapToHystrixJson
};
