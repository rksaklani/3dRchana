import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Try the 3D viewer with limited projects and storage.',
    features: ['1 project', 'Up to 3 uploads', 'Community support', 'Browser viewer'],
    cta: 'Get started',
    to: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For teams and power users who need more capacity.',
    features: ['Unlimited projects', 'Unlimited uploads', 'Priority processing', 'Email support', 'Higher quality streaming'],
    cta: 'Start free trial',
    to: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Dedicated infrastructure and SLA for large organizations.',
    features: ['Everything in Pro', 'Dedicated streamers', 'SLA', 'Custom integrations', 'Account manager'],
    cta: 'Contact sales',
    to: '/signup',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade when you’re ready.
          </p>
        </div>
        <div className="mt-16 grid sm:grid-cols-3 gap-8 lg:gap-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 bg-white p-8 flex flex-col ${
                plan.highlighted ? 'border-primary-500 shadow-xl ring-2 ring-primary-500/20' : 'border-gray-200'
              }`}
            >
              <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              <p className="mt-4 text-gray-600 text-sm">{plan.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-primary-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`mt-8 block w-full rounded-xl py-3 text-center font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
