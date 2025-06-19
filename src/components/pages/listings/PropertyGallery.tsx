"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GalleryProps {
  images: string[];
}

const PropertyGallery = ({ images }: GalleryProps) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Reset current index when images change
  useEffect(() => {
    setCurrent(0);
    mainApi?.scrollTo(0);
  }, [images]);

  // Initialize and clean up carousel API
  useEffect(() => {
    if (!mainApi) return;

    const handleSelect = () => {
      setCurrent(mainApi.selectedScrollSnap());
    };

    mainApi.on("select", handleSelect);

    return () => {
      mainApi.off("select", handleSelect);
    };
  }, [mainApi]);

  const handleThumbnailClick = (index: number) => {
    mainApi?.scrollTo(index);
  };

  const mainImage = useMemo(
    () =>
      (images?.length > 0
        ? images
        : ["/property-type/placeholder-property-image.jpg"]
      )?.map((image, index) => (
        <CarouselItem key={index}>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={image}
              alt={`Property Image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder-property.jpg";
              }}
            />
          </div>
        </CarouselItem>
      )),
    [images]
  );

  const thumbnailImages = useMemo(
    () =>
      (images?.length > 0
        ? images
        : ["/property-type/placeholder-property-image.jpg"]
      )?.map((image, index) => (
        <button
          key={index}
          type="button"
          className={`relative aspect-square cursor-pointer h-20 flex-shrink-0 rounded-sm transition-all ${
            current === index
              ? "ring-4 ring-[#6BADA0] opacity-100"
              : "opacity-70 hover:opacity-90"
          }`}
          onClick={() => handleThumbnailClick(index)}
        >
          <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-property.jpg";
            }}
          />
        </button>
      )),
    [images, current]
  );

  return (
    <div className="w-full">
      {/* Main Carousel */}
      <Carousel setApi={setMainApi} className="w-full">
        <CarouselContent>{mainImage}</CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 rounded-lg cursor-pointer" />
            <CarouselNext className="right-2 rounded-lg cursor-pointer" />
          </>
        )}
      </Carousel>

      {/* Thumbnails */}
      <div className="mt-4">
        <div className="flex gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {thumbnailImages}
        </div>
      </div>
    </div>
  );
};

export default PropertyGallery;
