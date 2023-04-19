'use strict';

const EventEmitter = require('events').EventEmitter;
//@ts-ignore
const {promisifyIfFunction} = require('./utils');
//@ts-ignore
import Promise from 'bluebird';
//const promisifyIfFunction = require('./utils').promisifyIfFunction;
const TimeOutError = require('./TimeOutError');
//const CircuitBrokenError = require('../lib/CircuitBrokenError');
const consts = require('./consts');

import {Brakes, defaultOptionsInterface} from './Brakes'
import {CircuitBrokenError} from './CircuitBrokenError';
//import {consts} from "./consts";

//@ts-ignore
const defaultOptions = {
  isFailure: () => true
};

/**
 * Class that can sit on top of a Brakes. It's basically just a pair of primary and fallback Promises you can put on
 * top of a Brake that monitors a common Service (eg: ).
 */
export class Circuit extends EventEmitter {
  constructor(brakes: Brakes, main: Function | undefined, fallback?: ((...args: any[]) => void) | undefined, options?: defaultOptionsInterface) {
    super();

    if (!(brakes instanceof EventEmitter)) {
      throw new Error(consts.NO_BRAKES);
    }
    this['_brakes'] = brakes;

    if (!main || typeof main !== 'function') {
      throw new Error(consts.NO_FUNCTION);
    }
    else if (fallback && typeof fallback !== 'function') {
      if (options) {
          throw new Error(consts.NO_FUNCTION);
        }
      options = fallback;
      fallback = undefined;
    }
    this['_opts'] = Object.assign({}, defaultOptions, options);
    this['_this'] = this['_opts'].this || this;

    this['_serviceCall'] = promisifyIfFunction(main, this['_opts'].isPromise, this['_opts'].isFunction);

    if (typeof fallback != "undefined") {
      this.fallback(fallback, this['_opts'].isPromise, this['_opts'].isFunction);
    }
  }

  exec() {
    this['_brakes'].emit('exec');

    // Save circuit generation to scope so we can compare it
    // to the current generation when a request fails.
    // This prevents failures from bleeding between circuit generations.
    const execGeneration = this['_brakes']._circuitGeneration;

    if (this['_brakes']._circuitOpen) {
      this['_brakes']._stats.shortCircuit();
      if (this['_fallback']) {
        return this['_fallback'].apply(this, arguments);
      }
      else if (this['_brakes']._fallback) {
        return this['_brakes']._fallback.apply(this, arguments);
      }
      return Promise.reject(new CircuitBrokenError(this['_brakes'].name, this['_brakes']._stats._totals, this['_brakes']._opts.threshold));
    }

    const startTime = Date.now();
    //let args:[] = [];
    // we use _execPromise() wrapper on the service call promise
    // to allow us to more easily hook in stats reporting
    return this._execPromise
      .apply(this, arguments as unknown as [])
      .tap(() => this['_brakes'].emit('success', Date.now() - startTime))
      .catch((err: Error) => {
        const endTime = Date.now() - startTime;

        // trigger hook listeners
        if (err instanceof TimeOutError) {
          this['_brakes'].emit('timeout', endTime, err, execGeneration);
        }
        else if (this['_opts'].isFailure(err)) {
          this['_brakes'].emit('failure', endTime, err, execGeneration);
        }
        // if fallback exists, call it upon failure
        // there are no listeners or stats collection for
        // the fallback function. The function is fire-and-forget
        // as far as `Brakes` is concerned
        if (this['_fallback']) {
          return this['_fallback'].apply(this, arguments);
        }
        else if (this['_brakes']._fallback) {
          return this['_brakes']._fallback.apply(this, arguments);
        }

        if (err && err.message && this['_brakes'].name && this['_brakes']._opts.modifyError) {
          err.message = `[Breaker: ${this['_brakes'].name}] ${err.message}`;
        }

        return Promise.reject(err);
      });
  }

  /*
   Execute main service call
   */
  _execPromise() {
    return new Promise((resolve, reject) => {
      // start timeout timer
      const timeoutTimer = setTimeout(() => {
        reject(new TimeOutError(consts.TIMEOUT));
      }, this['_opts'].timeout || this['_brakes']._opts.timeout);

      this['_serviceCall'].apply(this['_this'], arguments).then((result: boolean) => {
        clearTimeout(timeoutTimer);
        resolve(result);
      }).catch((err:Error) => {
        clearTimeout(timeoutTimer);
        reject(err);
      });

      timeoutTimer.unref();
    });
  }

  fallback(func: (...args: any[]) => void, isPromise: boolean, isFunction:boolean) {
    this['_fallback'] = promisifyIfFunction(func, isPromise, isFunction);
    return this['_fallback'];
  }
}

//module.exports = Circuit;
