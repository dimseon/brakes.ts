'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
//const Brakes = require('../lib/Brakes');
//const Promise = require('../lib/Brakes');
const bluebird_1 = require("bluebird");
const Brakes_1 = require("../lib/Brakes");
console.log("Start 00");
const timer = 100;
let successRate = 2;
let iterations = 0;
console.log("Start 01");
function unreliableServiceCall() {
    return new bluebird_1.Promise((resolve, reject) => {
        setTimeout(() => {
            iterations++;
            if (iterations === 10) {
                successRate = 0.6;
            }
            else if (iterations === 100) {
                successRate = 0.1;
            }
            else if (iterations === 200) {
                successRate = 1;
            }
            console.log(successRate);
            if (Math.random() <= successRate) {
                resolve();
                console.log("Resolved");
            }
            else {
                reject();
                console.log("Rejected");
            }
        }, timer);
    });
}
console.log("Start 02");
const brake = new Brakes_1.Brakes(unreliableServiceCall, {
    statInterval: 2500,
    threshold: 0.5,
    circuitDuration: 15000,
    timeout: 250
});
console.log("Before SNAP");
brake['on']('snapshot', (snapshot) => {
    console.log('Running at:', snapshot['stats'].successful / snapshot['stats'].total);
    console.log(snapshot);
});
console.log("After SNAP");
brake['on']('circuitOpen', () => {
    console.log('----------Circuit Opened--------------');
});
console.log("After OPEN");
brake['on']('circuitClosed', () => {
    console.log('----------Circuit Closed--------------');
});
console.log("After CLOSE");
setInterval(() => {
    brake.exec()
        .then(() => {
        console.log('Succesful');
    })
        .catch((err) => {
        console.log('Failure', err || '');
    });
}, 100);
