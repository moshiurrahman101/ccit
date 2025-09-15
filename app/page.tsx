import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Courses } from "@/components/home/Courses";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Courses />
      <Testimonials />
      <Newsletter />
    </div>
  );
}