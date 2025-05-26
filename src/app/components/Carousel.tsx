"use client"

import { useState } from "react"
import { CldImage } from "next-cloudinary"

interface CarouselProps {
  images: string[]
}

export const Carousel = ({ images }: CarouselProps) => {
  const [current, setCurrent] = useState(0)

  const prevSlide = () => {
    setCurrent((current - 1 + images.length) % images.length)
  }

  const nextSlide = () => {
    setCurrent((current + 1) % images.length)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative h-80 overflow-hidden rounded-lg">
        {images.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <CldImage
              src={image}
              alt={`Slide ${index}`}
              width="400"
              height="300"
              className="rounded-lg mx-auto object-cover"
              crop={{ type: "auto", source: true }}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-pink-600" : "bg-pink-300"
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 p-2 rounded-full shadow"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 p-2 rounded-full shadow"
      >
        ›
      </button>
    </div>
  )
}
