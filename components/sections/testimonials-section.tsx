import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'HabitFlow completely transformed how I approach personal development. The analytics feature helped me understand my patterns and build streaks I never thought possible.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'The multiple view options are game-changing. Being able to see my progress from daily to yearly perspectives keeps me motivated and focused on long-term goals.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Fitness Coach',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'I recommend HabitFlow to all my clients. The custom categories and smart reminders make it so easy to stick to new routines. My clients love the visual progress tracking.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Entrepreneur',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'As someone juggling multiple projects, HabitFlow helps me maintain the daily habits that keep me grounded and productive. The streak tracking is incredibly motivating.',
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'Teacher',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'The simplicity combined with powerful features is perfect. I\'ve tried many habit trackers, but HabitFlow is the only one I\'ve stuck with for over a year.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Writer',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'The analytics dashboard gives me insights I never had before. Understanding when and why I succeed or struggle has been key to building consistent writing habits.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Loved by thousands of 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> habit builders</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our users say about their journey to building better habits with HabitFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}