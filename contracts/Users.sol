//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

abstract contract Context {
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
}

abstract contract Owner is Context {
    address public owner;

    constructor() {
        owner = _msgSender();
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

contract Users is Owner {
    // data structure that stores a user
    struct User {
        string name;
        string email;
        address walletAddress;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // it maps the user's wallet address with the user ID
    mapping(address => uint256) public usersIds;

    // Array of User that holds the list of users and their details
    User[] public users;

    // event fired when an user is registered
    event newUserRegistered(uint256 id);

    // event fired when an user is registered
    event userUnregistered(uint256 id);

    // event fired when the user updates his email or name
    event userUpdateEvent(uint256 id);

    // Modifier: check if the caller of the smart contract is registered
    modifier checkSenderIsRegistered() {
        require(isRegistered());
        _;
    }

    /**
     * Constructor function
     */
    constructor() {
        // NOTE: the first user MUST be emtpy: if you are trying to access to an element
        // of the usersIds mapping that does not exist (like usersIds[0x12345]) you will
        // receive 0, that's why in the first position (with index 0) must be initialized
        addUser(address(0x0), "", "");
        // Some dummy data
        // addUser(address(0x333333333333), "Leo Brown", "Available");
        // addUser(address(0x111111111111), "John Doe", "Very happy");
        // addUser(address(0x222222222222), "Mary Smith", "Not in the mood today");
    }

    /**
     * Function to register a new user.
     *
     * @param _userName 	The displaying name
     * @param _email        The email of the user
     */
    function registerUser(string memory _userName, string memory _email)
        public
        returns (uint256)
    {
        return addUser(_msgSender(), _userName, _email);
    }

    /**
     * Add a new user. This function must be private because an user
     * cannot insert another user on behalf of someone else.
     *
     * @param _wAddr 		Address wallet of the user
     * @param _userName		Displaying name of the user
     * @param _email    	email of the user
     */
    function addUser(
        address _wAddr,
        string memory _userName,
        string memory _email
    ) private returns (uint256) {
        // checking if the user is already registered
        uint256 userId = usersIds[_wAddr];
        require(userId == 0, "The user is already registered");

        // associating the user wallet address with the new ID
        uint256 newUserId = users.length;
        usersIds[_wAddr] = newUserId;

        // storing the new user details
        users.push(
            User({
                name: _userName,
                email: _email,
                walletAddress: _wAddr,
                createdAt: block.timestamp,
                updatedAt: block.timestamp
            })
        );

        // emitting the event that a new user has been registered
        emit newUserRegistered(newUserId);

        return newUserId;
    }

    /**
     * Function to unregister a new user.
     */
    function unregisterUser() public returns (bool success) {
        uint256 userId = usersIds[_msgSender()];
        require(userId != 0, "The user is not registered");

        usersIds[_msgSender()] = 0;
        emit userUnregistered(userId);

        return true;
    }

    /**
     * Update the user profile of the caller of this method.
     * Note: the user can modify only his own profile.
     *
     * @param _newUserName	The new user's displaying name
     * @param _newemail 	The new user's email
     */
    function updateUser(string memory _newUserName, string memory _newemail)
        public
        checkSenderIsRegistered
        returns (uint256)
    {
        // An user can modify only his own profile.
        uint256 userId = usersIds[_msgSender()];

        User storage user = users[userId];

        user.name = _newUserName;
        user.email = _newemail;
        user.updatedAt = block.timestamp;

        emit userUpdateEvent(userId);

        return userId;
    }

    /**
     * Get the user's profile information.
     *
     * @param _id 	The ID of the user stored on the blockchain.
     */
    function getUserById(uint256 _id)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            address,
            uint256,
            uint256
        )
    {
        // checking if the ID is valid
        require((_id > 0) && (_id < users.length));

        User memory i = users[_id];

        return (
            _id,
            i.name,
            i.email,
            i.walletAddress,
            i.createdAt,
            i.updatedAt
        );
    }

    /**
     * Return the profile information of the caller.
     */
    function getOwnProfile()
        public
        view
        checkSenderIsRegistered
        returns (
            uint256,
            string memory,
            string memory,
            address,
            uint256,
            uint256
        )
    {
        uint256 id = usersIds[_msgSender()];

        return getUserById(id);
    }

    /**
     * Check if the user that is calling the smart contract is registered.
     */
    function isRegistered() public view returns (bool) {
        return (usersIds[_msgSender()] > 0);
    }

    function totalUsers() public view returns (uint256) {
        // NOTE: the total registered user is length-1 because the user with
        // index 0 is empty check the contructor: addUser(address(0x0), "", "");
        return users.length - 1;
    }
}
