import { useState } from 'react';
import { assets } from '../admin_assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice('');
      } else {
        toast.error(response.data.message);
      }
      console.log(response.data);

    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Images</p>
        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img className='w-20 cursor-pointer' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20 cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20 cursor-pointer' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20 cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type Here' required />
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write Description here' required />
      </div>
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Mitti ke Diye">Mitti ke Diye</option>
            <option value="Mitti ke Bartan">Mitti ke Bartan</option>
            <option value="Muda Chair">Muda Chair</option>
            <option value="Genda Phool">Genda Phool</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Product Sub-Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Topwear">Topwear</option>
            <option value="Winterwear">Winterwear</option>
            <option value="Earthen">Earthen</option>
            <option value="Silver">Silver</option>
            <option value="Non-Sticky">Non-Sticky</option>
            <option value="Metal">Metal</option>
            <option value="Engineered Wood">Engineered Wood</option>
            <option value="Bamboo">Bamboo</option>
            <option value="Non-Coated">Non-Coated</option>
            <option value="Genda Phool">Genda Phool</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] ' type="number" placeholder='Price here' required />
        </div>
        
      </div>
      <div>
        <p className='mb-2'>Product Sizes (can be 1 or more)</p>
        <div className='flex gap-3'>
          <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}><p className={`${sizes.includes("S") ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded-md font-semibold`}>S</p></div>
          <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}><p className={`${sizes.includes("M") ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded-md font-semibold`}>M</p></div>
          <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}><p className={`${sizes.includes("L") ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded-md font-semibold`}>L</p></div>
          <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}><p className={`${sizes.includes("XL") ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded-md font-semibold`}>XL</p></div>
          <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}><p className={`${sizes.includes("XXL") ? "bg-black text-white" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded-md font-semibold`}>XXL</p></div>
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className='cursor-pointer font-semibold' htmlFor="bestseller">Add to BestSeller</label>
      </div>
     
      <button 
        type='submit' 
        disabled={isLoading}
        className='w-[500px] max-w-full py-3 mt-4 bg-black text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition'
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Adding Product...</span>
          </>
        ) : (
          'ADD PRODUCT'
        )}
      </button>
    </form>
  );
};

export default Add;
