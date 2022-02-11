//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC721Mintable is ERC721URIStorage, Ownable, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;
    bytes32 public constant MINTER = keccak256("MINTER");
    Counters.Counter private _tokenIDs;

    string public __baseURI = "";
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        //_setRoleAdmin(MINTER, MINTER);
        _grantRole(MINTER, msg.sender);
    }

    modifier tokenOwner(uint _id) {
        require(ownerOf(_id) == msg.sender, "Not your token!");
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        _grantRole(MINTER, _minter);
    }

    function removeMinter(address _minter) external onlyOwner {
        _revokeRole(MINTER, _minter);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool)  {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return bytes(_baseURI()).length > 0 ? string(abi.encodePacked(__baseURI, tokenId.toString(), ".json")) : "";
    }

    function setBaseURI(string memory _uri) external onlyOwner {
        __baseURI = _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    function mint(address _to) external returns (uint256) {
        require(hasRole(MINTER, msg.sender), "You cannot mint!");
        _tokenIDs.increment();
        uint256 newItemID = _tokenIDs.current();
 
        string memory newURI = string(abi.encodePacked(newItemID.toString(), ".json"));
        _safeMint(_to, newItemID);
        _setTokenURI(newItemID, newURI);
        return newItemID;
   }

   function burn(uint256 _id) external tokenOwner(_id) {
       super._burn(_id);
   }
}