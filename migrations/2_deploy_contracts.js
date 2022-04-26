var LibraryContract = artifacts.require("./Library.sol");
var LibraryNftContract = artifacts.require("./LibraryNftContract.sol");
var UsersContract = artifacts.require("./Users.sol");

module.exports = function (deployer) {
   deployer.deploy(LibraryContract);
   deployer.deploy(LibraryNftContract);
   deployer.deploy(UsersContract);
};
