"use client";

import React, { useState } from 'react';
import { useCategories } from '@/hooks/data/useCategories';

interface EventFormData {
  hostId: string;
  categoryId: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'cancelled' | 'completed';
  maxAttendees: string;
  isPublished: boolean;
  locationAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  startDatetime: string;
  endDatetime: string;
  durationMinutes: string;
  requirements: string;
  cancellationPolicy: string;
  itineraryJson: string;
  basePrice: string;
  currency: string;
  serviceFeePercent: string;
  taxPercent: string;
  imageUrl: string;
  imageAltText: string;
}

interface EventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onSuccess, onCancel }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    hostId: '',
    categoryId: '',
    title: '',
    description: '',
    status: 'draft',
    maxAttendees: '',
    isPublished: false,
    locationAddress: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
    startDatetime: '',
    endDatetime: '',
    durationMinutes: '',
    requirements: '',
    cancellationPolicy: '',
    itineraryJson: '',
    basePrice: '',
    currency: 'USD',
    serviceFeePercent: '10',
    taxPercent: '0',
    imageUrl: '',
    imageAltText: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        hostId: formData.hostId,
        categoryId: formData.categoryId || undefined,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        isPublished: formData.isPublished,
        details: {
          locationAddress: formData.locationAddress,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          startDatetime: new Date(formData.startDatetime).toISOString(),
          endDatetime: new Date(formData.endDatetime).toISOString(),
          durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
          requirements: formData.requirements || undefined,
          cancellationPolicy: formData.cancellationPolicy || undefined,
          itineraryJson: formData.itineraryJson || undefined,
        },
        pricing: {
          basePrice: parseFloat(formData.basePrice),
          currency: formData.currency,
          serviceFeePercent: parseFloat(formData.serviceFeePercent),
          taxPercent: parseFloat(formData.taxPercent),
        },
        images: formData.imageUrl ? [{
          imageUrl: formData.imageUrl,
          altText: formData.imageAltText || undefined,
          isPrimary: true,
        }] : undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      setSuccess(true);
      setError(null);

      // Reset form
      setFormData({
        hostId: '',
        categoryId: '',
        title: '',
        description: '',
        status: 'draft',
        maxAttendees: '',
        isPublished: false,
        locationAddress: '',
        city: '',
        state: '',
        country: '',
        latitude: '',
        longitude: '',
        startDatetime: '',
        endDatetime: '',
        durationMinutes: '',
        requirements: '',
        cancellationPolicy: '',
        itineraryJson: '',
        basePrice: '',
        currency: 'USD',
        serviceFeePercent: '10',
        taxPercent: '0',
        imageUrl: '',
        imageAltText: '',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the event');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Create New Event</h2>
        <p className="text-sm text-slate-400 mt-1">Fill in the details to create a new experience</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-500">check_circle</span>
          <div>
            <h4 className="font-semibold text-emerald-800">Success!</h4>
            <p className="text-sm text-emerald-600">Event created successfully</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">info</span>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Host ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hostId"
                value={formData.hostId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter host UUID"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Describe the event..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Attendees
              </label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter max attendees"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-semibold text-slate-700">Publish event immediately</span>
              </label>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">location_on</span>
            Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter street address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Country"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., 14.5995"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., 120.9842"
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">schedule</span>
            Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDatetime"
                value={formData.startDatetime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDatetime"
                value={formData.endDatetime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., 120"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">payments</span>
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="PHP">PHP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Service Fee (%)
              </label>
              <input
                type="number"
                name="serviceFeePercent"
                value={formData.serviceFeePercent}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tax (%)
              </label>
              <input
                type="number"
                name="taxPercent"
                value={formData.taxPercent}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">description</span>
            Additional Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="What attendees need to bring or prepare..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Describe your cancellation policy..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Itinerary (JSON format)
              </label>
              <textarea
                name="itineraryJson"
                value={formData.itineraryJson}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder='{"schedule": ["9:00 AM - Check-in", "10:00 AM - Activity starts"]}'
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">image</span>
            Event Image
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Image Alt Text
              </label>
              <input
                type="text"
                name="imageAltText"
                value={formData.imageAltText}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Description of the image"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Creating Event...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">add_circle</span>
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
