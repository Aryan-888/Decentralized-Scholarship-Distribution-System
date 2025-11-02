// Firebase configuration
// Replace with your actual Firebase config
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// API configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000
};

// Stellar configuration
export const stellarConfig = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDPIXAEPDLFMKT47RDLB4M6VKYII37S2YTJRCXOQ6WKNT3IVQV2UQEPE'
};

// App configuration
export const appConfig = {
  name: 'Scholarship DApp',
  description: 'Decentralized Scholarship Distribution System',
  version: '1.0.0'
};