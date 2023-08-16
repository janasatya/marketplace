// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Marketplace is ERC721URIStorage{

        constructor()ERC721("SNFT","SNFT"){}
        using Counters for Counters.Counter;
        Counters.Counter private _tokenIds;

        struct SNFT{
            uint price;
            bool isSold;
        }

        mapping(uint=>SNFT) private idToToken; // token id ==> nft 
        function getNftData(uint tokenId)external view returns(uint,bool){
            SNFT memory token=idToToken[tokenId];
            return (token.price,token.isSold);
        }

        event MintNFT(uint tokenId);
        event Buy(address buyer,uint[] tokenIds);

        function mint(uint price, string memory tokenUri)public {
        require(price>0,"price should be getter than 0");
        address nftOwner=msg.sender;
        _tokenIds.increment();
        uint tid=_tokenIds.current();
        SNFT memory nft=SNFT(price,false);
        idToToken[tid]=nft;
        
        _mint(nftOwner,tid);
        _setTokenURI(tid,tokenUri);
        
        emit MintNFT(tid);
        }

        function buyNFTs(uint[] memory arr)public payable{
            uint n=arr.length;
            uint sum=0;
            SNFT[] memory nftArr=new SNFT[](n);
            for(uint i=0;i<n;i++){
                require(_exists(arr[i]),"tokenId does not exits");
                uint tokenId=arr[i];
                nftArr[i]=idToToken[tokenId];
                require(nftArr[i].isSold==false,"the item is already sold");
                sum+=nftArr[i].price;
            }
            uint totalPrie=msg.value;
            require(totalPrie==sum,"requried price and buying price should be matched");
            address buyer=msg.sender;
            for(uint i=0;i<n;i++){
                uint tokenId=arr[i];
                uint price=nftArr[i].price;
                address nftOwner=_ownerOf(tokenId);
                payable(nftOwner).transfer(price);
                _transfer(nftOwner,buyer,tokenId);
                idToToken[tokenId].isSold=true;
            }
            emit Buy(buyer,arr);
        }

}