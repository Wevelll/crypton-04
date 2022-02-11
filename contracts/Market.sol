//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC721Mintable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Market is Ownable, IERC721Receiver {

//STATE VARS
    using Counters for Counters.Counter;
    Counters.Counter public listingIDs;
    Counters.Counter public auctionIDs;
    uint256 public deadline;

    event ItemSold(address indexed seller, address indexed buyer, uint256 price);
    event ListingState(uint indexed listingID, state listingState);
    event AuctionState(uint indexed auctionID, uint256 price, state auctionState);
    event Bid(address indexed bidder, uint auctionID, uint256 price);

    enum state {
        ACTIVE,
        FINISHED,
        CANCELLED
    }

    struct listing {
        address seller;
        address token;
        uint256 id;
        uint256 price;
        state State;
    }

    struct auction {
        listing Listing;
        address topBidder;
        uint bids;
        uint256 startDate;
        uint256 finishDate;
    }

    mapping(uint => listing) public listings;
    mapping(uint => auction) public auctions;


//CONSTRUCTOR

    constructor () {
        deadline = 72 hours;
    }


//MODIFIERS

    modifier listingOwner(uint _id) {
        require(msg.sender == listings[_id].seller, "You are not the owner!");
        _;
    }

    modifier auctionOwner(uint _id) {
        require(msg.sender == auctions[_id].Listing.seller, "You are not the owner!");
        _;
    }


//OVERRIDES
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {

        return IERC721Receiver.onERC721Received.selector;
    }

//LISTINGS

    //Функция listItem() - выставка на продажу предмета.
    function listItem(address _token, uint256 _tokenID, uint256 _price) external returns (uint listingID) { 
        ERC721(_token).transferFrom(msg.sender, address(this), _tokenID);
        listingIDs.increment();
        listingID = listingIDs.current();
        listings[listingID] = listing(msg.sender, _token, _tokenID, _price, state.ACTIVE);

        emit ListingState(listingID, state.ACTIVE);
    }

    //Функция createItem() - создание нового предмета, обращается к контракту NFT и вызывает функцию mint.
    function createItem(address _token, uint256 _price) external returns (uint listingID) {
        uint id = ERC721Mintable(_token).mint(address(this));
        listingIDs.increment();
        listingID = listingIDs.current();
        listings[listingID] = listing(msg.sender, _token, id, _price, state.ACTIVE);

        emit ListingState(listingID, state.ACTIVE);
    }

    //Функция cancel() - отмена продажи выставленного предмета
    function cancel(uint _listingID) external listingOwner(_listingID) {
        listing storage l = listings[_listingID];
        require(l.State != state.CANCELLED, "Already cancelled!");
        l.State = state.CANCELLED;
        ERC721(l.token).transferFrom(address(this), l.seller, l.id);

        emit ListingState(_listingID, state.CANCELLED);
    }

    //Функция buyItem() - покупка предмета.
    function buyItem(uint _listingID) external payable {
        listing storage l = listings[_listingID];
        require(l.State == state.ACTIVE, "Offer finished!");
        require(msg.value == l.price, "Invalid value!");
        l.State = state.FINISHED;
        ERC721(l.token).transferFrom(address(this), msg.sender, l.id);
        payable(l.seller).call{value: l.price}("");

        emit ItemSold(l.seller, msg.sender, l.price);
        emit ListingState(l.id, state.FINISHED);
    }


//AUCTION

    //Функция listItemOnAuction() - выставка предмета на продажу в аукционе.
    function listItemOnAuction(address _token, uint _tokenID, uint256 _price) external returns (uint auctionID) {
        ERC721(_token).transferFrom(msg.sender, address(this), _tokenID);
        auctionIDs.increment();
        auctionID = auctionIDs.current();
        listing memory l = listing(msg.sender, _token, _tokenID, _price, state.ACTIVE);
        auctions[auctionID] = auction(l, address(0), 0, block.timestamp, block.timestamp + deadline);

        emit AuctionState(auctionID, _price, state.ACTIVE);
    }

    //Функция finishAuction() - завершить аукцион и отправить НФТ победителю
    function finishAuction(uint _auctionID) external auctionOwner(_auctionID) {
        auction storage a = auctions[_auctionID];
        require(block.timestamp > a.finishDate, "Cannot finish yet!");
        require(a.bids > 2, "Not enough bids!");
        a.Listing.State = state.FINISHED;
        ERC721(a.Listing.token).transferFrom(address(this), a.topBidder, a.Listing.id);
        payable(a.Listing.seller).call{value: a.Listing.price}("");

        emit ItemSold(a.Listing.seller, a.topBidder, a.Listing.price);
        emit AuctionState(a.Listing.id, a.Listing.price, state.FINISHED);
    }

    //Функция cancelAuction() - отменить аукцион
    function cancelAuction(uint _auctionID) external auctionOwner(_auctionID) {
        auction storage a = auctions[_auctionID];
        require(block.timestamp > a.finishDate, "Cannot cancel yet!");
        a.Listing.State = state.CANCELLED;
        ERC721(a.Listing.token).transferFrom(address(this), a.Listing.seller, a.Listing.id);
        payable(a.topBidder).call{value: a.Listing.price}("");

        emit AuctionState(a.Listing.id, a.Listing.price, state.CANCELLED);
    }

    //Функция makeBid() - сделать ставку на предмет аукциона с определенным id.
    function makeBid(uint _auctionID) external payable {
        auction storage a = auctions[_auctionID];
        require(a.Listing.State == state.ACTIVE, "Auction finished!");
        require(msg.value > a.Listing.price, "Not enough value!");
        a.bids++;
        payable(a.topBidder).call{value: a.Listing.price}("");
        a.topBidder = msg.sender;
        a.Listing.price = msg.value;

        emit Bid(msg.sender, _auctionID, msg.value);
    }
}