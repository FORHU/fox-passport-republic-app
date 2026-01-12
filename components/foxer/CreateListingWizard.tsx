"use client";

import { useCreateListingModal } from "@/hooks/events/useCreateListingModal";
import { X, Building2, Package, ChefHat, ChevronRight, ChevronLeft, MapPin, DollarSign, Image as ImageIcon, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategories } from "@/hooks/data/useCategories";

type ListingType = 'venue' | 'equipment' | 'catering';

interface ListingFormData {
  // Type Selection
  listingType: ListingType | '';

  // Category Selection
  parentCategory: string;
  childCategory: string;

  // Basic Info
  title: string;
  description: string;

  // Location (for venues)
  locationAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;

  // Capacity (for venues)
  capacity: string;

  // Amenities/Features (for venues & equipment)
  features: string[];

  // Quantity (for equipment)
  quantity: string;

  // Menu Type (for catering)
  menuType: string;
  servesPerOrder: string;

  // Pricing
  basePrice: string;
  currency: string;
  priceUnit: string; // 'per_hour', 'per_day', 'per_item', 'per_person'

  // Availability
  availableDays: string[];
  minBookingHours: string;
  maxBookingHours: string;

  // Details
  requirements: string;
  cancellationPolicy: string;

  // Images
  imageUrl: string;
  imageAltText: string;
  additionalImages: { url: string; altText: string }[];
}

