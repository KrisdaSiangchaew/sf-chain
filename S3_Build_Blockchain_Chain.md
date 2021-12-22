# Section 3. Build the Blockchain - Chain

# 1. create a blockchain class
Create the `Blockchain` that creates a chain based on the `Block` class:
Create blockchain.js

blockchain.js:
```
const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    const block = Block.mineBlock(this.chain[this.chain.length-1], data);
    this.chain.push(block);
    return block;
  }
}

module.exports = Blockchain;
```

# 2. Test the blockchain
Test the `Blockchain` class:
Create blockchain.test.js:

```
const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
  let bc;
  beforeEach(() => {
    bc = new Blockchain();
  });

  it('starts with the genesis block', () => {
	  expect(bc.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', () => {
    const data = 'foo';
    bc.addBlock(data);
    expect(bc.chain[bc.chain.length-1].data).toEqual(data);
  });
});

```
$ npm run test

# 3. Chain validation
Chain validation ensures that incoming chains are not corrupt once there are multiple contributors to the blockchain. To validate a chain, make sure it starts with the genesis block. Also, ensure that its hashes are generated properly.

In the `Blockchain` class, add an `isValidChain` method:
```
isValidChain(chain) {
  if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
  for (let i=1; i<chain.length; i++) {
    const block = chain[i];
    const lastBlock = chain[i-1];
    if (
      block.lastHash !== lastBlock.hash ||
      block.hash !== Block.blockHash(block)
    ) {
      return false;
    }
  }
  return true;
}
```

This method depends on a `static blockHash` function in the `Block` class. This will generate the hash of a block based only on its instance. In block.js, in the `Block` class:
```
static blockHash(block) {
	const { timestamp, lastHash, data } = block;
  return Block.hash(timestamp, lastHash, data);
}
```

# 4. Test chain validation
Test Chain Validation. In blockchain.test.js, add a second blockchain instance:
```
let bc, bc2;
…
bc = new Blockchain();
bc2 = new Blockchain();
```

Add new unit tests:
```
it('validates a valid chain', () => {
	bc2.addBlock('foo');
	expect(bc.isValidChain(bc2.chain)).toBe(true);
});
it('invalidates a chain with a corrupt genesis block', () => {
	bc2.chain[0].data = 'Bad data';
  expect(bc.isValidChain(bc2.chain)).toBe(false);
});

it('invalidates a corrupt chain', () => {
  bc2.addBlock('foo');
  bc2.chain[1].data = 'Not foo';
  expect(bc.isValidChain(bc2.chain)).toBe(false);
});
```
$ npm run test

# 5. Replace chain
If another contributor to a blockchain submits a valid chain, replace the current chain with the incoming one. Only replace chains that are actually longer than the current chain. Handle this with a `replaceChain` function in the `Blockchain` class:

```
replaceChain(newChain) {
  if (newChain.length <= this.chain.length) {
    console.log('Received chain is not longer than the current chain.');
    return;
  } else if (!this.isValidChain(newChain)) {
    console.log('The received chain is not valid.');
    return;
  }

  console.log('Replacing blockchain with the new chain.');
  this.chain = newChain;
}
```

# 6. Test chain replacement
Test the new chain replacement functionality. In blockchain.test.js:
```
it('replaces the chain with a valid chain', () => {
	bc2.addBlock('goo');
  bc.replaceChain(bc2.chain);
  expect(bc.chain).toEqual(bc2.chain);
});

it('does not replace the chain with one of less than or equal length', () => {
	bc.addBlock('foo');
  bc.replaceChain(bc2.chain);
  expect(bc.chain).not.toEqual(bc2.chain);
});
```
$ npm run test
