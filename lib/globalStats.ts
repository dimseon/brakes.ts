'use strict';

import stream from "stream";
import {Brakes} from "./Brakes";
import {Stats} from "./Stats";

//const stream = require('stream');
const utils = require('../lib/utils');
// import hystrixStream
// interface rawStreamInterface {
//   _read: any; // Update the type of _read as per your specific use case
//   // Add other properties with their respective types here
//   resume: any;
// }
interface rawStream extends stream.Readable {
  _read: (size: number) => void;
  resume: () => this;
}

export class GlobalStats {
  // private _brakesInstances: [];
  // private _rawStream: rawStreamInterface;
  //private _rawStream: stream.Readable;
  private _brakesInstances: any[];
  private _rawStream: rawStream;
  private _hystrixStream: stream.Transform;
  constructor() {
    this._brakesInstances = [];

    // create raw stream
    this._rawStream = new stream.Readable({
      objectMode: true,
      highWaterMark: 0
    });
    this._rawStream._read = () => {};
    this._rawStream.resume();

    // create hysterix stream
    this._hystrixStream = new stream.Transform({
      objectMode: true,
      highWaterMark: 0
    });
    this._hystrixStream._transform = this._transformToHysterix.bind(this);
    this._hystrixStream.resume();

    // connect the streams
    this._rawStream.pipe(this._hystrixStream);
  }

  /* return number of instances being tracked */
  instanceCount() {
    return this._brakesInstances.length;
  }

  /* register a new instance apply listener */
  register(instance: Brakes) {
    this._brakesInstances.push(instance);
    instance["on"]('snapshot', this._globalListener.bind(this));
  }

  /* deregister an existing instance and remove listener */
  deregister(instance: Brakes) {
    const idx = this._brakesInstances.indexOf(instance);
    if (idx > -1) {
      this._brakesInstances.splice(idx, 1);
    }
    instance["removeListener"]('snapshot', this._globalListener.bind(this));
  }

  /* listen to event and pipe to stream */
  _globalListener(stats: Stats) {
    if (!stats || typeof stats !== 'object') return;

    // as of node 12.6 we need to check for readableFlowing as well since the behavior of isPaused() has changed
    if (!this._rawStream.isPaused() || this._rawStream.readableFlowing) {
      this._rawStream.push(JSON.stringify(stats));
    }
  }

  /* transform stats object into hystrix object */
  _transformToHysterix(stats: Stats, encoding: any, callback: any) {
    if (!stats || typeof stats !== 'string') return stats;
    let rawStats;
    let mappedStats;
    try {
      rawStats = JSON.parse(stats);
      mappedStats = utils.mapToHystrixJson(rawStats);
    }
    catch (err) {
      return callback(err);
    }
    finally {
      this._rawStream.resume();
    }
    return callback(null, `data: ${JSON.stringify(mappedStats)}\n\n`);
  }

  /* listen to event and pipe to stream */
  getHystrixStream() {
    return this._hystrixStream;
  }

  /* listen to event and pipe to stream */
  getRawStream() {
    return this._rawStream;
  }
}

//module.exports = new GlobalStats();
