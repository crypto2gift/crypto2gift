const ethers = require('ethers');
const express = require('express');
let provider = new ethers.providers.InfuraProvider('ropsten');
let utils = ethers.utils;
const uuidv1 = require('uuid/v1');
const request = require('request');
const API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJTSEEyNTYifQ==.VVBzWFNqbDdkWEV3Rm0rbGlnWXkzTVpuNERlS09lckY4MGNrRnZWU3R2cXZGTHdnc1VTVU1PYTNTMkY5dytncU96OXFmdEVYdHJncEVUKzZMcWhFQnhRYXN5UGZlUkk4YXVJbi95VHNBT0FFalZaSDA0NE8xNkpMVTk5dmtvczk=.rchtP8DEGw7zomZTTCIuqu9YovFbusUdfrHGBYew1z8=";



var axios = require('axios');

const PORT = 3001;
const BASE_URL = "https://api-testbed.giftbit.com/papi/v1/";
const API_OPTIONS = {
    headers: {accept: 'application/json'},
};


const CRYPT2GIFT_ADDRESS = "0x83Af58093523F65720EF538972A591e6C7d15dA8";
const CRYPT2GIFT_ABI = [{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"hasDeposit","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_erc","type":"address"}],"name":"getLastPriceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_requestId","type":"bytes32"},{"name":"_price","type":"uint256"}],"name":"fulfill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_erc","type":"address"}],"name":"canTrade","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"email","type":"string"},{"name":"brand","type":"string"}],"name":"claimGift","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_date","type":"uint256"}],"name":"isUpToDate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"canClaim","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_erc","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getDepositInfo","outputs":[{"components":[{"name":"ercAddress","type":"address"},{"name":"symbol","type":"string"},{"name":"amount","type":"uint256"},{"name":"fee","type":"uint256"},{"name":"date","type":"uint256"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_erc","type":"address"}],"name":"isPriceReady","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawLink","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"amount","type":"uint256"},{"name":"data","type":"bytes"}],"name":"onTokenTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"erc","outputs":[{"name":"symbol","type":"string"},{"name":"decimal","type":"uint256"},{"name":"price","type":"uint256"},{"name":"date","type":"uint256"},{"name":"isValue","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_erc","type":"address"}],"name":"checkPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"deposits","outputs":[{"name":"ercAddress","type":"address"},{"name":"symbol","type":"string"},{"name":"amount","type":"uint256"},{"name":"fee","type":"uint256"},{"name":"date","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"string"},{"indexed":false,"name":"price","type":"uint256"}],"name":"PriceUp","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"ercAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"date","type":"uint256"}],"name":"TokenTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"symbol","type":"string"}],"name":"RequestingTokenPrice","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"email","type":"string"},{"indexed":false,"name":"brand","type":"string"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"decimal","type":"uint256"}],"name":"GiftClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"}]

/*
const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log(`app listeninf on port ${PORT}`));
 */
let contract = new ethers.Contract(CRYPT2GIFT_ADDRESS, CRYPT2GIFT_ABI, provider);
console.log(contract);
contract.on("GiftClaimed", (addr, email, brand, amount, decimal) => {
    //CONVERT AMOUNT TO USD AND CHANGE EVENT NAME PLZ THIS IS OUTDATED
    let uid = uuidv1(new Date());
    let price = (amount.div(decimal)).toNumber();
    request({
        method: 'POST',
        url: 'https://api-testbed.giftbit.com/papi/v1/campaign',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: `{ \"message\": \"Thx for using kiwitch below your gift\",  \"subject\": \"GIFT CLAIM\", \"gift_template\": \"VYPWYEOYFYSF\",  \"contacts\": [    {   \"email\": \"${email}\"    } ],  \"price_in_cents\": ${price},  \"brand_codes\": [    \"${brand}\"],  \"expiry\": \"2019-11-01\",  \"id\": \"${uid}\"}`
    }, function (error, response, body) {
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        console.log('Response:', body);
    });

});


