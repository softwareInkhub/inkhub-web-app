'use client';

interface Testimonial {
  name: string;
  review: string;
  image: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="text-center">
            <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
            <p className="text-sm italic">"{testimonial.review}"</p>
            <p className="text-sm font-bold mt-2">{testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 