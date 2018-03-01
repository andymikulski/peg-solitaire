// Only external lib used!
import * as Random from 'random-js';

// Converts a string into a 32bit integer. 
// via https://stackoverflow.com/a/8076436
const hashCode = function (str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var character = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash = hash & hash;
  }
  return hash;
}


export default function provideRNG(seedStr: string) {
  const seedNum = hashCode(seedStr);

  return new Random(Random.engines.mt19937().seed(seedNum));
}
