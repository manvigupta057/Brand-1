import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import CSS natively inside React
import 'swiper/css';

// --- DATA ---
const topRowBrands = [
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-1-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-1-1.svg", alt: "Tochiba" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-2-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-2-1.svg", alt: "Fujitsu" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-3-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-3-1.svg", alt: "Philips" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-4-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-4-1.svg", alt: "Casio" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-5-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-5-1.svg", alt: "Nichicon" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-6-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-6-1.svg", alt: "Sony" },
];

const bottomRowBrands = [
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-7-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-7-1.svg", alt: "Daikin" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-8-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-8-1.svg", alt: "Kyocera" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-9-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-9-1.svg", alt: "Omron" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-10-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-10-1.svg", alt: "Hoya" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-11-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-11-1.svg", alt: "Olympus" },
  { img1: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-12-0.svg", img2: "https://bato-web-agency.github.io/bato-shared/img/ticker-1/image-12-1.svg", alt: "Fujikura" },
];

export default function BrandTicker() {
  // Calculate dynamic gap just like the vanilla JS snippet did
  const [gap, setGap] = useState(15);
  
  useEffect(() => {
    const calcGap = () => {
      const isDesktop = window.innerWidth > 767.9;
      setGap(isDesktop ? 0.0285 * window.innerWidth : 15);
    };
    calcGap();
    window.addEventListener('resize', calcGap);
    return () => window.removeEventListener('resize', calcGap);
  }, []);

  // Shared configuration for both Swiper instances
  const baseSwiperConfig = {
    modules: [Autoplay],
    loop: true,
    slidesPerView: "auto",
    spaceBetween: gap,
    speed: 8000,
    allowTouchMove: false, 
  };

  return (
    <section className="w-full max-w-[100dvw] pb-12 overflow-hidden bg-transparent flex flex-col items-center mt-12">
      
      {/* Title & Description section */}
      <div className="w-full max-w-5xl px-4 text-center mb-10">
        <h2 className="text-xl md:text-2xl font-black text-slate-200 mb-2 tracking-widest uppercase">
          A World of Trusted Brands
        </h2>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          A seamless continuous ticker of trusted brand logos, showcasing the power of partnership with smooth scrolling and hover effects
        </p>
      </div>

      {/* The Two Scrolling Tickers */}
      <div className="w-full flex flex-col gap-[15px] md:gap-[2vw]">
        
        <Swiper {...baseSwiperConfig} autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: false }} className="w-full">
          {[...topRowBrands, ...topRowBrands, ...topRowBrands].map((brand, i) => (
            <SwiperSlide key={i} className="!w-auto">
              <div className="horizontal-ticker__slide hover:bg-white/10 transition-colors group cursor-pointer">
                {/* CSS Magic to invert black logos to white */}
                <img src={brand.img1} alt={brand.alt} loading="lazy" className="brightness-0 invert opacity-60 group-hover:opacity-100" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper {...baseSwiperConfig} autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: true }} className="w-full">
          {[...bottomRowBrands, ...bottomRowBrands, ...bottomRowBrands].map((brand, i) => (
            <SwiperSlide key={i} className="!w-auto">
              <div className="horizontal-ticker__slide hover:bg-white/10 transition-colors group cursor-pointer">
                <img src={brand.img1} alt={brand.alt} loading="lazy" className="brightness-0 invert opacity-60 group-hover:opacity-100" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}
