// RYVYN Protocol - Base Sepolia Deployment
// Updated: P2.11 (Fresh Handler - Bucket Fix)

export const CONTRACTS = {
  // ========== ryUSD System (Base App Track) ==========
  mockUSDC: '0x1DD9b73F49Ad7e9874287f502c6871ce3Df641cC',
  ryUSD: '0x9e94BC6b8D81e94D5272d8e2F2BcCAC267C50E88',
  ryBOND: '0xe01FbFE0ed0B27563869b2495eA77775A7183e5E',
  ryvynHandler: '0x983ae30F3530442D8889999f81E296CA7a336f93',
  treasuryManager: '0xc6841f2d1900d239579B809b1fc8D1b5D0716Eee',
  yieldManager: '0xEF835c04113FC566028B537B18cA0B1E9d745b80',

  // ========== Vaults (40/30/15/10/5 allocation) ==========
  vaultUSYC: '0xa778b7215490A9399729437dD5093634A68D2899',        // 40% T-Bills
  vaultAave: '0xbD3f30C4c6872946a902768E7074DA7167Ef5Ad8',        // 30% Lending
  vaultAerodrome: '0x90a1e77444ae190dd0C6177bAe1882835262014A',   // 15% LP
  vaultThetanuts: '0xdc1BBFfB45CE12407C5935951459baC2da39ED69',   // 10% Options

  // ========== Gamification (Thetanuts Track) ==========
  predictionBoost: '0x3D2809D8842E6f89cC4A0aD51DaaCaf34406676f',  // Real Chainlink Oracle

  // ========== ryIDR System (IDRX Track) ==========
  mockIDRX: '0x4190dBd17d4719df007ED0a7b2EA0226d96e4fb4',
  ryIDR: '0x5403ff9c5c173eEe01255Eeb4d0925bD21748311',
  treasuryManagerIDR: '0x172B748B60BC0aC2590628024cdfD1D90ce47BfA',
  vaultIDRX: '0x42642f6326dBaEA0345e0fB5366850bb17187612',       // 95% IDRX Yield

  // ========== Oracle ==========
  chainlinkETHUSD: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1',  // Real Chainlink on Base Sepolia
} as const;

// Chain ID for Base Sepolia
export const BASE_SEPOLIA_CHAIN_ID = 84532;
