'use strict';
const utils = require('../lib/utils');
const expect = require('chai').expect;
describe('utils', () => {
    describe('hasCallback', () => {
        it('should return true', () => {
            // standard
            let passed = utils.hasCallback(function test(err, cb) {
                cb();
            });
            expect(passed).to.equal(true);
            // anonymous
            passed = utils.hasCallback((err, callback) => {
                callback();
            });
            expect(passed).to.equal(true);
            // anonymous, single arg fat arrow
            passed = utils.hasCallback(callback => callback()
            // eslint-disable-next-line function-paren-newline
            );
            expect(passed).to.equal(true);
            // class
            class FakeClass {
                foo(err, done) {
                    done();
                }
            }
            const fakey = new FakeClass();
            passed = utils.hasCallback(fakey.foo);
            expect(passed).to.equal(true);
        });
        it('should return false', () => {
            // standard
            let passed = utils.hasCallback(function bleh(test) { }); // eslint-disable-line
            expect(passed).to.equal(false);
            // anonymous
            passed = utils.hasCallback(() => { });
            expect(passed).to.equal(false);
            // anonymous, single arg fat arrow
            passed = utils.hasCallback(foo => `${foo}bar`
            // eslint-disable-next-line function-paren-newline
            );
            expect(passed).to.equal(false);
            // class
            class FakeClass {
                foo() { }
            }
            const fakey = new FakeClass();
            passed = utils.hasCallback(fakey.foo);
            expect(passed).to.equal(false);
        });
    });
    describe('getFnArgs', () => {
        it('should return a list of arguments', () => {
            function foo(one, two, three, cb) {
                one = two = three = cb; // eslint-disable-line
            }
            expect(utils.getFnArgs(foo)).to.eql(['one', 'two', 'three', 'cb']);
        });
    });
    describe('mapToHystrixJson', () => {
        it('should map to hysterix compliant object', () => {
            const statsOutput = {
                name: 'defaultBrake',
                group: 'defaultBrakeGroup',
                time: 1463292683341,
                open: false,
                circuitDuration: 100,
                threshold: 0.5,
                waitThreshold: 666,
                stats: {
                    failed: 4,
                    timedOut: 0,
                    shortCircuited: 50,
                    total: 23,
                    latencyMean: 42,
                    successful: 19,
                    percentiles: {
                        0: 100,
                        1: 103,
                        0.25: 100,
                        0.5: 100,
                        0.75: 101,
                        0.9: 101,
                        0.95: 102,
                        0.99: 103,
                        0.995: 103
                    },
                    countFailure: 0,
                    countFailureDeriv: 0,
                    countShortCircuited: 0,
                    countShortCircuitedDeriv: 0,
                    countSuccess: 0,
                    countSuccessDeriv: 0,
                    countTimeout: 0,
                    countTimeoutDeriv: 0,
                    countTotal: 0,
                    countTotalDeriv: 0,
                }
            };
            const stats = statsOutput.stats;
            expect(utils.mapToHystrixJson(statsOutput)).to.eql({
                type: 'HystrixCommand',
                name: 'defaultBrake',
                group: 'defaultBrakeGroup',
                currentTime: 1463292683341,
                isCircuitBreakerOpen: statsOutput.open,
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
                propertyValue_circuitBreakerRequestVolumeThreshold: 666,
                propertyValue_circuitBreakerSleepWindowInMilliseconds: statsOutput.circuitDuration,
                propertyValue_circuitBreakerErrorThresholdPercentage: statsOutput.threshold,
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
                countTotal: 0,
                countSuccess: 0,
                countFailure: 0,
                countTimeout: 0,
                countShortCircuited: 0,
                countTotalDeriv: 0,
                countSuccessDeriv: 0,
                countFailureDeriv: 0,
                countTimeoutDeriv: 0,
                countShortCircuitedDeriv: 0,
            });
        });
    });
    describe('promisifyIfFunction', () => {
        it('should return input if isPromise: true', () => {
            // eslint-disable-next-line no-unused-vars
            function cb(done) { }
            expect(utils.promisifyIfFunction(cb, true)).to.be.equal(cb);
        });
        it('should return input promise', () => {
            function cb() { return Promise.resolve(); }
            expect(utils.promisifyIfFunction(cb, true)).to.be.equal(cb);
        });
        it('should promisify if isFunction: true, even if wrong name of argument', () => {
            // eslint-disable-next-line no-unused-vars
            function cb(foo) { }
            const promisifyIfFunction = utils.promisifyIfFunction(cb, false, true);
            // Hackish... Might only work with bluebird
            expect(promisifyIfFunction.__isPromisified__).to.be.equal(true);
        });
        it('should promisify if is a callback', () => {
            // eslint-disable-next-line no-unused-vars
            function cb(done) { }
            const promisifyIfFunction = utils.promisifyIfFunction(cb);
            expect(promisifyIfFunction.__isPromisified__).to.be.equal(true);
        });
    });
});
