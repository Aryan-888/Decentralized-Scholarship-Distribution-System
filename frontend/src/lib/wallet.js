import { 
  isConnected, 
  requestAccess,
  signTransaction,
  getAddress
} from '@stellar/freighter-api';

// Stellar SDK imports for transaction handling
const StellarSdk = require('stellar-sdk');

// Network configuration
const NETWORKS = {
  testnet: {
    name: 'Testnet',
    passphrase: StellarSdk.Networks.TESTNET,
    server: 'https://horizon-testnet.stellar.org'
  },
  mainnet: {
    name: 'Mainnet',
    passphrase: StellarSdk.Networks.PUBLIC,
    server: 'https://horizon.stellar.org'
  }
};

export class FreighterWallet {
  static async isAvailable() {
    try {
      const result = await isConnected();
      return result.isConnected;
    } catch (error) {
      console.error('Freighter not available:', error);
      return false;
    }
  }

  static async connect() {
    try {
      // Check if Freighter is available
      const available = await this.isAvailable();
      if (!available) {
        throw new Error('Freighter wallet is not installed. Please install the Freighter extension.');
      }

      // Request access to the wallet
      await requestAccess();

      // Get the public key
      const publicKeyResult = await getAddress();
      
      if ('error' in publicKeyResult) {
        throw new Error(publicKeyResult.error);
      }

      // Get account info from Stellar network
      const accountInfo = await this.getAccountInfo(publicKeyResult.address);

      const walletInfo = {
        publicKey: publicKeyResult.address,
        isConnected: true,
        isAllowed: true,
        balance: accountInfo?.balance || '0',
        accountExists: !!accountInfo
      };

      this.saveWalletInfo(walletInfo);
      return walletInfo;
    } catch (error) {
      console.error('Failed to connect to Freighter:', error);
      throw error;
    }
  }

  static async getPublicKey() {
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        return null;
      }

      const result = await getAddress();
      if ('error' in result) {
        return null;
      }

      return result.address;
    } catch (error) {
      console.error('Failed to get public key:', error);
      return null;
    }
  }

  static async disconnect() {
    this.clearWalletInfo();
    console.log('Wallet disconnected. To fully disconnect from Freighter, please use the Freighter extension directly');
  }

  static async getAccountInfo(publicKey, network = 'testnet') {
    try {
      const server = new StellarSdk.Horizon.Server(NETWORKS[network].server);
      const account = await server.loadAccount(publicKey);
      
      // Get XLM balance
      const xlmBalance = account.balances.find(balance => 
        balance.asset_type === 'native'
      );

      return {
        accountId: account.accountId(),
        sequence: account.sequenceNumber(),
        balance: xlmBalance ? xlmBalance.balance : '0',
        balances: account.balances,
        subentryCount: account.subentryCount,
        thresholds: account.thresholds
      };
    } catch (error) {
      if (error.response?.status === 404) {
        // Account doesn't exist yet
        return null;
      }
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  static async sendPayment({ 
    destinationId, 
    amount, 
    memo = '', 
    assetCode = 'XLM',
    assetIssuer = null,
    network = 'testnet' 
  }) {
    try {
      const publicKey = await this.getPublicKey();
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const server = new StellarSdk.Horizon.Server(NETWORKS[network].server);
      const sourceAccount = await server.loadAccount(publicKey);

      // Create asset
      const asset = assetCode === 'XLM' 
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(assetCode, assetIssuer);

      // Build transaction
      let transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORKS[network].passphrase,
      });

      // Add payment operation
      transactionBuilder = transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: destinationId,
          asset: asset,
          amount: amount.toString(),
        })
      );

      // Add memo if provided
      if (memo) {
        transactionBuilder = transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
      }

      // Set timeout
      transactionBuilder = transactionBuilder.setTimeout(300);

      const transaction = transactionBuilder.build();

      // Sign transaction with Freighter
      const signedXdr = await this.signTransaction(
        transaction.toXDR(),
        NETWORKS[network].passphrase
      );

      // Submit transaction
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        NETWORKS[network].passphrase
      );

      const result = await server.submitTransaction(signedTransaction);

      return {
        success: true,
        hash: result.hash,
        ledger: result.ledger,
        envelope_xdr: result.envelope_xdr,
        result_xdr: result.result_xdr
      };
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  static async createScholarshipContract({
    contractWasm,
    initArgs = [],
    network = 'testnet'
  }) {
    try {
      const publicKey = await this.getPublicKey();
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const server = new StellarSdk.Horizon.Server(NETWORKS[network].server);
      const sourceAccount = await server.loadAccount(publicKey);

      // Build contract deployment transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE * 1000, // Higher fee for contract operations
        networkPassphrase: NETWORKS[network].passphrase,
      })
        .addOperation(
          StellarSdk.Operation.createStellarAsset({
            asset: StellarSdk.Asset.native(),
            amount: '1'
          })
        )
        .setTimeout(300)
        .build();

      // Sign and submit
      const signedXdr = await this.signTransaction(
        transaction.toXDR(),
        NETWORKS[network].passphrase
      );

      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        NETWORKS[network].passphrase
      );

      const result = await server.submitTransaction(signedTransaction);

      return {
        success: true,
        contractId: result.hash, // This would be the actual contract ID in practice
        hash: result.hash
      };
    } catch (error) {
      console.error('Contract creation failed:', error);
      throw error;
    }
  }

  static async signTransaction(xdr, networkPassphrase) {
    try {
      const result = await signTransaction(xdr, {
        networkPassphrase,
        address: await this.getPublicKey() || undefined
      });
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      return result.signedTxXdr;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  static async getTransactionHistory(publicKey, network = 'testnet', limit = 10) {
    try {
      const server = new StellarSdk.Horizon.Server(NETWORKS[network].server);
      const transactions = await server
        .transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();

      return transactions.records.map(tx => ({
        id: tx.id,
        hash: tx.hash,
        created_at: tx.created_at,
        fee_charged: tx.fee_charged,
        operation_count: tx.operation_count,
        memo: tx.memo,
        memo_type: tx.memo_type
      }));
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  static getWalletInfo() {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('walletInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  static saveWalletInfo(walletInfo) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletInfo', JSON.stringify(walletInfo));
    }
  }

  static clearWalletInfo() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletInfo');
    }
  }

  static formatBalance(balance, decimals = 7) {
    const num = parseFloat(balance);
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  }

  static validatePublicKey(publicKey) {
    try {
      StellarSdk.Keypair.fromPublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  static generateKeypair() {
    // For development/testing purposes only
    const keypair = StellarSdk.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret()
    };
  }
}

// Utility functions for Stellar operations
export const StellarUtils = {
  formatAmount: (amount) => {
    return parseFloat(amount).toFixed(7).replace(/\.?0+$/, '');
  },

  parseAmount: (amount) => {
    return parseFloat(amount).toString();
  },

  isValidAddress: (address) => {
    return FreighterWallet.validatePublicKey(address);
  },

  generateMemo: (scholarshipId, studentId) => {
    return `SCH:${scholarshipId}:${studentId}`;
  },

  parseMemo: (memo) => {
    if (!memo || !memo.startsWith('SCH:')) return null;
    const parts = memo.split(':');
    if (parts.length !== 3) return null;
    return {
      type: 'scholarship',
      scholarshipId: parts[1],
      studentId: parts[2]
    };
  }
};