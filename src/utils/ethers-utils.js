import {ethers} from 'ethers';

//Check the presence of metamask
export const isWeb3 = () => {
    return typeof window.ethereum !== 'undefined'; //need to add web3 checking? //Need to throw here!
};

// enable metamask to be used by the application
export const enableProvider = async () => {
    try {
        const accounts = await window.ethereum.enable();
        return accounts[0];
    }catch(e) {
        throw new Error('User rejected provider access');
    }
};

//get network Id string from injected Web3
export const getNetwork = () => {
  return window.ethereum.networkVersion;
};

export const connect2Provider = () => {
    return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = (provider) => {
    return provider.getSigner();
};

export const connect2Contract = (address, abi, signer) => {
    return  new ethers.Contract(address, abi, signer)
};

// return network name by id
export const getNetworkById = (netId) => {
    switch(netId) {
        case '1':
            return 'mainnet';
        case '2':
            return 'Morden';
        case '3':
            return 'Ropsten';
        case '4':
            return 'Rinkeby';
        case '5':
            return 'Goerli';
        case '42':
            return 'Kovan';
        default:
            return 'Unknown network';
    }
};

//return id by network name
export const getIdByNetwork = (netName) => {
  switch(netName.toUpperCase()) {
      case 'MAINNET':
          return "1";
      case 'MORDEN':
          return "2";
      case 'ROPSTEN':
          return "3";
      case 'RINKEBY':
          return "4";
      case 'GOERLI':
          return "42";
      default:
          return "0";
  }
};


//return bignumber, amount can be either a number or a string
export const linkToBigNumber = (amount) => {
  return ethers.utils.parseEther(amount.toString());
};

//return string
export const bigNumberToLink = (bigValue) => {
    return ethers.utils.formatEther(bigValue, {pad: true});
};

export const token2Address = {
    "LINK" : "0x20fE562d797A42Dcb3399062AE9546cd06f63280"
};
