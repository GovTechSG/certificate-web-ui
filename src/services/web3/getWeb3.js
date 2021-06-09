import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import SubscriptionSubprovider from "web3-provider-engine/subproviders/subscriptions";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";
import WebsocketSubProvider from "web3-provider-engine/subproviders/websocket";
import { NETWORK_TYPES, INFURA_PROJECT_ID } from "../../config";
import { getLogger } from "../../logger";

const { trace, error } = getLogger("services:getWeb3");

let web3Instance;
let web3InstanceType;

async function loadWeb3Ledger(mainnet = true) {
  trace(`Loading web3 using ledger subprovider engine`);
  const networkId = mainnet ? 1 : 3;
  const rpcUrl = mainnet
    ? `wss://mainnet.infura.io/ws/v3/${INFURA_PROJECT_ID}`
    : `wss://ropsten.infura.io/ws/v3/${INFURA_PROJECT_ID}`;

  const engine = new ProviderEngine();
  const getTransport = () => TransportU2F.create();
  const ledger = createLedgerSubprovider(getTransport, {
    networkId,
    accountsLength: 5,
  });
  engine.addProvider(ledger);
  const fetchProvider = new WebsocketSubProvider({ rpcUrl });
  engine.addProvider(fetchProvider);

  const filterAndSubsSubprovider = new SubscriptionSubprovider();
  engine.addProvider(filterAndSubsSubprovider);

  engine.start();
  return new Web3(engine);
}

/**
 * Used for retrieving Injected web3, we expect Metamask to do this
 */
async function loadWeb3Injected() {
  trace(`Loading injected web3`);

  if (
    typeof window.ethereum !== "undefined" // new metamask api EIP-1102
  ) {
    const provider = window.ethereum;
    trace(`Metamask provider found: ${provider}`);
    // Request for account access if required
    await window.ethereum.enable();
    return new Web3(provider);
  }
  throw new Error("Metamask cannot be found");
}

async function loadWeb3Mock() {
  return {
    eth: {
      currentProvider: {},
      getAccounts: () => [],
    },
  };
}

async function resolveWeb3(resolve, reject, t = NETWORK_TYPES.INJECTED) {
  try {
    switch (t) {
      case NETWORK_TYPES.INJECTED:
        web3Instance = await loadWeb3Injected();
        break;
      case NETWORK_TYPES.LEDGER_MAIN:
        web3Instance = await loadWeb3Ledger(true);
        break;
      case NETWORK_TYPES.LEDGER_ROPSTEN:
        web3Instance = await loadWeb3Ledger(false);
        break;
      case NETWORK_TYPES.MOCK:
        web3Instance = await loadWeb3Mock();
        break;
      default:
        web3Instance = await loadWeb3Injected();
    }
    web3InstanceType = t;
    resolve(web3Instance);
  } catch (e) {
    error(e);
    reject(e);
  }
}

export function setNewWeb3(t) {
  trace(`Setting new Web3: ${t}`);
  if (
    web3InstanceType === NETWORK_TYPES.LEDGER_MAIN ||
    web3InstanceType === NETWORK_TYPES.LEDGER_ROPSTEN
  ) {
    // we need to kill the engine if the previous web3 instance has a ledger subprovider
    web3Instance.currentProvider.stop();
  }
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    // Server-side rendering fails when trying to access window
    if (typeof window !== "undefined") {
      window.addEventListener(`load`, () => {
        resolveWeb3(resolve, reject, t);
      });
      // If document has loaded already, try to get Web3 immediately.
      if (document.readyState === `complete`) {
        resolveWeb3(resolve, reject, t);
      }
    }
  });
}

export function getCurrentWeb3(t) {
  if (web3Instance) {
    return new Promise((resolve) => {
      resolve(web3Instance);
    });
  }
  return setNewWeb3(t);
}
