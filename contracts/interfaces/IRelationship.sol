// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRelationship {
  function initialize(address[2] memory nfts, address _devWallet, uint256 _mintFee, address _inCraft) external;

  function getParents() external view returns (address, address);
}
