import type { CryptoAsset, CryptoTransaction, CryptoWallet } from '$lib/types';

export const cryptoAssets: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', price_usd: 112840, change_24h: 2.84, balance: 0.1842, value_usd: 20782.13, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', price_usd: 4510.22, change_24h: 1.48, balance: 3.82, value_usd: 17229.04, icon: 'Ξ' },
  { symbol: 'USDC', name: 'USD Coin', network: 'Ethereum', price_usd: 1, change_24h: 0.01, balance: 8650, value_usd: 8650, icon: '$' },
  { symbol: 'SOL', name: 'Solana', network: 'Solana', price_usd: 219.31, change_24h: 4.62, balance: 18.5, value_usd: 4057.24, icon: 'S' },
  { symbol: 'USDT', name: 'Tether', network: 'Tron', price_usd: 1, change_24h: -0.02, balance: 2100, value_usd: 2100, icon: '₮' },
  { symbol: 'MATIC', name: 'Polygon', network: 'Polygon', price_usd: 0.42, change_24h: -1.16, balance: 2400, value_usd: 1008, icon: 'M' },
];

export const cryptoWallets: CryptoWallet[] = [
  { id: 1, asset: 'Bitcoin', name: 'Bitcoin Wallet', symbol: 'BTC', network: 'Bitcoin', address: 'bc1q7s9v7y0d8x2k4n8m3e7q2h4g9l8c6k5p2q8xw', balance: 0.1842, value_usd: 20782.13, icon: '₿', status: 'active' },
  { id: 2, asset: 'Ethereum', name: 'Ethereum Wallet', symbol: 'ETH', network: 'Ethereum', address: '0x71A3...D9f2', balance: 3.82, value_usd: 17229.04, icon: 'Ξ', status: 'active' },
  { id: 3, asset: 'USD Coin', name: 'USDC Wallet', symbol: 'USDC', network: 'Ethereum', address: '0x71A3...D9f2', balance: 8650, value_usd: 8650, icon: '$', status: 'active' },
  { id: 4, asset: 'Solana', name: 'Solana Wallet', symbol: 'SOL', network: 'Solana', address: '7Xw9...kP4m', balance: 18.5, value_usd: 4057.24, icon: 'S', status: 'active' },
  { id: 5, asset: 'Tether', name: 'USDT Wallet', symbol: 'USDT', network: 'Tron', address: 'TX8R...4L9P', balance: 2100, value_usd: 2100, icon: '₮', status: 'watch_only' },
];

export const cryptoTransactions: CryptoTransaction[] = [
  { id: 'TX-8F21A9', asset: 'USDC', symbol: 'USDC', amount: 2500, value_usd: 2500, type: 'received', status: 'completed', network: 'Ethereum', description: 'USDC deposit', created_at: new Date(Date.now() - 1000 * 60 * 38).toISOString(), address: '0x71A3...D9f2', tx_hash: '0x9f8a...71c2' },
  { id: 'TX-4D77BC', asset: 'Ethereum', symbol: 'ETH', amount: -0.45, value_usd: 2029.60, type: 'sent', status: 'completed', network: 'Ethereum', description: 'Sent ETH', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), tx_hash: '0x31af...e82c' },
  { id: 'TX-BA102E', asset: 'Solana', symbol: 'SOL', amount: 4.6, value_usd: 1009.83, type: 'buy', status: 'completed', network: 'Solana', description: 'Buy SOL', created_at: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString() },
  { id: 'TX-51FC21', asset: 'Bitcoin', symbol: 'BTC', amount: -0.008, value_usd: 902.72, type: 'swap', status: 'completed', network: 'Bitcoin', description: 'BTC → USDC swap', created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() },
  { id: 'TX-0C2A70', asset: 'USDT', symbol: 'USDT', amount: 750, value_usd: 750, type: 'received', status: 'pending', network: 'Tron', description: 'USDT deposit', created_at: new Date(Date.now() - 1000 * 60 * 60 * 33).toISOString(), tx_hash: '9ab4...ee12' },
  { id: 'TX-187EE9', asset: 'USDC', symbol: 'USDC', amount: -12.5, value_usd: 12.5, type: 'fee', status: 'completed', network: 'Ethereum', description: 'Network fee', created_at: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString() },
];

export const chartPoints = [34, 38, 36, 42, 40, 46, 45, 52, 49, 58, 61, 57, 64, 62, 71, 76, 72, 79, 77, 84, 82, 89, 94, 91, 97, 95, 101, 99, 108, 112];

export function cryptoPortfolioTotal() {
  return cryptoAssets.reduce((sum, asset) => sum + asset.value_usd, 0);
}

export function formatUsd(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: fractionDigits }).format(value);
}

export function formatCrypto(value: number, symbol: string) {
  const digits = value >= 1000 ? 2 : value >= 1 ? 4 : 6;
  return `${value.toLocaleString('en-US', { maximumFractionDigits: digits })} ${symbol}`;
}
