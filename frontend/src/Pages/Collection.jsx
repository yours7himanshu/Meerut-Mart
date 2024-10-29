import  { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/frontend_assets/assets';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';

const Collection = () => {

  const {products, search,showSearch}=useContext(ShopContext);
  const [ showFilter,setShowFilter]=useState(false); 
  const [filterProducts,setFilterProducts]=useState([]);
  const [category,setCategory]=useState([]);
  const [subCategory,setSubCategory]=useState([]);
  const [sortType,setSortType]=useState('relevant')
  const [curr,setCurr]=useState('');


  const toggleCategory=(e)=>{
    if(category.includes(e.target.value)){
      setCategory(prev=> prev.filter(item=> item !== e.target.value))
    }
    else{
      setCategory(prev=> [...prev,e.target.value])
    }
  }


  const toggleSubCategory=(e)=>{
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item=> item !== e.target.value))
    }
    else{
      setSubCategory(prev=> [...prev,e.target.value]);
    }
  }


  const applyFilter=()=>{
    let productsCopy=products.slice(); // making copy of original array 

    if(showSearch && search){
      productsCopy=productsCopy.filter(item=> item.name.toLowerCase().includes(search.toLowerCase()))
    }




    if (category.length>0) {
      productsCopy=productsCopy.filter(item=> category.includes(item.category));
    }

    if (subCategory.length>0) {
      productsCopy=productsCopy.filter(item=> subCategory.includes(item.subCategory));
    }
    setFilterProducts(productsCopy);
  }


  const sortProduct=()=>{
    let fpCopy=filterProducts.slice(); // copy of filtered products
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)))
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)))
        break;
      default:
        applyFilter();
        break;
    }
  }


  useEffect(()=>{
    console.log(category);
  },[category]);

  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search,showSearch,products]);

  useEffect(()=>{
    sortProduct()
  },[sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-sm flex items-center cursor-pointer gap-2'>FILTERS 
          <img src={assets.dropdown_icon} className={`h-3 sm:hidden ${showFilter? 'rotate-90':''}`} alt="" />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter? '':'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Men'} onClick={()=> setCurr('men')} onChange={toggleCategory} /> Men
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Women'} onClick={()=> setCurr('women')} onChange={toggleCategory} /> Women
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Kids'} onClick={()=> setCurr('kids')} onChange={toggleCategory} /> Kids
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Mitti ke Bartan'} onClick={()=> setCurr('bartan')} onChange={toggleCategory} /> Mitti ke bartan
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Mitti ke Diye'} onClick={()=> setCurr('diye')} onChange={toggleCategory} /> Mitti ke Diye
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Muda Chair'} onClick={()=> setCurr('chair')} onChange={toggleCategory} /> Muda Chair
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Genda Phool'} onClick={()=> setCurr('genda')} onChange={toggleCategory} /> Genda Phool
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter? '':'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE(SubCategories)</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            
            {
              curr === 'men' || curr === 'women' || curr === 'kids' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Topwear'} onChange={toggleSubCategory} /> Topwear
            </p> : ''
            }
            {
              curr === 'men' || curr === 'women' || curr === 'kids' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Bottomwear'} onChange={toggleSubCategory} /> Bottom wear
            </p> : ''
            }
            {
              curr === 'men' || curr === 'women' || curr === 'kids' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Winterwear'} onChange={toggleSubCategory} /> Winterwear
            </p> : ''
            }
            
            {
              curr === 'bartan' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Non-Coated'} onChange={toggleSubCategory} /> Non-Coated
            </p> : ''
            }
            {
              curr === 'bartan' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Non-Sticky'} onChange={toggleSubCategory} /> Non-Sticky
            </p> : ''
            }
            {
              curr === 'diye' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Silver'} onChange={toggleSubCategory} /> Silver
            </p> : ''
            }
            {
              curr === 'diye'? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Earthen'} onChange={toggleSubCategory} /> Earthen
            </p> : ''
            }
            {
              curr === 'chair'  ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Bamboo'} onChange={toggleSubCategory} /> Bamboo
            </p> : ''
            }
            {
              curr === 'chair'  ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Engineered Wood'} onChange={toggleSubCategory} /> Engineered Wood
            </p> : ''
            }
            {
              curr === 'chair'  ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Metal'} onChange={toggleSubCategory} /> Metal
            </p> : ''
            }
            {
              curr === 'genda' ? 
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Genda Phool'} onChange={toggleSubCategory} /> Genda Phool
            </p> : ''
            }
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className='flex-1'>
        <div className='flex items-center justify-center text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select onChange={(e)=> setSortType(e.target.value)} className='border-2 border-gray-300 h-8 text-xs px-2'>
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 gap-y-6'>
          {
          filterProducts.map((item,index)=>(
              <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
          ))
          }
        </div>
      </div>
      
    </div>
  )
}

export default Collection
