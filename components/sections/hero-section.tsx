import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-6">
            {/* Badge */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                Trusted by 50,000+ users
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Build 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> better habits</span>, transform your life
            </h1>

            {/* Description */}
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Track your daily habits, visualize your progress, and build lasting routines with our comprehensive habit tracking platform. Start your transformation journey today.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white" />
                  ))}
                </div>
                <span className="ml-3">Join thousands of users</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-800 font-medium">Morning Exercise</span>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-800 font-medium">Read 20 pages</span>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-medium">Meditate</span>
                      <div className="w-6 h-6 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                      <span className="text-sm font-bold text-blue-600">85%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}