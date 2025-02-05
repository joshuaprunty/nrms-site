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

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-sans)]">
      <HeroSection backgroundColor="#f6f7fb">
        <div className="h-[50vh] flex items-center overflow-hidden">
          <div className="w-1/2 h-full py-20 flex flex-col gap-8 items-center text-center justify-center z-10">
            <h1 className="text-6xl font-bold text-gray-900">NRMS</h1>
            <p className="text-xl">Write professional journalistic stories with AI.</p>
            <Link href="/signup" passHref>
              <Button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                rel="noopener noreferrer"
              >
                Sign Up
              </Button>
            </Link>
          </div>
          <div className="w-1/2 h-full">
            <Image 
              src="/hero.png"
              alt="Background Vector"
              width={700}  // This is a placeholder value - adjust based on your image
              height={700} // This will maintain aspect ratio
              className="h-full w-auto object-cover object-left"
              priority
            />
          </div>
        </div>
      </HeroSection>

      <Section backgroundColor="#ffffff">
        <div className="py-24 w-full">
          <h1 className="text-5xl font-semibold mb-12 text-center">Explore the Power of Flexible Story Creation</h1>
          <p className="text-xl mb-12 text-center">Designed for creativity, precision, and efficiency, NRMS makes story authoring smarter and more versatile than ever before.</p>
          <Carousel 
            className="mx-auto"
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { title: "Dynamic Input Management", description: "Seamlessly gather and organize story elements into a structured repository ready for narrative generation." },
                { title: "Smart Element Selection", description: "Curate the essential details for your story with tools that help you prioritize and refine the elements most important to your audience." },
                { title: "Intelligent Narrative Generation", description: "Generate multiple, highly personalized stories with just a click, using algorithms that adapt to your input priorities and audience needs." },
                { title: "Customizable Prioritization", description: "Control the tone, focus, and flow of your narratives by ordering the importance of elements in a user-friendly interface." },
              ].map((item, index) => (
                <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4 m-3">
                  <Card className="h-full transition-transform duration-200 hover:scale-105 px-4 pb-6">
                    <div className="relative h-6 mt-12 mb-6">
                      <Image
                        src="/cardicon.png"
                        alt="Students studying"
                        fill
                        className="object-contain rounded-t-lg"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-xl text-center">{item.title}</CardTitle>
                      <CardDescription className="text-center text-lg">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="h-12 w-12 md:h-16 md:w-16" 
            />
            <CarouselNext 
              className="h-12 w-12 md:h-16 md:w-16" 
            />
          </Carousel>
        </div>
      </Section>

      <Section backgroundColor="#f6f7fb" className="flex items-center">
        <div className="py-16">
          <h1 className="text-5xl font-semibold mb-12 text-center">Explore the Power of Flexible Story Creation</h1>
          <p className="text-xl mb-12 text-center">Designed for creativity, precision, and efficiency, NRMS makes story authoring smarter and more versatile than ever before.</p>
          <Card className="w-full mx-auto my-12">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-[300px] md:h-full">
                <Image
                  src="/studying.jpg"
                  alt="Students studying"
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
              </div>
              <div className="p-6 flex flex-col justify-center min-h-[30vh]">
                <div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl">Card Title</CardTitle>
                    <CardDescription>This is a brief description of the card content.</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </CardContent>
                </div>
                <CardFooter className="p-0 mt-4">
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </div>
            </div>
          </Card>
          <Card className="w-full mx-auto my-12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 flex flex-col justify-center min-h-[30vh]">
                <div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl">Card Title</CardTitle>
                    <CardDescription>This is a brief description of the card content.</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </CardContent>
                </div>
                <CardFooter className="p-0 mt-4">
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </div>
              <div className="relative h-[300px] md:h-full">
                <Image
                  src="/studying.jpg"
                  alt="Students studying"
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}