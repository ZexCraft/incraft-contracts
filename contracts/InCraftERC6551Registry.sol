// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "./interfaces/IERC6551Registry.sol";

contract InCraftERC6551Registry is IERC6551Registry {
  error InitializationFailed();
  address public immutable i_implementation;

  mapping(address => bool) public accountExists;

  constructor(address implementation) {
    i_implementation = implementation;
  }

  function createAccount(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt,
    bytes memory initData
  ) external payable returns (address) {
    return _createAccount(chainId, tokenContract, tokenId);
  }

  function _createAccount(uint256 chainId, address tokenContract, uint256 tokenId) internal returns (address) {
    bytes memory code = _creationCode(i_implementation, chainId, tokenContract, tokenId, 1);
    address account_ = Create2.computeAddress(bytes32(uint256(1)), keccak256(code));

    if (account_.code.length != 0) return account_;

    account_ = Create2.deploy(0, bytes32(uint256(1)), code);
    accountExists[account_] = true;
    emit AccountCreated(account_, i_implementation, chainId, tokenContract, tokenId, uint256(1));
    return account_;
  }

  function account(
    address implementation,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    uint256 salt
  ) external view returns (address) {
    return _account(chainId, tokenContract, tokenId);
  }

  function _account(uint256 chainId, address tokenContract, uint256 tokenId) internal view returns (address) {
    bytes32 bytecodeHash = keccak256(_creationCode(i_implementation, chainId, tokenContract, tokenId, uint256(1)));

    return Create2.computeAddress(bytes32(uint256(1)), bytecodeHash);
  }

  function _creationCode(
    address implementation_,
    uint256 chainId_,
    address tokenContract_,
    uint256 tokenId_,
    uint256 salt_
  ) internal pure returns (bytes memory) {
    return
      abi.encodePacked(
        hex"3d60ad80600a3d3981f3363d3d373d3d3d363d73",
        implementation_,
        hex"5af43d82803e903d91602b57fd5bf3",
        abi.encode(salt_, chainId_, tokenContract_, tokenId_)
      );
  }

  function isAccount(address accountAddress) external view returns (bool) {
    return accountExists[accountAddress];
  }
}