export default function CreateListingWizard() {
  const { isOpen, onClose } = useCreateListingModal();
  const { user } = useAuthStore();
  const { categories } = useCategories();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ListingFormData>({
    listingType: '',
    parentCategory: '',
    childCategory: '',
    title: '',
    description: '',
    locationAddress: '',
    city: '',
    state: '',
    country: 'Philippines',
    latitude: '',
    longitude: '',
    capacity: '',
    features: [],
    quantity: '',
    menuType: '',
    servesPerOrder: '',
    basePrice: '',
    currency: 'PHP',
    priceUnit: 'per_hour',
    availableDays: [],
    minBookingHours: '',
    maxBookingHours: '',
    requirements: '',
    cancellationPolicy: '',
    imageUrl: '',
    imageAltText: '',
    additionalImages: [],
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

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleAvailableDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    if (!formData.listingType) {
      toast.error("Please select a listing type");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        hostId: user.id,
        listingType: formData.listingType,
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.locationAddress,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        },
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        features: formData.features,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        menuType: formData.menuType || undefined,
        servesPerOrder: formData.servesPerOrder ? parseInt(formData.servesPerOrder) : undefined,
        pricing: {
          basePrice: parseFloat(formData.basePrice),
          currency: formData.currency,
          priceUnit: formData.priceUnit,
        },
        availability: {
          availableDays: formData.availableDays,
          minBookingHours: formData.minBookingHours ? parseInt(formData.minBookingHours) : undefined,
          maxBookingHours: formData.maxBookingHours ? parseInt(formData.maxBookingHours) : undefined,
        },
        requirements: formData.requirements || undefined,
        cancellationPolicy: formData.cancellationPolicy || undefined,
        images: [
          ...(formData.imageUrl ? [{
            imageUrl: formData.imageUrl,
            altText: formData.imageAltText || formData.title,
            isPrimary: true,
          }] : []),
          ...formData.additionalImages.map(img => ({
            imageUrl: img.url,
            altText: img.altText,
            isPrimary: false,
          }))
        ],
      };

      const response = await api.post('/v1/listings', payload);

      if (response.data.success) {
        toast.success("Listing created successfully!");
        onClose();
        resetForm();
      }
    } catch (error: any) {
      console.error('Create listing error:', error);
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      listingType: '',
      parentCategory: '',
      childCategory: '',
      title: '',
      description: '',
      locationAddress: '',
      city: '',
      state: '',
      country: 'Philippines',
      latitude: '',
      longitude: '',
      capacity: '',
      features: [],
      quantity: '',
      menuType: '',
      servesPerOrder: '',
      basePrice: '',
      currency: 'PHP',
      priceUnit: 'per_hour',
      availableDays: [],
      minBookingHours: '',
      maxBookingHours: '',
      requirements: '',
      cancellationPolicy: '',
      imageUrl: '',
      imageAltText: '',
      additionalImages: [],
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < getMaxSteps()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getMaxSteps = () => {
    if (!formData.listingType) return 1;
    // Only venues have 6 steps (with category selection)
    // Equipment and catering have 5 steps
    return formData.listingType === 'venue' ? 6 : 5;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.listingType !== '';
      case 2:
        // For venue: category selection required
        if (formData.listingType === 'venue') {
          return formData.parentCategory && formData.childCategory;
        }
        // For equipment/catering: basic info (title & description)
        return formData.title && formData.description;
      case 3:
        // For venue: basic info
        if (formData.listingType === 'venue') {
          return formData.title && formData.description;
        }
        // For equipment/catering: type-specific details
        if (formData.listingType === 'equipment') {
          return formData.quantity;
        } else if (formData.listingType === 'catering') {
          return formData.menuType && formData.servesPerOrder;
        }
        return true;
      case 4:
        // For venue: location details
        if (formData.listingType === 'venue') {
          return formData.locationAddress && formData.city && formData.state;
        }
        // For equipment/catering: pricing
        return formData.basePrice;
      case 5:
        // For venue: pricing
        if (formData.listingType === 'venue') {
          return formData.basePrice;
        }
        // For equipment/catering: final details
        return true;
      case 6:
        // Only venue reaches step 6
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const getSteps = () => {
    if (!formData.listingType) {
      return [{ number: 1, title: "Type", icon: <FileText className="w-4 h-4" /> }];
    }

    // VENUE: 6 steps with category selection
    if (formData.listingType === 'venue') {
      return [
        { number: 1, title: "Type", icon: <FileText className="w-4 h-4" /> },
        { number: 2, title: "Category", icon: <Calendar className="w-4 h-4" /> },
        { number: 3, title: "Basic Info", icon: <FileText className="w-4 h-4" /> },
        { number: 4, title: "Location", icon: <MapPin className="w-4 h-4" /> },
        { number: 5, title: "Pricing", icon: <DollarSign className="w-4 h-4" /> },
        { number: 6, title: "Final Details", icon: <ImageIcon className="w-4 h-4" /> },
      ];
    }

    // EQUIPMENT & CATERING: 5 steps without category
    let typeSpecificStep;
    if (formData.listingType === 'equipment') {
      typeSpecificStep = { number: 3, title: "Details", icon: <Package className="w-4 h-4" /> };
    } else {
      typeSpecificStep = { number: 3, title: "Menu", icon: <ChefHat className="w-4 h-4" /> };
    }

    return [
      { number: 1, title: "Type", icon: <FileText className="w-4 h-4" /> },
      { number: 2, title: "Basic Info", icon: <FileText className="w-4 h-4" /> },
      typeSpecificStep,
      { number: 4, title: "Pricing", icon: <DollarSign className="w-4 h-4" /> },
      { number: 5, title: "Final Details", icon: <ImageIcon className="w-4 h-4" /> },
    ];
  };

  const steps = getSteps();

  const venueFeatures = [
    'WiFi', 'Air Conditioning', 'Parking', 'Kitchen', 'Audio System',
    'Projector', 'Tables & Chairs', 'Stage', 'Dance Floor', 'Bar Area'
  ];

  const equipmentFeatures = [
    'Portable', 'Battery Powered', 'Weatherproof', 'Adjustable',
    'Easy Setup', 'Includes Accessories', 'Remote Control', 'LED Display'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Create Listing</h2>
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

          {/* Step 1: Listing Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-2 text-pink-500">What would you like to list?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Choose the type of listing you want to create
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, listingType: 'venue' }))}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    formData.listingType === 'venue'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.listingType === 'venue'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg">Venue</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      List your space for events, meetings, or gatherings
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, listingType: 'equipment' }))}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    formData.listingType === 'equipment'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.listingType === 'equipment'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Package className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg">Equipment</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      Rent out event equipment, tools, or supplies
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, listingType: 'catering' }))}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    formData.listingType === 'catering'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.listingType === 'catering'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <ChefHat className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg">Catering</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      Offer catering services for events and occasions
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}


          {/* Step 2: Category Selection (Venue Only) */}
          {currentStep === 2 && formData.listingType === 'venue' && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-2 text-pink-500">Choose Event Category</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Select the category that best describes your venue
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Parent Category *</label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => {
                    const parentId = e.target.value;
                    setFormData(prev => ({ ...prev, parentCategory: parentId, childCategory: '' }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select a parent category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {formData.parentCategory && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="block text-sm font-semibold mb-3">Subcategory *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories
                      .find(c => c.slug === formData.parentCategory)
                      ?.subCategories?.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, childCategory: sub.name }))}
                          className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.childCategory === sub.name
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Step 2/3: Basic Info */}
          {((currentStep === 3 && formData.listingType === 'venue') || 
            (currentStep === 2 && formData.listingType !== 'venue')) && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Listing Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={`Give your ${formData.listingType} a catchy title`}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your listing in detail. What makes it special?"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Venue Location */}
          {currentStep === 4 && formData.listingType === 'venue' && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Venue Location & Details</h3>
              </div>

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
                <label className="block text-sm font-semibold mb-2">Capacity (people)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="How many people can this venue accommodate?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Amenities & Features</label>
                <div className="grid grid-cols-2 gap-3">
                  {venueFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.features.includes(feature)
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && formData.listingType === 'equipment' && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Equipment Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Quantity Available *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="How many units do you have?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Features</label>
                <div className="grid grid-cols-2 gap-3">
                  {equipmentFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.features.includes(feature)
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && formData.listingType === 'catering' && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Catering Menu Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Menu Type *</label>
                <select
                  name="menuType"
                  value={formData.menuType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select menu type</option>
                  <option value="buffet">Buffet</option>
                  <option value="plated">Plated Meals</option>
                  <option value="cocktail">Cocktail/Finger Food</option>
                  <option value="boxed">Boxed Meals</option>
                  <option value="custom">Custom Menu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Serves Per Order *</label>
                <input
                  type="number"
                  name="servesPerOrder"
                  value={formData.servesPerOrder}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="How many people does one order serve?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Step 4/5: Pricing */}
          {((currentStep === 5 && formData.listingType === 'venue') ||
            (currentStep === 4 && formData.listingType !== 'venue')) && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Pricing & Availability</h3>
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

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-semibold mb-2">Price Unit</label>
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="per_hour">Per Hour</option>
                    <option value="per_day">Per Day</option>
                    <option value="per_item">Per Item</option>
                    <option value="per_person">Per Person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Available Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleAvailableDay(day)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.availableDays.includes(day)
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.listingType === 'venue' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Min Booking (hours)</label>
                    <input
                      type="number"
                      name="minBookingHours"
                      value={formData.minBookingHours}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 2"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Booking (hours)</label>
                    <input
                      type="number"
                      name="maxBookingHours"
                      value={formData.maxBookingHours}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 24"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5/6: Final Details */}
          {((currentStep === 6 && formData.listingType === 'venue') ||
            (currentStep === 5 && formData.listingType !== 'venue')) && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 text-pink-500">Final Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Primary Image URL</label>
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
                  placeholder="What requirements or conditions apply to this listing?"
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
            Step {currentStep} of {getMaxSteps()}
          </div>

          {currentStep < getMaxSteps() ? (
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
                <>Create Listing</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
