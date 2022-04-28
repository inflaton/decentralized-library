var Library = artifacts.require('./Library.sol');

contract('Library', function (accounts) {
    var instance = null; // store the Library contract instance
    var mainAccount = accounts[0];
    var latestBookId;

    it("should add a book", function () {
        var booksBeforeRegister = null;

        return Library.deployed().then(function (contractInstance) {
            // storing the contract instance so it will be used later on
            instance = contractInstance;

            // calling the smart contract function totalLibrary to get the current number of library
            return instance.bookId.call();
        }).then(function (result) {
            // storing the current number on the var booksBeforeRegister
            booksBeforeRegister = result.toNumber();

            // registering the user calling the smart contract function registerUser
            return instance.addBook('Test Book Name', 'Test Description', 2000000000000000, {
                from: mainAccount
            });
        }).then(function (_result) {
            return instance.totalBooks.call(true);
        }).then(function (result) {
            console.log(`allBooks: ${result}`)
            const booksAfterRegister = result.length;
            // checking if the total number of user is increased by 1
            assert.equal(booksAfterRegister, (booksBeforeRegister + 1), "number of books must be (" + booksBeforeRegister + " + 1)");
            latestBookId = booksAfterRegister - 1;
        });
    });

    it("book details in the blockchain should be the same the one gave on addBook", function () {
        // NOTE: the contract instance has been instantiated before, so no need
        // to do again: return Library.deployed().then(function(contractInstance) { ...
        // like before in last test case.
        return instance.books.call(latestBookId).then(function (result) {
            // the result is an array where in the position 0 there user ID, in
            // the position 1 the user name and in the position 2 the email,
            assert.equal(result[0], 'Test Book Name');
            assert.equal(result[1], 'Test Description');
            assert.equal(result[2], true); // valid
            assert.equal(result[3], 2000000000000000);
            assert.equal(result[4], mainAccount); // owner
        });
    }); // end testing username and email

}); // end Library contract
