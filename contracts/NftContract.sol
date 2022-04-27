//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

abstract contract NftContract {
    function mintNFT(address recipient, string memory tokenURI)
        public
        virtual
        returns (uint256);
}
