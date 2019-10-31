import React, {useEffect, useReducer} from 'react';
import {enableProvider, getNetwork, connect2Provider, getSigner, connect2Contract} from "../utils/ethers-utils";
import {CRYPT2GIFT_ADDRESS, LINK_TOKEN_ADDRESS, CRYPT2GIFT_ABI, LINK_TOKEN_ABI} from "../contracts/data";

const NETWORK = "3";

export const Web3Context = React.createContext(null);
export const Web3Provider = ({children}) => {
    return(
      <>
          <Web3Context.Provider value={useEthers()}>
              {children}
          </Web3Context.Provider>
      </>
    );
};

const ethersReducer = (state, action) => {
    switch(action.type) {
        case 'SET_ENABLE':
            return {...state, address: action.address, isEnable: action.isEnable};
        case 'SET_ADDRESS':
            return {...state, address: action.address};
        case 'SET_NETWORK':
            return {...state, network: action.network};
        case 'SET_PROVIDER':
            return {...state, provider: action.provider};
        case 'SET_SIGNER':
            return {...state, signer: action.signer};
        case 'SET_CONTRACT_LINKTOKEN':                  //TODO this should be performed in the dappcontext not here
            return {...state, linktoken: action.contract}
        case 'SET_CONTRACT_CRYPT2GIFT':                 //TODO this should be performed in the dappcontext not here
            return {...state, crypt2gift: action.contract}
        default:
            throw new Error('Action not handled in ethersReducer');
    }
};

const initialState = {
    address: '0x0',
    network: '0',
    provider: null,
    signer: null,
    isEnable: false,
    balance: 0,
    linktoken: null,
    crypt2gift: null,
};

export const useEthers = () => {
    const [state, dispatch] = useReducer(ethersReducer, initialState);

    //Breaking change for newer metamask we need to enable first if we want to see the network or the injected web3 obj
    useEffect(() => {
        (async () => {
            try {
                const account = await enableProvider();
                dispatch({type: 'SET_ENABLE', isEnable: true, address: account});
            }catch(e) {
                dispatch({type: 'SET_ENABLE', isEnable: false});
                throw e;
            }
        })();
    }, []);

    //Set network if metamask is enabled
    useEffect(() => {
        if(state.isEnable) {
            dispatch({type : 'SET_NETWORK', network: getNetwork()});
        }
    }, [state.isEnable]);

    //Set Provider is network is set or changed
    useEffect(() => {
        if(state.network !== '0') {
            dispatch({type: 'SET_PROVIDER', provider: connect2Provider()})
        }
    }, [state.network]);

    //Set signer
    useEffect(() => {
        if(state.provider && state.address !== '0x0') {
            dispatch({type: 'SET_SIGNER', signer: getSigner(state.provider)});
        }
    }, [state.address, state.provider]);

    useEffect(() => {
        //If we are on the ropsten network and signer is set, connect to contracts crypt2gift and ERC677 link
        if(state.network === NETWORK && state.signer) {
            dispatch({type: 'SET_CONTRACT_LINKTOKEN', contract: connect2Contract(LINK_TOKEN_ADDRESS, LINK_TOKEN_ABI, state.signer)});
            dispatch({type: 'SET_CONTRACT_CRYPT2GIFT', contract: connect2Contract(CRYPT2GIFT_ADDRESS, CRYPT2GIFT_ABI, state.signer)})
        }
    }, [state.signer, state.network]);

    //Handler for account change
    useEffect(() => {
        const onAddressChange = (accounts) => dispatch({type: 'SET_ADDRESS', address: accounts[0]});
        window.ethereum.on('accountsChanged', onAddressChange);
        return () => window.ethereum.removeListener('accountsChanged', onAddressChange)
    }, [dispatch]);

    //Handler for network change
    useEffect(() => {
        const onNetworkChange = (netID) => {
            dispatch({type: 'SET_NETWORK', network: netID});
        };
        window.ethereum.on('networkChanged', onNetworkChange);
        return () => window.ethereum.removeListener('networkChanged', onNetworkChange);

    }, [dispatch]);
    return [state, dispatch];
};


