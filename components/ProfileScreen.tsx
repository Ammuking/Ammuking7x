
import React from 'react';
import { User, Plan, Screen } from '../types';
import { CheckCircleIcon, PaytmIcon, GooglePayIcon, UpiIcon } from './Icons';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
  onPurchasePlan: (plan: Plan) => void;
  setActiveScreen: (screen: Screen) => void;
}

const plans: Plan[] = [
  {
    name: 'Pro',
    price: '$9.99/mo',
    credits: 1000,
    features: [
        '1000 credits per month',
        'Unlimited daily generations',
        '4K resolution downloads',
        'Faster generation speeds',
        'Access to exclusive styles',
        'No watermarks'
    ],
    popular: true,
  },
  {
    name: 'Max',
    price: '$19.99/mo',
    credits: 2500,
    features: ['2500 credits per month', 'All Pro features', 'Access to beta models', '24/7 support'],
  },
];

export default function ProfileScreen({ user, onLogout, onPurchasePlan }: ProfileScreenProps) {
  return (
    <div className="p-4 text-white">
      <div className="text-center my-6">
        <div className="w-24 h-24 rounded-full bg-green-500 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
          {user.emailOrPhone.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold">{user.emailOrPhone}</h2>
        <p className="text-gray-400">{user.plan} Plan</p>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center">
        <div className="flex justify-around items-center">
            {user.plan === 'Free' ? (
                <>
                    <div>
                        <span className="text-gray-400 block text-sm">Today's Free Generations</span>
                        <span className="text-2xl font-bold text-green-400">{10 - user.dailyGenerations} / 10</span>
                    </div>
                     <div>
                        <span className="text-gray-400 block text-sm">Bonus Credits</span>
                        <span className="text-2xl font-bold text-green-400">{user.credits}</span>
                    </div>
                </>
            ) : (
                 <div>
                    <span className="text-gray-400 block text-sm">Remaining Credits</span>
                    <span className="text-2xl font-bold text-green-400">{user.credits}</span>
                </div>
            )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Upgrade Your Plan</h3>
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-gray-800 p-5 rounded-lg border-2 ${plan.popular ? 'border-green-500' : 'border-gray-700'} relative`}>
            {plan.popular && <div className="absolute top-0 right-4 -mt-3 bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold">{plan.name}</h4>
                <p className="text-2xl font-extrabold text-green-400">{plan.price}</p>
              </div>
              <button 
                onClick={() => onPurchasePlan(plan)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Choose
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-3">We Accept</p>
        <div className="flex justify-center items-center space-x-4">
          <PaytmIcon className="h-6 opacity-80" />
          <GooglePayIcon className="h-6 opacity-80" />
          <UpiIcon className="h-6 opacity-80" />
        </div>
      </div>
      
      <button 
        onClick={onLogout}
        className="w-full mt-8 bg-gray-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
      >
        Sign Out
      </button>
    </div>
  );
}