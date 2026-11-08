import productModel from '../models/productModel.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// Function for add product
const addProduct= async (req,res)=>{
   try {
    const {name,description,price,category,subCategory,sizes,bestseller}=req.body;
    const image1= req.files && req.files.image1 && req.files && req.files.image1[0];
    const image2= req.files && req.files.image2 && req.files && req.files.image2[0];
    const image3= req.files && req.files.image3 && req.files && req.files.image3[0];
    const image4= req.files && req.files.image4 && req.files && req.files.image4[0];

    const images=[image1,image2,image3,image4].filter((item)=> item !== undefined);

    let imagesUrl=await Promise.all(
        images.map(async (item)=>{
            const result = await uploadToCloudinary({
                file: item.buffer || item.path || item,
                mimetype: item.mimetype || 'image/jpeg',
                originalname: item.originalname || 'product.jpg',
                env: req.env || (typeof process !== 'undefined' ? process.env : {})
            });
            return result.secure_url;
        })
    )


    const productData={
        name,
        description,
        category,
        price:Number(price),
        subCategory,
        bestseller:bestseller === "true" ? true : false,
        sizes: JSON.parse(sizes),
        image: imagesUrl,
        date: Date.now()
    }

    const product= new productModel(productData);
    await product.save();



    res.json({success:true , message:"Product added"});
    
   } catch (error) {
    res.json({success:false, message:error.message})
    console.log(error);
   }
}


// Function for List product
const listProducts= async (req,res)=>{

    try {
        const products=await productModel.find({});
        res.json({success:true, products});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }

}


// Function for Remove product
const removeProduct= async (req,res)=>{
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({success:true, message:"Product removed"});
  } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message})
  }
}

// Function for single product info
const singleProduct= async (req,res)=>{
 try {
    const {productId}= req.body;
    const product=await productModel.findById(productId);
    res.json({success:true, product})
 } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message})
    
 }
}


export {listProducts,addProduct,removeProduct,singleProduct}


