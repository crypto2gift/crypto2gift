import React, {useEffect, useReducer, useContext, useCallback} from 'react';
import {useEthers, Web3Context} from "./ethers-hooks";
import {ethers} from "ethers";
import {linkToBigNumber, bigNumberToLink, token2Address} from "../utils/ethers-utils";

export const CryptContext = React.createContext(null);
export const Crypt2GiftProvider = ({children}) => {
    return(
        <>
            <CryptContext.Provider value={useCrypt2Gift()}>
                {children}
            </CryptContext.Provider>
        </>
    );
};

const c2gReducer = (state, action) => {
    switch(action.type) {
        case "init":
            return {...initialC2GState};
        case "hasDeposit":
            if(action.hasDeposit === false) state = {...initialC2GState};
            return {...state, hasDeposit: action.hasDeposit};
        case "ercAddress":
            return {...state, ercAddress: action.ercAddress};
        case "symbol":
            return {...state, symbol: action.symbol};
        case "amount":
            return {...state, amount: action.amount};
        case "fee":
            return {...state, fee: action.fee};
        case "date":
            return {...state, date: action.date};
        case "balance":
            return {...state, balance: action.balance};
        default:
            throw new Error(`Unhandled action ${action.type} in c2gReduccer`);
    }
};

const initialC2GState = {
    hasDeposit: false,
    ercAddress: "0x0",
    symbol: "",
    amount: 0,
    fee: 0,
    date: 0,
    balance: 0,
};

export const useCrypt2Gift = () => {
    const [state, dispatch] = useReducer(c2gReducer, initialC2GState);
    const [web3State, we3Dispatch] = useContext(Web3Context);
    const [getDepositInfoState, getDepositInfo] = useCrypt2GiftCall("getDepositInfo");
    const [balanceOfState, balanceOf] = useCrypt2GiftCall("balanceOf");
    useEffect(() => {
        console.log("USE EFFECT TRIGGERED FOR GET DEPOSIT INFO");
        (async () => {
            if(web3State.crypt2gift) {
                try {
                    let result = await getDepositInfo();
                    if(hasDeposit(result)) {
                        dispatch({type: "hasDeposit", hasDeposit: true});
                        dispatch({type: "ercAddress", ercAddress: result.ercAddress});
                        dispatch({type: "symbol", symbol: result.symbol});
                        dispatch({type: "amount", amount: bigNumberToLink(result.amount)});
                        dispatch({type: "fee", fee: bigNumberToLink(result.fee)});
                        dispatch({type: "date", date: result.date.toNumber()});
                        const curBalance = bigNumberToLink(await balanceOf(result.ercAddress));
                        dispatch({type: "balance", balance: curBalance});

                    } else {
                        dispatch({type: "hasDeposit", hasDeposit: false})
                    }
                }catch(e) { //TODO: check but i don't think getDepositInfo throw correctly
                    throw e;
                }
            }
        })();
    }, [getDepositInfo, web3State.crypt2gift, state.hasDeposit, balanceOf]);
    return [state, dispatch];
};

const hasDeposit = (deposit) => {
    return bigNumberToLink(deposit.amount) > 0;
};


const ethersCallReducer = (state, action) => {
    switch(action.type) {
        case "success":
            return {...state, success: true, loading: false, error: false, response: action.response};
        case "loading":
            state = {...initialState};
            return {...state, success: false, loading: true, error: false};
        case "error":
            return {...state, success: false, loading: false, error: true, message: action.message};
        default:
            throw new Error(`${action.type} not handled in contractReducer`);
    }
};

const initialState = {
    success: false,
    loading: false,
    error: false,
    response: null
};

export const useCrypt2GiftCall = (funcName) => {
  const [state, dispatch] = useReducer(ethersCallReducer, initialState);
  const [web3Context, web3Dispatch] = useContext(Web3Context);
  const fn = useCallback(async (...params) => {
      if(web3Context.crypt2gift) {
          dispatch({type: "loading"});
          try {
              let result = await web3Context.crypt2gift.functions[funcName](...params);
              dispatch({type: "success", response: result});
              return result;
          } catch (e) {
              dispatch({type: "error", message: e.message})
              throw e;
          }
      }
  }, [web3Context.crypt2gift, funcName]);
  return [state, fn]
};

export const useLinkTokenCall = (funcName) => {
    const [state, dispatch] = useReducer(ethersCallReducer, initialState);
    const [web3Context, web3Dispatch] = useContext(Web3Context);
    const fn = useCallback(async (...params) => {
        if(web3Context.linktoken) {
            dispatch({type: "loading"});
            try {
                let result = await web3Context.linktoken.functions[funcName](...params);
                dispatch({type: "success", response: result});
                return result;
            } catch (e) {
                console.log(e.message);
                dispatch({type: "error", message: e.message})
                throw e;
            }
        }
    }, [web3Context.linktoken, funcName]);
    return [state, fn]
};