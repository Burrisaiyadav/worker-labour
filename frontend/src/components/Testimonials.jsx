import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      name: "Rajesh Kumar",
      role: "Wheat Farmer, Punjab",
      content: "Found a group of 20 workers for harvesting within 2 hours. Very professional and hardworking team.",
      rating: 5
    },
    {
      name: "Suresh Reddy",
      role: "Cotton Farmer, Telangana",
      content: "The payment system is very secure. I don't have to worry about advance payments running away.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Labour Contractor",
      content: "Best app for labour groups. We get consistent work throughout the season and timely payments.",
      rating: 4
    },
    {
      name: "Mahesh Yadav",
      role: "Rice Farmer, Bihar",
      content: "Quick hiring and genuine workers. Saved a lot of time during peak season.",
      rating: 5
    },
    {
      name: "Ravi Sharma",
      role: "Sugarcane Farmer, UP",
      content: "Labour groups are well managed and always available when needed.",
      rating: 4
    },
       {
      name: "Mahesh Yadav",
      role: "Rice Farmer, Bihar",
      content: "Quick hiring and genuine workers. Saved a lot of time during peak season.",
      rating: 5
    },
  ];

  const visibleCards = 3; // desktop cards
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev + visibleCards >= reviews.length ? 0 : prev + visibleCards
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <section id="testimonials" className="py-20 bg-green-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What Farmers Say
        </h2>

        {/* Slider */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${(current * 100) / visibleCards}%)` }}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                className="w-full md:w-1/3 px-4 flex-shrink-0"
              >
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition h-full">
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 mb-6 italic">
                    "{review.content}"
                  </p>

                  <div>
                    <div className="font-semibold text-gray-900">
                      {review.name}
                    </div>
                    <div className="text-sm text-green-600">
                      {review.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
