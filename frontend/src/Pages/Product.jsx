import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import RelatedProducts from '../Components/RelatedProducts';
import Review from '../Components/Review';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex flex-col lg:flex-row lg:gap-12 gap-8">
        {/* Product Images */}
        <div className="lg:flex-1 flex flex-col gap-4 lg:flex-row lg:gap-3">
          <div className="flex flex-col items-center lg:items-start gap-2 lg:gap-4 overflow-x-auto lg:overflow-y-auto w-full lg:w-[18.7%]">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg cursor-pointer border border-gray-300 hover:border-gray-500 transition"
                alt=""
              />
            ))}
          </div>
          <div className="w-full lg:w-[80%]">
            <img src={image} className="w-full h-auto rounded-lg border border-gray-300" alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:flex-1 px-4 lg:px-0">
          <h1 className="font-medium text-xl lg:text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_icon} alt="" className="w-4" />
            <img src={assets.star_dull_icon} alt="" className="w-4" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-lg lg:text-2xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-600 lg:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 font-semibold ${item === size ? 'rounded-md border-2 border-orange-500' : ''}`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-6 py-2 lg:px-8 lg:py-3 text-sm active:bg-gray-700 font-semibold rounded-md"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 bg-gray-700 lg:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on Delivery is available on this Product</p>
            <p>Easy Return and Exchange Policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description and Review Section */}
      <div className="mt-12">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-4 lg:px-6 py-4 lg:py-6 text-sm text-gray-500">
          <p>Dummy text comes here.</p>
          <p>Again, the dummy text goes here.</p>
        </div>
      </div>

      {/* Review and Related Products */}
      <Review productId={productId} />
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;

