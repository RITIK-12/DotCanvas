'use client';

import { ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Toaster } from 'react-hot-toast';
import { NETWORK_CONFIG } from '../lib/config';
import '../styles/globals.css';
import WalletButton from '../components/WalletButton';

// Configure the chain
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    {
      id: NETWORK_CONFIG.chainId,
      name: NETWORK_CONFIG.name,
      network: 'polkadot-asset-hub',
      rpcUrls: {
        default: {
          http: [NETWORK_CONFIG.rpcUrl],
        },
        public: {
          http: [NETWORK_CONFIG.rpcUrl],
        },
      },
      nativeCurrency: {
        name: NETWORK_CONFIG.currency.name,
        symbol: NETWORK_CONFIG.currency.symbol,
        decimals: NETWORK_CONFIG.currency.decimals,
      },
    },
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: NETWORK_CONFIG.rpcUrl,
      }),
    }),
    publicProvider(),
  ]
);

// Configure the client
const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={config}>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 bg-white border-b">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-10">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold">DotCanvas</span>
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <WalletButton />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <Toaster position="bottom-right" />
          </div>
        </WagmiConfig>
      </body>
    </html>
  );
}
