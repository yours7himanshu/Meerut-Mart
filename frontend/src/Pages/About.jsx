import React from 'react'
import Title from '../Components/Title'
import {assets} from '../assets/frontend_assets/assets'
import NewsletterBox from '../Components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-4xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img src={assets.hero1} alt="" className='w-full md:max-w-[450px]'/>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-700'>
          <p>
         <span className='font-bold'> Welcome to FlipZone! </span><br/> <br/>
          At FlipZone, our mission is to bridge the gap between traditional craftsmanship and the digital marketplace. We specialize in showcasing and selling exquisite mitti ke diye (clay lamps) and mitti ke bartan (clay utensils) crafted by skilled artisans and small vendors who embody the rich heritage of traditional Indian pottery.
          </p>
          <b className='text-gray-800'>What we do ?</b>
          <p>By partnering with small vendors and artisans, we offer a curated collection of beautiful, handcrafted clay products. Each item tells a unique story of tradition, skill, and dedication. Our goal is to create a seamless and user-friendly online shopping experience, allowing customers to explore and purchase authentic mitti ke diye and mitti ke bartan with ease.</p>
          <b className='text-gray-800'>Who we are ?</b>
          <p>We are a passionate team dedicated to empowering local artisans and vendors who have yet to experience the benefits of the digital world. We understand the challenges faced by these talented individuals in reaching a wider audience and achieving greater financial success. Our platform is designed to bring their exceptional products online, helping them gain visibility and attract customers from all corners of the globe.</p>
        </div>
      </div>
      <div className='text-2xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Support for Artisans</b>
          <p className='text-gray-700'>We are committed to providing a platform where traditional craftsmanship is celebrated and supported. By digitalizing their presence, we help artisans reach new markets and earn fair profits.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Authenticity and Quality</b>
          <p className='text-gray-700'>Our products are sourced directly from artisans who use age-old techniques to create high-quality, genuine clay items. Each piece is a testament to the craftsmanship and cultural significance of their work.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Sustainable and Ethical </b>
          <p className='text-gray-700'>We believe in promoting sustainable practices and ensuring that our vendors are fairly compensated. Our focus is on creating a positive impact on their livelihoods and preserving the art of traditional pottery.</p>
        </div>
      </div>
      <div className='text-2xl py-4'>
        <Title text1={'Join Us'} text2={'On This Journey'}/>
      </div>
      <div className='flex flex-col justify-center gap-6 md:w-full text-gray-700'>
          <p>Whether you're a vendor looking to expand your reach or a customer seeking beautiful, handcrafted products, FlipZone is here to make a difference. Explore our collection, support local artisans, and be a part of a movement that values tradition and innovation.<br/> <br/>

            Thank you for visiting Meerut Mart. Together, we can help preserve heritage, empower small businesses, and bring the beauty of traditional pottery into homes worldwide.

            Warm regards, <br/><br/>

            <span className='font-bold'>The Meerut Mart Team. </span> </p><br/><br/>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About
