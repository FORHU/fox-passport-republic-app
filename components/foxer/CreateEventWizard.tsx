"use client";

import { useCreateEventModal } from "@/hooks/events/useCreateEventModal";
import { X, Calendar, Clock, MapPin, Users, ChevronDown, DollarSign, Image as ImageIcon, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/data/useCategories";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

interface EventFormData {
  // Basic Info
  title: string;
  description: string;
  categoryId: string;
  status: 'draft' | 'active';
  maxAttendees: string;
  isPublished: boolean;

  // Location
  locationType: "in-person" | "virtual";
  locationAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;

  // Schedule
  startDatetime: string;
  endDatetime: string;
  durationMinutes: string;

  // Pricing
  basePrice: string;
  currency: string;
  serviceFeePercent: string;
  taxPercent: string;

  // Details
  requirements: string;
  cancellationPolicy: string;

  // Image
  imageUrl: string;
  imageAltText: string;
}

export default function CreateEventWizard() {
  const { isOpen, onClose } = useCreateEventModal();
  const { categories, loading: categoriesLoading } = useCategories();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    categoryId: '',
    status: 'draft',
    maxAttendees: '',
    isPublished: false,
    locationType: 'in-person',
    locationAddress: '',
    city: '',
    state: '',
    country: 'Philippines',
    latitude: '',
    longitude: '',
    startDatetime: '',
    endDatetime: '',
    durationMinutes: '',
    basePrice: '',
    currency: 'PHP',
    serviceFeePercent: '10',
    taxPercent: '0',
    requirements: '',
    cancellationPolicy: '',
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

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create an event");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        hostId: user.id,
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
        },
        pricing: {
          basePrice: parseFloat(formData.basePrice),
          currency: formData.currency,
          serviceFeePercent: parseFloat(formData.serviceFeePercent),
          taxPercent: parseFloat(formData.taxPercent),
        },
        images: formData.imageUrl ? [{
          imageUrl: formData.imageUrl,
          altText: formData.imageAltText || formData.title,
          isPrimary: true,
        }] : undefined,
      };

      const response = await api.post('/v1/events/complete', payload);

      if (response.data.success) {
        toast.success("Event created successfully!");
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          categoryId: '',
          status: 'draft',
          maxAttendees: '',
          isPublished: false,
          locationType: 'in-person',
          locationAddress: '',
          city: '',
          state: '',
          country: 'Philippines',
          latitude: '',
          longitude: '',
          startDatetime: '',
          endDatetime: '',
          durationMinutes: '',
          basePrice: '',
          currency: 'PHP',
          serviceFeePercent: '10',
          taxPercent: '0',
          requirements: '',
          cancellationPolicy: '',
          imageUrl: '',
          imageAltText: '',
        });
        setCurrentStep(1);
      }
    } catch (error: any) {
      console.error('Create event error:', error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.categoryId;
      case 2:
        return formData.locationAddress && formData.city && formData.state;
      case 3:
        return formData.startDatetime && formData.endDatetime;
      case 4:
        return formData.basePrice;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: "Basic Info", icon: <FileText className="w-4 h-4" /> },
    { number: 2, title: "Location", icon: <MapPin className="w-4 h-4" /> },
    { number: 3, title: "Schedule", icon: <Calendar className="w-4 h-4" /> },
    { number: 4, title: "Pricing", icon: <DollarSign className="w-4 h-4" /> },
    { number: 5, title: "Final Details", icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Create Event</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= step.number
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 dark:bg-zinc-700 text-gray-500'
                  }`}>
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span className="text-xs mt-1 font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-pink-500' : 'bg-gray-200 dark:bg-zinc-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Step 1: Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your event a catchy title"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  disabled={categoriesLoading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event in detail. What makes it special?"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Max Attendees</label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Event Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="draft">Draft (Save for later)</option>
                  <option value="active">Active (Ready to go)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Step 2: Location Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location Type</label>
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="in-person">In Person</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>

              {formData.locationType === "in-person" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="locationAddress"
                      value={formData.locationAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Manila"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">State/Province *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Metro Manila"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Latitude (optional)</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="14.5995"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Longitude (optional)</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="120.9842"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Step 3: Schedule</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startDatetime"
                  value={formData.startDatetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endDatetime"
                  value={formData.endDatetime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="e.g., 120"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Step 4: Pricing</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Base Price *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Service Fee (%)</label>
                  <input
                    type="number"
                    name="serviceFeePercent"
                    value={formData.serviceFeePercent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Tax (%)</label>
                  <input
                    type="number"
                    name="taxPercent"
                    value={formData.taxPercent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {formData.basePrice && (
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                  <p className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                    Total per ticket: {formData.currency} {(
                      parseFloat(formData.basePrice || '0') *
                      (1 + parseFloat(formData.serviceFeePercent || '0') / 100) *
                      (1 + parseFloat(formData.taxPercent || '0') / 100)
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Final Details */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Step 5: Final Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Event Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image Alt Text</label>
                <input
                  type="text"
                  name="imageAltText"
                  value={formData.imageAltText}
                  onChange={handleInputChange}
                  placeholder="Description of the image"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="What should attendees bring or prepare?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Cancellation Policy</label>
                <textarea
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  placeholder="Describe your cancellation and refund policy"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                />
                <label className="text-sm font-semibold">Publish event immediately</label>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Event</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
