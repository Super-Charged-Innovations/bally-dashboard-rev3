import React, { useState, useEffect } from 'react';
import { 
  GiftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

const RewardsManagement = ({ user }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const rewardsData = await apiService.getRewards();
      setRewards(rewardsData);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: TagIcon },
    { id: 'dining', name: 'Dining', icon: GiftIcon },
    { id: 'accommodation', name: 'Accommodation', icon: StarIcon },
    { id: 'gaming', name: 'Gaming', icon: PlusIcon },
    { id: 'merchandise', name: 'Merchandise', icon: TagIcon },
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? (rewards || [])
    : (rewards || []).filter(reward => reward.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      'dining': 'bg-orange-100 text-orange-800',
      'accommodation': 'bg-blue-100 text-blue-800',
      'gaming': 'bg-green-100 text-green-800',
      'merchandise': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Ruby':
        return 'text-red-600';
      case 'Sapphire':
        return 'text-blue-600';
      case 'Diamond':
        return 'text-gray-600';
      case 'VIP':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
          <p className="text-gray-600">Manage reward catalog and redemptions</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Reward</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-950 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredRewards.map((reward) => (
              <div key={reward.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <GiftIcon className="h-5 w-5 text-primary-950" />
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(reward.category)}`}>
                      {reward.category}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    reward.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                  }`}>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reward.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Points Required:</span>
                    <span className="font-semibold text-primary-950">
                      {reward.points_required?.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cash Value:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(reward.cash_value)}
                    </span>
                  </div>
                  {reward.stock_quantity !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className={`font-semibold ${
                        reward.stock_quantity > 10 ? 'text-green-600' : 
                        reward.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {reward.stock_quantity > 0 ? `${reward.stock_quantity} left` : 'Out of Stock'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tier Access:</p>
                  <div className="flex flex-wrap gap-1">
                    {reward.tier_access.map((tier) => (
                      <span
                        key={tier}
                        className={`text-xs font-semibold ${getTierColor(tier)}`}
                      >
                        {tier}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 text-sm bg-primary-950 text-white py-2 px-3 rounded-md hover:bg-primary-800 transition-colors flex items-center justify-center space-x-1">
                    <PencilIcon className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button className="text-sm bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition-colors">
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRewards.length === 0 && !loading && (
          <div className="text-center py-12">
            <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'Start by adding your first reward item.'
                : `No rewards found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
            <button className="mt-4 btn-primary flex items-center space-x-2 mx-auto">
              <PlusIcon className="h-4 w-4" />
              <span>Add Reward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsManagement;