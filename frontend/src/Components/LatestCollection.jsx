import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const {products}=useContext(ShopContext);
    const [latestProducts,setLatestProducts]=useState([]);
    const [visibleCount, setVisibleCount] = useState(16);

    useEffect(()=>{
        setLatestProducts(products.slice(0,visibleCount));
    },[products, visibleCount]);

    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 16);
    };

  return (
    <div className='my-10' >
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Lorum Ipsum is simply dummy Text of the printing and typesetting industry.
        </p>
      </div>
        {/* Rendering Products */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 gap-y-6'>
            {
                latestProducts.map((item,index)=>(
                        <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))
            }
        </div>

        {/* Show More Button */}
        {visibleCount < products.length && (
            <div className='text-center mt-10'>
                <button 
                    onClick={handleShowMore}
                    className='bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-all duration-300'
                >
                    Show More
                </button>
            </div>
        )}


    </div>
  )
}

export default LatestCollection
