"use client";

import React, { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check, Building2, MapPin, DollarSign, Image as ImageIcon, Sparkles } from "lucide-react";
import { useCreateVenueModal } from "@/hooks/useCreateVenueModal";
import { useCategories } from "@/hooks/useCategories";
import { useAuthStore } from "@/store/useAuthStore";
import { useHostVenues } from "@/hooks/useHostVenues";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function CreateVenueWizard() {
  const { closeModal } = useCreateVenueModal();
  const { categories } = useCategories();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { refetch } = useHostVenues();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    categoryId: "",
    description: "",
    venueType: "hotel",
    capacity: "",
    status: "draft" as "draft" | "active" | "inactive" | "under_maintenance",

    // Step 2: Location
    address: "",
    city: "",
    state: "",
    country: "Philippines",
    latitude: "",
    longitude: "",

    // Step 3: Pricing
    pricePerDay: "",
    pricePerHour: "",
    currency: "PHP",
    minHours: "",

    // Step 4: Amenities
    amenitiesText: "", // Comma-separated amenities

    // Step 5: Final Details
    imageUrl: "",
    altText: "",
    isPublished: false,
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: Building2 },
    { number: 2, title: "Location", icon: MapPin },
    { number: 3, title: "Pricing", icon: DollarSign },
    { number: 4, title: "Amenities", icon: Sparkles },
    { number: 5, title: "Images", icon: ImageIcon },
  ];

  const venueTypes = [
    "hotel",
    "land",
    "hall",
    "outdoor_space",
    "restaurant",
    "conference_room",
    "beach",
    "garden",
    "rooftop",
    "warehouse",
    "other",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.categoryId && formData.description && formData.venueType);
      case 2:
        return !!(formData.address && formData.city && formData.state);
      case 3:
        return !!(formData.pricePerDay && parseFloat(formData.pricePerDay) > 0);
      case 4:
        return true; // Amenities are optional
      case 5:
        return true; // Images are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      toast.error("You must be logged in to create a venue");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse amenities from comma-separated string
      const amenitiesArray = formData.amenitiesText
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
        .map((name) => ({ name }));

      // Prepare payload
      const payload = {
        userId: user.id, // Add userId/hostId to the payload
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        venueType: formData.venueType,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: formData.status,
        isPublished: formData.isPublished,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        pricing: {
          pricePerDay: parseFloat(formData.pricePerDay),
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
          currency: formData.currency,
          minHours: formData.minHours ? parseInt(formData.minHours) : undefined,
        },
        amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
        images: formData.imageUrl
          ? [
              {
                imageUrl: formData.imageUrl,
                altText: formData.altText || formData.name,
                isPrimary: true,
              },
            ]
          : undefined,
      };

      // Make API call
      const response = await api.post(
        "/v1/venues",
        payload
      );

      if (response.data.success) {
        toast.success("Venue created successfully!");

        // Refetch venues to update the dashboard
        refetch();

        // Reset form
        setFormData({
          name: "",
          categoryId: "",
          description: "",
          venueType: "hotel",
          capacity: "",
          status: "draft",
          address: "",
          city: "",
          state: "",
          country: "Philippines",
          latitude: "",
          longitude: "",
          pricePerDay: "",
          pricePerHour: "",
          currency: "PHP",
          minHours: "",
          amenitiesText: "",
          imageUrl: "",
          altText: "",
          isPublished: false,
        });

        setCurrentStep(1);
        closeModal();
      } else {
        toast.error(response.data.message || "Failed to create venue");
      }
    } catch (error: any) {
      console.error("Error creating venue:", error);
      toast.error(error.response?.data?.message || "Failed to create venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              List Your Venue
            </h2>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  className={`flex flex-col items-center ${
                    step.number === currentStep
                      ? "text-pink-600"
                      : step.number < currentStep
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.number === currentStep
                        ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600"
                        : step.number < currentStep
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step.number < currentStep
                        ? "bg-green-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Sunset Beach Resort, Grand Conference Hall"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Venue Type *
                </label>
                <select
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  {venueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your venue, its features, and what makes it special..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (optional)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Manila"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Metro Manila"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="14.5995"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="120.9842"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price Per Day *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price Per Hour (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Hours (optional)
                  </label>
                  <input
                    type="number"
                    name="minHours"
                    value={formData.minHours}
                    onChange={handleChange}
                    placeholder="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {formData.pricePerDay && (
                <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                    Price Preview
                  </p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">
                    {formData.currency === "PHP" ? "₱" : "$"}
                    {parseFloat(formData.pricePerDay).toLocaleString()} / day
                  </p>
                  {formData.pricePerHour && (
                    <p className="text-lg font-semibold text-pink-600 dark:text-pink-400">
                      {formData.currency === "PHP" ? "₱" : "$"}
                      {parseFloat(formData.pricePerHour).toLocaleString()} / hour
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Amenities */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amenities (comma-separated)
                </label>
                <textarea
                  name="amenitiesText"
                  value={formData.amenitiesText}
                  onChange={handleChange}
                  rows={4}
                  placeholder="WiFi, Parking, Air Conditioning, Kitchen, Sound System, Projector"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate amenities with commas
                </p>
              </div>

              {/* Amenity Preview */}
              {formData.amenitiesText && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amenity Preview
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenitiesText
                      .split(",")
                      .map((a) => a.trim())
                      .filter((a) => a.length > 0)
                      .map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Images */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/venue-image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Image Alt Text (optional)
                </label>
                <input
                  type="text"
                  name="altText"
                  value={formData.altText}
                  onChange={handleChange}
                  placeholder="Description of the image"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Image Preview
                  </p>
                  <img
                    src={formData.imageUrl}
                    alt={formData.altText || "Venue preview"}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Publish venue immediately
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Venue"}
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
