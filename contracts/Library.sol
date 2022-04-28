//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

import "./NftContract.sol";

abstract contract Context {
    address public owner;

    constructor() {
        owner = _msgSender();
    }

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }

    function _msgValue() internal view virtual returns (uint256 value) {
        return msg.value;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_msgSender() == owner);
        _;
    }

    /**
     * @dev Check if the current caller is the contract owner.
     */
    function isOwner() internal view returns (bool) {
        return owner == _msgSender();
    }
}

contract Library is Context {
    struct Book {
        uint256 id;
        string name;
        string description;
        bool valid; // false if been borrowed
        uint256 price; // TRX per day
        address owner; // owner of the book
    }

    uint256 public bookId;

    mapping(uint256 => Book) public books;

    struct Tracking {
        uint256 bookId;
        uint256 startTime; // start time, in timestamp
        uint256 endTime; // end time, in timestamp
        address borrower; // borrower's address
        uint256 tokenId;
    }

    uint256 public trackingId;

    mapping(uint256 => Tracking) public trackings;

    function totalBooks(bool validOnly) public view returns (Book[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < bookId; i++) {
            Book memory book = books[i];
            if (!validOnly || book.valid) {
                count++;
            }
        }

        Book[] memory result = new Book[](count);
        count = 0;
        for (uint256 i = 0; i < bookId; i++) {
            Book memory book = books[i];
            if (!validOnly || book.valid) {
                result[count++] = book;
            }
        }
        return result;
    }

    /**
     * @dev Add a Book with predefined `name`, `description` and `price`
     * to the library.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {NewBook} event.
     */
    function addBook(
        string memory name,
        string memory description,
        uint256 price
    ) public returns (bool success) {
        Book memory book = Book(
            bookId,
            name,
            description,
            true,
            price,
            _msgSender()
        );

        books[bookId] = book;

        emit NewBook(bookId++);

        return true;
    }

    /**
     * @dev Borrow a book has `_bookId`. The rental period starts from
     * `startTime` ends with `endTime`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `NewRental` event.
     */
    function borrowBook(
        uint256 _bookId,
        uint256 startTime,
        uint256 endTime
    ) public payable returns (bool) {
        Book storage book = books[_bookId];

        require(book.valid == true, "The book is currently on loan");

        require(
            _msgValue() == book.price * _days(startTime, endTime),
            "Incorrect fund sent."
        );

        _sendRentalFee(book.owner, _msgValue());

        _createTracking(_bookId, startTime, endTime);

        emit NewRental(_bookId, trackingId++, _msgSender());

        return true;
    }

    function mintNFT(
        address nftContractAddr,
        uint256 _trackingId,
        string memory tokenURI
    ) public returns (uint256) {
        Tracking storage tracking = trackings[_trackingId];
        require(
            isOwner() || tracking.borrower == _msgSender(),
            "Unauthorized to mint NFT"
        );

        if (tracking.tokenId == 0) {
            NftContract nftContract = NftContract(nftContractAddr);
            tracking.tokenId = nftContract.mintNFT(_msgSender(), tokenURI);
            emit NewNFT(tracking.bookId, _trackingId, tracking.tokenId);
        }

        return tracking.tokenId;
    }

    /**
     * @dev Delete a book from the library. Only the book's owner or the
     * library's owner is authorised for this operation.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `DeleteBook` event.
     */
    function deleteBook(uint256 _bookId) public returns (bool success) {
        require(
            _msgSender() == books[_bookId].owner || isOwner(),
            "You are not authorised to delete this book."
        );

        delete books[_bookId];

        emit DeleteBook(_bookId);

        return true;
    }

    /**
     * @dev Calculate the number of days a book is rented out.
     */
    function _days(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (uint256)
    {
        if ((endTime - startTime) % uint256(86400) == 0) {
            return (endTime - startTime) / uint256(86400);
        } else {
            return (endTime - startTime) / uint256(86400) + uint256(1);
        }
    }

    /**
     * @dev Send TRX to the book's owner.
     */
    function _sendRentalFee(address receiver, uint256 value) internal {
        payable(address(uint160(receiver))).transfer(value);
    }

    /**
     * @dev Create a new rental tracking.
     */
    function _createTracking(
        uint256 _bookId,
        uint256 startTime,
        uint256 endTime
    ) internal {
        trackings[trackingId] = Tracking(
            _bookId,
            startTime,
            endTime,
            _msgSender(),
            0
        );

        Book storage book = books[_bookId];

        book.valid = false;
    }

    /**
     * @dev Emitted when a new book is added to the library.
     * Note `bookId` starts from 0.
     */
    event NewBook(uint256 indexed bookId);

    /**
     * @dev Emitted when a new book rental is made.
     * Note `trackingId` and `bookId` start from 0.
     */
    event NewRental(
        uint256 indexed bookId,
        uint256 indexed trackingId,
        address indexed borrower
    );

    event NewNFT(
        uint256 indexed bookId,
        uint256 indexed trackingId,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when a book is deleted from the library.
     */
    event DeleteBook(uint256 indexed bookId);
}
