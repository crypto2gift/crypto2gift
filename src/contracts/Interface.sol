/*
    Better to import real interface
*/
pragma solidity ^0.4.24;


contract LinkToken {
    function balanceOf(address owner) public view returns (uint256 balance);
}
