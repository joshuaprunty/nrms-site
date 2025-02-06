import React from 'react'
import Image from "next/image";
import { Section } from '@/components/Section';
import { HeroSection } from '@/components/HeroSection';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"


const FormatCard = () => {
  return (
    <Card className="h-full transition-transform duration-200 hover:scale-105">
      <div className="mt-12 mb-6 flex flex-col items-center justify-center">
        <Image
          src="/lightCircle.png"
          alt="Students studying"
          className="rounded-t-lg"
          width={100}
          height={100}
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-xl text-center">Title</CardTitle>
        <CardDescription className="text-center text-lg">Description</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default FormatCard