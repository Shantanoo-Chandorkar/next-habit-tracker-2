import { TrendingUp, Users, Target, Award } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Users',
    description: 'People building better habits daily',
  },
  {
    icon: Target,
    value: '2.5M+',
    label: 'Habits Tracked',
    description: 'Successful habit completions',
  },
  {
    icon: TrendingUp,
    value: '78%',
    label: 'Success Rate',
    description: 'Users who build lasting habits',
  },
  {
    icon: Award,
    value: '150+',
    label: 'Days Average',
    description: 'Longest streak achieved',
  },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Proven results that speak for themselves
          </h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            Join thousands of users who have transformed their lives through consistent habit building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-blue-100 mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}