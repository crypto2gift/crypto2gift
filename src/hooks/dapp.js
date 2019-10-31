import React, {useEffect, useReducer, createContext, useContext} from "react";
import {CryptContext, useCrypt2GiftCall} from "./crypt2gift";
import {Web3Context} from "./ethers-hooks";
import {bigNumberToLink, token2Address} from "../utils/ethers-utils";

export const DappContext = createContext();
export const DappProvider = ({children}) => {
    return (
        <>
            <DappContext.Provider value={useDapp()}>
                {children}
            </DappContext.Provider>
        </>
    );
};

const dappReducer = (state, action) => {
    switch(action.type) {
        case "init":
            return {...initialState};
        case "step":
            if(state.symbol.length > 0 && action.step === 0) state = {...initialState};
            return {...state, step: action.step};
        case "symbol":
            return {...state, symbol: action.symbol};
        case "balance":
            return {...state, balance: action.balance};
        case "isPriceReady":
            return {...state, isPriceReady: action.isPriceReady};
        case "price":
            return {...state, price: action.price};
        default:
            throw new Error(`Unhandled action ${action.type} in dappReducer`);
    }
};

const initialState = {
    step: 0,
    symbol: "",
    isPriceReady: false,
    price: 0
};

export const useDapp = () => {
    const [state, dispatch] = useReducer(dappReducer, initialState);
    const [web3State, web3Dispatch] = useContext(Web3Context);
    const [cryptState, cryptDispatch] = useContext(CryptContext);
    useEffect(() => {
        (async () => {
            console.log("DISPATCHING DAPP");
            if(web3State.crypt2gift) {
                //if the user doesnt have a deposit and he didn't pick a currencies yet he has to be stuck in step 1 (currency form)
                if(!cryptState.hasDeposit && state.symbol.length === 0) dispatch({type: "step", step: 0});
                //else if the  user has a deposit he is forced go to step 2 (deposit form)
                else if (cryptState.hasDeposit){
                    dispatch({type: "symbol", symbol: cryptState.symbol});
                    dispatch({type: "step", step: 1});
                //user doesn't have a deposit but has selected a currency
                }else {
                    dispatch({type: "step", step: 1});
                }
            }
        })();
    }, [web3State.crypt2gift, cryptState.hasDeposit, state.symbol, cryptState.symbol]);
    return [state, dispatch];
};

