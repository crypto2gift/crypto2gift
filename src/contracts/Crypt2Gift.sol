/*
    This contract is deployed via REMIX
    check
 */
//Should check about the MAX response wait
//And max oracles.
//market.link
//ropsten.explorer.chain.link check for the proof
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./ChainlinkClient.sol";

contract Crypt2Gift is ChainlinkClient{
    address public owner;
    address constant  CRYPTO_COMPARE_ORACLE = 0xc99B3D447826532722E41bc36e644ba3479E4365;
    string constant  CRYPTO_COMPARE_JOBID = "3cff0a3524694ff8834bda9cf9c779a1";
    uint constant CRYTO_COMPARE_PAYMENT = 1 * LINK;

    /* All the ERC tokens we support */
    string constant LINK_SYMBOL = "LINK";
    address constant LINK_TOKEN_ADDRESS = 0x20fE562d797A42Dcb3399062AE9546cd06f63280;
    uint256 constant LINK_DECIMAL = 10**18;

    struct Token {
        string symbol;
        uint256 decimal;
        uint256 price;
        uint256 date;
        bool isValue;
    }

    // A deposit from a user
    struct Deposit {
        address ercAddress;
        string symbol;
        uint256 amount;
        uint256 fee;
        uint256 date;
    }

    mapping(address => Token) public erc;
    mapping(address => Deposit) public deposits;
    mapping(bytes32 => address) private requestId2ErcAddress;

    constructor() public {
        setPublicChainlinkToken();
        owner = msg.sender;
        //Fill known erc token bellow
        erc[LINK_TOKEN_ADDRESS] = Token({symbol: LINK_SYMBOL, decimal: LINK_DECIMAL, price: 0, date: 0, isValue: true});

    }

    function canTrade(address _erc) public view returns (bool) {
        require(erc[_erc].isValue == true, 'Not supported token');
        return (deposits[msg.sender].ercAddress == _erc || deposits[msg.sender].ercAddress == address(0))  && balanceOf(_erc) > 0;
    }

    function canClaim() public view returns(bool) {
        //If the deposit is done in less than 3 minutes or the last check price was done in less than 3 minutes user can claim
        return isUpToDate(deposits[msg.sender].date) == true || isUpToDate(erc[deposits[msg.sender].ercAddress].date)  == true;
    }

    function hasDeposit(address addr) public view returns(bool) {
        return deposits[addr].ercAddress != address(0);
    }

    function getDepositInfo() public view returns(Deposit) {
        return deposits[msg.sender];
    }

    event PriceUp(string indexed symbol, uint256 price);
    event TokenTransferred(address indexed from, address indexed ercAddress, uint256 amount, uint date);
    event RequestingTokenPrice(address indexed from, string indexed symbol);
    function onTokenTransfer(address from, uint256 amount, bytes data) public{
        deposits[from] = Deposit({ercAddress: msg.sender, symbol: erc[msg.sender].symbol, amount: amount + deposits[from].amount, date: now, fee: deposits[from].fee});
        emit TokenTransferred(from, msg.sender, amount, deposits[from].date);
        emit RequestingTokenPrice(from, erc[msg.sender].symbol);
        if(isUpToDate(erc[msg.sender].date) == false) {
            requestTokenPrice(CRYPTO_COMPARE_ORACLE, CRYPTO_COMPARE_JOBID, CRYTO_COMPARE_PAYMENT, msg.sender, false);
        }else {
            emit PriceUp(erc[msg.sender].symbol, erc[msg.sender].price);
        }
    }


    event GiftClaimed(address indexed addr, string email, string brand, uint256 amount, uint decimal);
    function claimGift(string email, string brand) public returns(bool) {
        require(deposits[msg.sender].amount > 0, "0 token");
        require(canClaim(), "Token price is not up to date");
        uint256 amount = deposits[msg.sender].amount - deposits[msg.sender].fee;
        address ercAddress = deposits[msg.sender].ercAddress;
        uint256 price = erc[ercAddress].price;
        uint256 decimal = erc[ercAddress].decimal;
        delete deposits[msg.sender];
        emit GiftClaimed(msg.sender,  email, brand, amount * price, decimal);
        return true;
    }

    function getLastPriceOf(address _erc) public view returns(uint256) {
        return erc[_erc].price;
    }

    function isPriceReady(address _erc) public view returns (bool) {
        return isUpToDate(erc[_erc].date);
    }

    function checkPrice(address _erc) public {
        require(deposits[msg.sender].ercAddress != address(0) && deposits[msg.sender].amount > 0);
        deposits[msg.sender].fee = deposits[msg.sender].fee + CRYTO_COMPARE_PAYMENT;
        requestTokenPrice(CRYPTO_COMPARE_ORACLE, CRYPTO_COMPARE_JOBID, CRYTO_COMPARE_PAYMENT, _erc, true);
    }

    function requestTokenPrice(address _oracle, string _jobId, uint256 _payment, address _erc, bool recall)
    private
        //   onlyOwner
    {
        Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfill.selector);
        //error here
        req.add("get", "https://min-api.cryptocompare.com/data/price?fsym=LINK&tsyms=USD");
        req.add("path", "USD");
        req.addInt("times", 100);
        bytes32 requestId = sendChainlinkRequestTo(_oracle, req, _payment);
        requestId2ErcAddress[requestId] = _erc;
    }

    function fulfill(bytes32 _requestId, uint256 _price)
    public
    recordChainlinkFulfillment(_requestId)
    {
        address ercAddress = requestId2ErcAddress[_requestId];
        erc[ercAddress].price = _price;
        erc[ercAddress].date = now;
        emit PriceUp(erc[ercAddress].symbol, erc[ercAddress].price);
    }


    function isUpToDate(uint256 _date) public view returns(bool) {
        return (now - _date) < 3 minutes;
    }

    function balanceOf(address _erc) public view returns (uint256) {
        LinkTokenInterface ercContract = LinkTokenInterface(_erc);
        return ercContract.balanceOf(msg.sender);
    }

    // withdrawLink allows the owner to withdraw any extra LINK on the contract
    function withdrawLink()
    public
    onlyOwner
    {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    //Need to delete it for deployement
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
}
