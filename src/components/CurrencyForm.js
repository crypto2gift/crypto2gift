import React, {useContext, useEffect, useState} from 'react';
import {CryptContext, useCrypt2GiftCall} from "../hooks/crypt2gift";
import {Web3Context} from "../hooks/ethers-hooks";
import {TokenGridList} from "./GridList";
import {bigNumberToLink} from "../utils/ethers-utils";
import {DappContext} from "../hooks/dapp";
import {token2Address} from "../utils/ethers-utils";
import Divider from '@material-ui/core/Divider';



const currencies = ["LINK", "MOAB", "MKR", "REP", "ZRX", "BNB"];
const supportedCurrences = ["LINK"];

 export default function Currency () {
     const [web3State, web3Dispatch] = useContext(Web3Context);
     const [cryptState, cryptDispatch] = useContext(CryptContext);
     const [dappState, dappDispatch] = useContext(DappContext);
     const [balanceOfState, balanceOf] = useCrypt2GiftCall("balanceOf");
     const [balance, setBalance] = useState({});
     //Get the balance of all supported currencies
     useEffect(() => {
         (async () => {
             if(web3State.crypt2gift) {
                 for(const curr of currencies) {
                     if(supportedCurrences.includes(curr)) {
                         let curBalance = await balanceOf(token2Address[curr]);
                         curBalance = bigNumberToLink(curBalance);
                         setBalance(c => ({...c, [curr]: curBalance}));
                     }else{
                         setBalance(c => ({...c, [curr]: "n/a"}));
                     }
                 }
             }
         })();
     }, [web3State.crypt2gift, balanceOf]);

     return (
         <>

             <Divider />
             <TokenGridList balance={balance} dispatch={dappDispatch}/>
         </>
     );
 }