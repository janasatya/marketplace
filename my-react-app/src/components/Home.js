import { BigNumber, ethers } from "ethers";
import { useState,  useEffect} from "react";
import { Contract_Address, ALCHEMY_KEY} from "../others/config";
import ABI from '../others/Marketplace.json'

export default function Home(props) {
  let allItem = props.items;
  const [reload,setReload]=useState(true);

  useEffect(()=>{
    async function fetchData(){
      try{
      const provider = await new ethers.providers.JsonRpcProvider(ALCHEMY_KEY);
      const abi = ABI.abi;
      const contract = await new ethers.Contract(Contract_Address, abi, provider);
      let i=1;
      let tem=[];
      while(true){
        const data=await contract.getNftData(BigNumber.from(i));
        const price=ethers.utils.formatEther(data[0])
        const isSold=data[1];
        if(isSold){
          i++;
          continue;
        }
        if(price==0)
        break;

        const tokenUri=await contract.tokenURI(BigNumber.from(i));
        tem.push({id:i,price:price,tokenUri:tokenUri});
        
        i++;
      }
      props.setTotalNft(i-1);
      const allItems = await Promise.all(
        tem.map(async (item) => {
          let meta = await fetch(item.tokenUri);
          meta = await meta.json();
          return {
            id:item.id,price:item.price,image:meta.image
          };
        })
      );
      console.log(allItems)
      props.setAllItem(allItems);
      props.setMyItem([]);
      setReload(false)
      }catch(error){
        console.log(error);
        alert("Please reload the page");
        return;
      }
    }
    fetchData();
  },[])

  function change(i) {
    let item = allItem[i];
    let newItems = allItem.slice(0, i).concat(allItem.slice(i + 1));
    props.setAllItem(newItems);
    let myItem = props.myItem;
    myItem.push(item);
    props.setMyItem(myItem);
    console.log(allItem)
  }
  
  if(reload){
    return (
      <div className='text-4xl text-center m-20'>
            Wait for a minute........
        </div>
    )
  }
  if(props.items.length==0){
    return (
        <div className="text-2xl m-20 text-center">
            No Item is Here
        </div>
    )
  }

  return (
    <div className="m-10">
      <div className="flex flex-wrap gap-4 content-start w-4/6 m-auto ">
        {allItem.map((item, i) => {
          return (
            <li className="list-none border-2 border-grey bg-slate-200 p-3 rounded-lg" key={i+1}>
              <img src={item.image} alt="" className="h-[300px]" />
              <div>
                <span className="bg-cyan-700 w-1/2 inline-block py-2 text-white">
                  Price: {item.price} eth
                </span>
                <button
                  className="bg-black text-white w-1/2 py-2"
                  onClick={() => {
                    change(i);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </li>
          );
        })}
      </div>
    </div>
  );
}
