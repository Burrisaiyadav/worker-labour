import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <div id="features"><Features /></div>
      <div id="testimonials"><Testimonials /></div>
    </>
  );
};

export default Home;
