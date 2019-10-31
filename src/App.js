import React, {useState} from 'react';
import {Web3Provider} from "./hooks/ethers-hooks";
import {Crypt2GiftProvider} from "./hooks/crypt2gift";
import {DappProvider} from "./hooks/dapp";
import Dapp from "./Dapp";
import './App.css';

function App() {
  return (
      <>
        <Web3Provider>
            <Crypt2GiftProvider>
                <DappProvider>
                    <Dapp />
                </DappProvider>
            </Crypt2GiftProvider>
        </Web3Provider>
      </>
  );
}


export default App;
