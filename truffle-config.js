/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const PrivateKeyProvider = require("@truffle/hdwallet-provider")
const dotEnv = require("dotenv-flow");
dotEnv.config();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    besu: {
      provider: () => {
        return new PrivateKeyProvider(process.env.BESU_PRIVATE_KEY, "http://localhost:8545");
      },
      network_id: "*",       // Any network (default: none)
    },

    meter: {
      provider: () => {
        return new PrivateKeyProvider(process.env.METER_PRIVATE_KEY,
          "https://rpctest.meter.io");
      },
      network_id: "*",       // Any network (default: none)
    },

    ropsten: {
      provider: () => {
        return new PrivateKeyProvider(process.env.ROPSTEN_PRIVATE_KEY,
          `wss://ropsten.infura.io/ws/v3/${process.env.INFURA_API_KEY}`);
      },
      networkCheckTimeout: 10000,
      network_id: 3,        // Ropsten's id
      gas: 8000000,         // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,// 20 gwei (in wei) (default: 100 gwei)
      timeoutBlocks: 200,   // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true      // Skip dry run before migrations? (default: false for public nets)
    },

    rinkeby: {
      provider: () => {
        return new PrivateKeyProvider(process.env.RINKEBY_PRIVATE_KEY,
          `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_API_KEY}}`);
      },
      networkCheckTimeout: 10000,
      network_id: 4,
      gas: 8000000,         // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,// 20 gwei (in wei) (default: 100 gwei)
      timeoutBlocks: 200,   // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true      // Skip dry run before migrations? (default: false for public nets)
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
