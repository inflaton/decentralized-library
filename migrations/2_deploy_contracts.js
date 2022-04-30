var LibraryContract = artifacts.require("./Library.sol");
var LibraryNftContract = artifacts.require("./LibraryNftContract.sol");

module.exports = function (deployer) {
   deployer.deploy(LibraryContract);
   deployer.deploy(LibraryNftContract);
};
