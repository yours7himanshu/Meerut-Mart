import { useState } from 'react';
import { assets } from './admin_assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const SellItem = ({ token }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(`${backendUrl}/api/sell-item`, formData, { headers: { token } });
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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-center text-2xl font-bold mb-6">Vendor Sell Item Form</h2>
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
          <div>
            <p className="mb-2">Upload Images</p>
            <div className="flex gap-2">
              <label htmlFor="image1">
                <img className="w-20 cursor-pointer" src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
                <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
              </label>
              <label htmlFor="image2">
                <img className="w-20 cursor-pointer" src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
                <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
              </label>
              <label htmlFor="image3">
                <img className="w-20 cursor-pointer" src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
                <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
              </label>
              <label htmlFor="image4">
                <img className="w-20 cursor-pointer" src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
                <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
              </label>
            </div>
          </div>
          <div>
            <p className="mb-2">Product Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className="w-full px-3 py-2 border rounded" type="text" placeholder="Type Here" required />
          </div>
          <div>
            <p className="mb-2">Product Description</p>
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full px-3 py-2 border rounded" placeholder="Write Description here" required />
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="mb-2">Product Category</p>
              <select onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
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
              <p className="mb-2">Product Sub-Category</p>
              <select onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
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
              <p className="mb-2">Product Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full px-3 py-2 border rounded" type="number" placeholder="Price here" required />
            </div>
          </div>
          <div>
            <p className="mb-2">Product Sizes (can be 1 or more)</p>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <div key={size} onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}>
                  <p className={`${sizes.includes(size) ? 'bg-black text-white' : 'bg-slate-200'} px-3 py-1 cursor-pointer rounded-md font-semibold`}>{size}</p>
                </div>
              ))}
            </div>
          </div>
        
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading Product...</span>
              </>
            ) : (
              'ADD PRODUCT'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
