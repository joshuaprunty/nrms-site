import React from 'react'
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FormatCard = ({ title, description }) => {
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
        <CardTitle className="text-xl text-center">{title}</CardTitle>
        <CardDescription className="text-center text-lg">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default FormatCard