var LibraryContract = artifacts.require("./Library.sol");
var UsersContract = artifacts.require("./Users.sol");

module.exports = function (deployer) {
   deployer.deploy(LibraryContract);
   deployer.deploy(UsersContract);
};
