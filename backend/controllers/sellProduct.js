import { uploadToCloudinary } from '../services/cloudinaryService.js';
import sellProductModel from '../models/sellerProductModel.js';
import productModel from '../models/productModel.js';


// Function for add product
const sellProduct= async (req,res)=>{
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

    const product= new sellProductModel(productData);
    await product.save();



    res.json({success:true , message:"Product added"});
    
   } catch (error) {
    res.json({success:false, message:error.message})
    console.log(error);
   }
}

const addItemToWebsite = async (req, res) => {
    const { id } = req.params;  // Product ID from URL

    try {
        // Fetch the product from the seller's product collection
        const sellerProduct = await sellProductModel.findById(id);
        if (!sellerProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Create a new product for the main website's product collection
        const newProduct = new productModel({
            name: sellerProduct.name,
            description: sellerProduct.description,
            category: sellerProduct.category,
            price: sellerProduct.price,
            subCategory: sellerProduct.subCategory,
            bestseller: sellerProduct.bestseller,
            sizes: sellerProduct.sizes,
            image: sellerProduct.image,
            date: Date.now(),
            sellerId: sellerProduct._id  // Keep track of the original seller product's ID
        });

        // Save the new product to the main products collection
        await newProduct.save();
        
        const deletedProduct = await sellProductModel.findByIdAndDelete(id);
        if(!deletedProduct){
            return res.status(404).json({
                success:false,
                error:"Product not found"
            })
        }
         
  

        res.status(201).json({ message: "Product successfully added to the website", product: newProduct });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding the product to the website" });
    }
};



export {addItemToWebsite,sellProduct};
