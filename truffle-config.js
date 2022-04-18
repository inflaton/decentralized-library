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

const fs = require('fs');
const path = require('path')
const LoomTruffleProvider = require('loom-truffle-provider')
const HDWalletProvider = require('truffle-hdwallet-provider')
const { sha256 } = require('js-sha256')
const { CryptoUtils } = require('loom-js')
const { mnemonicToSeedSync } = require('bip39')
const PrivateKeyProvider = require("truffle-privatekey-provider");
const EXPECTING_FILE_ERROR = "Expecting either a private key or a mnemonic file. Refer to the README file for more details."

const mnemonic = fs.readFileSync(".secret").toString().trim();
const dotEnv = require("dotenv-flow");
dotEnv.config();

function getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl) {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8')
  return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
}

function getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl) {
  const mnemonic = fs.readFileSync(mnemonicPath, 'utf-8').toString().trim()
  const seed = mnemonicToSeedSync(mnemonic)
  const privateKeyUint8ArrayFromSeed = CryptoUtils.generatePrivateKeyFromSeed(new Uint8Array(sha256.array(seed)))
  const privateKeyB64 = CryptoUtils.Uint8ArrayToB64(privateKeyUint8ArrayFromSeed)
  return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKeyB64)
}

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
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}}`),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

    loom_dapp_chain: {
      provider: function () {
        const chainId = 'default'
        const writeUrl = 'http://127.0.0.1:46658/rpc'
        const readUrl = 'http://127.0.0.1:46658/query'
        const mnemonicPath = path.join(__dirname, 'loom_mnemonic')
        const privateKeyPath = path.join(__dirname, 'loom_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          loomTruffleProvider.createExtraAccountsFromMnemonic("gravity top burden flip student usage spell purchase hundred improve check genre", 10)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else {
          throw new Error(EXPECTING_FILE_ERROR)
        }
      },
      network_id: '*',
      port: 8545
    },
    loomv2b: {
      provider: function () {
        const chainId = 'loomv2b'
        const writeUrl = 'http://loomv2b.dappchains.com:46658/rpc'
        const readUrl = 'http://loomv2b.dappchains.com:46658/query'
        const mnemonicPath = path.join(__dirname, 'loomv2b_mnemonic')
        const privateKeyPath = path.join(__dirname, 'loomv2b_pk')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else {
          throw new Error(EXPECTING_FILE_ERROR)
        }
      },
      network_id: '12106039541279'
    },
    extdev_plasma_us1: {
      provider: function () {
        const chainId = 'extdev-plasma-us1'
        const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc'
        const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query'
        const mnemonicPath = path.join(__dirname, 'extdev_mnemonic')
        const privateKeyPath = path.join(__dirname, 'extdev_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          // use a dummy mnemonic to create a bunch of accounts we'll use for testing purposes
          loomTruffleProvider.createExtraAccountsFromMnemonic("gravity top burden flip student usage spell purchase hundred improve check genre", 10)

          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else {
          throw new Error(EXPECTING_FILE_ERROR)
        }
      },
      network_id: '9545242630824'
    },
    loom_mainnet: {
      provider: function () {
        const chainId = 'default'
        const writeUrl = 'http://plasma.dappchains.com/rpc'
        const readUrl = 'http://plasma.dappchains.com/query'
        const mnemonicPath = path.join(__dirname, 'mainnet_mnemonic')
        const privateKeyPath = path.join(__dirname, 'mainnet_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else {
          throw new Error(EXPECTING_FILE_ERROR)
        }
      },
      network_id: '*'
    },
    rinkeby: {
      provider: function () {
        if (!process.env.INFURA_API_KEY) {
          throw new Error("INFURA_API_KEY env var not set")
        }
        const mnemonicPath = path.join(__dirname, 'rinkeby_mnemonic')
        const privateKeyPath = path.join(__dirname, 'rinkeby_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const privateKey = readFileSync(path.join(__dirname, 'rinkeby_private_key'), 'utf-8')
          return new PrivateKeyProvider(privateKey, `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 10)
        } else if (fs.existsSync(mnemonicPath)) {
          return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 10)
        } else {
          throw new Error(EXPECTING_FILE_ERROR)
        }
      },
      network_id: 4,
      gasPrice: 15000000001,
      skipDryRun: true
    }

    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
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
