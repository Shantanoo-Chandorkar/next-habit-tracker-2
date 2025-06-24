import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  BarChart3, 
  Target, 
  Palette, 
  Eye, 
  TrendingUp,
  Clock,
  Bell,
  Users
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Custom Habit Creation',
    description: 'Create personalized habits with custom categories, frequencies, and goals tailored to your lifestyle.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Palette,
    title: 'Custom Categories',
    description: 'Organize your habits with color-coded categories. Health, productivity, learning - make it your own.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Eye,
    title: 'Multiple Views',
    description: 'Switch between daily, weekly, monthly, and yearly views to track progress at any time scale.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed insights, streak tracking, and progress visualization to understand your habit patterns.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visual progress indicators, streak counters, and achievement badges to keep you motivated.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Set optimal times for each habit with intelligent scheduling suggestions based on your patterns.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Customizable notifications that adapt to your schedule and help you stay consistent.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: Calendar,
    title: 'Calendar Integration',
    description: 'Seamlessly integrate with your existing calendar apps for a unified scheduling experience.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Users,
    title: 'Social Features',
    description: 'Share achievements, join challenges, and stay motivated with our supportive community.',
    color: 'from-cyan-500 to-cyan-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-4">
            Everything you need to build 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> lasting habits</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to track, analyze, and maintain your habits effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Built for your success
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Scientifically Backed</h4>
                  <p className="text-gray-600">Built on proven habit formation research and behavioral psychology principles.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Privacy First</h4>
                  <p className="text-gray-600">Your data is encrypted and stored securely. We never share your personal information.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cross-Platform</h4>
                  <p className="text-gray-600">Access your habits anywhere - web, mobile, or desktop. Always in sync.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Daily Habits Completed</span>
                  <span className="text-2xl font-bold text-green-600">8/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Current Streak</span>
                  <span className="text-2xl font-bold text-blue-600">23 days</span>
                </div>
                <div className="text-sm text-gray-500">Personal best: 45 days</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">This Month</span>
                  <span className="text-2xl font-bold text-purple-600">92%</span>
                </div>
                <div className="text-sm text-green-600">↑ 12% from last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}