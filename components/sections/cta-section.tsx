import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-6">
          Ready to transform your habits?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of people who are already building better habits and achieving their goals with HabitFlow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg" asChild>
            <Link href="/auth/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            View Pricing
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-100">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Free 14-day trial</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}