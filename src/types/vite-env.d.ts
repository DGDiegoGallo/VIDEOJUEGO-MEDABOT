/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_URL: string;
  readonly VITE_BLOCKCHAIN_NETWORK: string;
  readonly VITE_NFT_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}