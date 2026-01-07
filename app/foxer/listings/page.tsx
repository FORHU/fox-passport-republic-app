"use client";

import React, { useState } from 'react';
import { Building2, Package, ChefHat, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useCreateListingModal } from '@/hooks/useCreateListingModal';

export default function ListingsPage() {
  const { onOpen } = useCreateListingModal();
  const [activeTab, setActiveTab] = useState<'all' | 'venue' | 'equipment' | 'catering'>('all');

  const mockListings = [
    {
      id: 1,
      type: 'venue',
      title: 'Modern Event Space Downtown',
      location: 'Manila, Metro Manila',
      price: '₱5,000',
      priceUnit: 'per hour',
      capacity: 100,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1519167758481-83f29da1eb4a?q=80&w=600',
    },
    {
      id: 2,
      type: 'equipment',
      title: 'Professional Sound System',
      quantity: 3,
      price: '₱2,500',
      priceUnit: 'per day',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600',
    },
    {
      id: 3,
      type: 'catering',
      title: 'Premium Filipino Buffet Package',
      servesPerOrder: 50,
      price: '₱350',
      priceUnit: 'per person',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600',
    },
  ];

  const filteredListings = activeTab === 'all'
    ? mockListings
    : mockListings.filter(listing => listing.type === activeTab);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'venue':
        return <Building2 className="w-5 h-5" />;
      case 'equipment':
        return <Package className="w-5 h-5" />;
      case 'catering':
        return <ChefHat className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'venue':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'equipment':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'catering':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="w-full p-6 md:p-8 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Listings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your venues, equipment, and catering services</p>
        </div>
        <button
          onClick={onOpen}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-xl">
              <Building2 className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-sm font-bold text-pink-500">Active</span>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">3</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Listings</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">1</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Venues</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">1</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Equipment</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <ChefHat className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">1</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Catering</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Listings' },
          { key: 'venue', label: 'Venues' },
          { key: 'equipment', label: 'Equipment' },
          { key: 'catering', label: 'Catering' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 border border-pink-100 dark:border-pink-900/30 hover:border-pink-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="group bg-white dark:bg-card-dark rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-900/30 hover:shadow-2xl hover:shadow-pink-200/40 dark:hover:shadow-none hover:-translate-y-2 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url("${listing.image}")` }}
              ></div>
              <div className={`absolute top-4 left-4 ${getTypeColor(listing.type)} px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                {getTypeIcon(listing.type)}
                {listing.type}
              </div>
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-green-600">
                {listing.status}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="font-bold text-xl leading-snug mb-3 text-gray-800 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-1">
                {listing.title}
              </h3>

              {listing.type === 'venue' && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                  <span className="text-pink-500 flex-shrink-0">📍</span>
                  <span className="truncate">{listing.location}</span>
                </div>
              )}

              {listing.type === 'equipment' && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                  <span className="text-purple-500 flex-shrink-0">📦</span>
                  <span>Available: {listing.quantity} units</span>
                </div>
              )}

              {listing.type === 'catering' && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                  <span className="text-orange-500 flex-shrink-0">🍽️</span>
                  <span>Serves {listing.servesPerOrder} people</span>
                </div>
              )}

              {listing.type === 'venue' && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                  <span className="text-blue-500 flex-shrink-0">👥</span>
                  <span>Capacity: {listing.capacity} people</span>
                </div>
              )}

              <div className="pt-4 border-t border-pink-50 dark:border-pink-900/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-black text-xl text-pink-500">{listing.price}</span>
                  <span className="text-xs text-gray-500">{listing.priceUnit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="bg-white dark:bg-card-dark rounded-2xl border-2 border-dashed border-pink-200 dark:border-pink-900/30 p-12 text-center">
          <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No listings found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first listing to showcase your offerings
          </p>
          <button
            onClick={onOpen}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95"
          >
            Create Your First Listing
          </button>
        </div>
      )}
    </div>
  );
}
