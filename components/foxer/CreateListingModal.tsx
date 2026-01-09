import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '@/data/categories';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Basic Info' },
  { id: 4, label: 'Location' },
  { id: 5, label: 'Pricing' },
  { id: 6, label: 'Final Details' },
];

const AMENITIES = [
  'WiFi', 'Air Conditioning', 'Parking', 'Kitchen', 'Audio System', 'Projector', 'Tables & Chairs', 'Stage', 'Dance Floor', 'Bar Area'
];

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [listingType, setListingType] = useState<'Venue' | 'Equipment' | 'Catering' | ''>('');
  
  // Form State
  const [formData, setFormData] = useState({
    parentCategory: '',
    subcategory: '',
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    capacity: '',
    amenities: [] as string[],
    basePrice: '',
    currency: 'PHP (₱)',
    priceUnit: 'Per Hour',
    availableDays: [] as string[],
    minBooking: '',
    maxBooking: '',
    imageUrl: '',
    imageAlt: '',
    requirements: '',
    cancellationPolicy: ''
  });

  // Derived subcategories based on selected parent category
  const activeSubcategories = useMemo(() => {
    const parent = CATEGORIES.find(c => c.title === formData.parentCategory);
    return parent ? parent.children : [];
  }, [formData.parentCategory]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      // Logic for saving as draft could go here
      const confirm = window.confirm("Save this listing as a draft?");
      if (confirm) {
        // Simulating save draft API call
        console.log("Saved as draft:", { ...formData, type: listingType, status: 'Draft' });
        onClose();
      } else {
        onClose();
      }
    }
  };

  const handleSubmit = () => {
    // Simulating API submission
    // Status is set to 'Inactive' pending admin approval
    const finalPayload = {
      ...formData,
      type: listingType,
      status: 'Inactive', // Pending Admin Approval
      submittedAt: new Date().toISOString()
    };
    console.log("Submitted for approval:", finalPayload);
    
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
      setCurrentStep(1); // Reset
    }, 3000);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-surface/90 border border-accent/30 shadow-[0_0_30px_rgba(204,255,0,0.3)] rounded-2xl p-4 flex items-center gap-4 z-[70] animate-in fade-in slide-in-from-top-4 max-w-lg backdrop-blur-xl">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-black shrink-0">
            <span className="material-symbols-outlined">check</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Thank you for submitting your listing!</h4>
            <p className="text-xs text-gray-300">Our admin team will review and approve it shortly.</p>
          </div>
        </div>
      )}

      <div className="bg-[#0f111a] border border-white/10 text-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold font-display tracking-tight">Create Listing</h2>
          <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-8 pb-4 relative z-10">
          <div className="flex justify-between items-center relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-accent -z-10 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_#ccff00]"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>

            {STEPS.map((step) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 px-2">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                      isActive 
                        ? 'bg-accent border-accent text-black shadow-[0_0_15px_rgba(204,255,0,0.5)]' 
                        : 'bg-[#0f111a] border-white/20 text-gray-500'
                    }`}
                  >
                    {isActive ? <span className="material-symbols-outlined text-[16px]">check</span> : step.id}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 custom-scrollbar">
          
          {/* Step 1: Type */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-2">What would you like to list?</h3>
              <p className="text-gray-400 text-sm mb-8">Choose the type of listing you want to create</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'Venue', icon: 'apartment', desc: 'List your space for events, meetings, or gatherings' },
                  { id: 'Equipment', icon: 'inventory_2', desc: 'Rent out event equipment, tools, or supplies' },
                  { id: 'Catering', icon: 'restaurant_menu', desc: 'Offer catering services for events and occasions' }
                ].map((type) => (
                  <div 
                    key={type.id}
                    onClick={() => setListingType(type.id as 'Venue' | 'Equipment' | 'Catering')}
                    className={`cursor-pointer rounded-2xl border p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02] ${
                      listingType === type.id 
                        ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                      listingType === type.id ? 'bg-accent text-black shadow-lg' : 'bg-white/10 text-gray-400'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">{type.icon}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-white">{type.id}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-2">Choose Event Category</h3>
              <p className="text-gray-400 text-sm mb-6">Select the category that best describes your venue</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Parent Category *</label>
                  <div className="relative">
                    <select 
                      value={formData.parentCategory}
                      onChange={(e) => updateField('parentCategory', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-4 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer hover:bg-white/10"
                    >
                      <option value="" className="bg-[#0f111a] text-gray-400">Select a parent category...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.title} className="bg-[#0f111a] text-white">{cat.title}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined">expand_more</span>
                  </div>
                </div>

                {formData.parentCategory && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Subcategory *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {activeSubcategories.length > 0 ? (
                        activeSubcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => updateField('subcategory', sub.name)}
                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                              formData.subcategory === sub.name 
                                ? 'border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(204,255,0,0.15)]' 
                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm col-span-2">No subcategories available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Basic Info */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-6">Basic Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Listing Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Give your venue a catchy title"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Description *</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your listing in detail. What makes it special?"
                    className="w-full h-40 rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-6">Venue Location & Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Street Address *</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">City *</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Manila"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">State/Province *</label>
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="Metro Manila"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Capacity (people)</label>
                  <input 
                    type="number" 
                    value={formData.capacity}
                    onChange={(e) => updateField('capacity', e.target.value)}
                    placeholder="How many people can this venue accommodate?"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Amenities & Features</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map(amenity => (
                      <button 
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                          formData.amenities.includes(amenity)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Pricing */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-6">Pricing & Availability</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Base Price *</label>
                  <input 
                    type="number" 
                    value={formData.basePrice}
                    onChange={(e) => updateField('basePrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Currency</label>
                    <div className="relative">
                      <select 
                        value={formData.currency}
                        onChange={(e) => updateField('currency', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer hover:bg-white/10"
                      >
                        <option className="bg-[#0f111a]">PHP (₱)</option>
                        <option className="bg-[#0f111a]">USD ($)</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Price Unit</label>
                    <div className="relative">
                      <select 
                        value={formData.priceUnit}
                        onChange={(e) => updateField('priceUnit', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer hover:bg-white/10"
                      >
                        <option className="bg-[#0f111a]">Per Hour</option>
                        <option className="bg-[#0f111a]">Per Day</option>
                        <option className="bg-[#0f111a]">Per Event</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`flex-1 min-w-[60px] py-2 rounded-lg border text-xs font-bold transition-all ${
                          formData.availableDays.includes(day)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Min Booking (hours)</label>
                    <input 
                      type="number" 
                      value={formData.minBooking}
                      onChange={(e) => updateField('minBooking', e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Max Booking (hours)</label>
                    <input 
                      type="number" 
                      value={formData.maxBooking}
                      onChange={(e) => updateField('maxBooking', e.target.value)}
                      placeholder="e.g., 24"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Final Details */}
          {currentStep === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-accent font-bold text-lg mb-6">Final Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Primary Image URL</label>
                  <input 
                    type="text" 
                    value={formData.imageUrl}
                    onChange={(e) => updateField('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Image Alt Text</label>
                  <input 
                    type="text" 
                    value={formData.imageAlt}
                    onChange={(e) => updateField('imageAlt', e.target.value)}
                    placeholder="Description of the image"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Requirements</label>
                  <textarea 
                    value={formData.requirements}
                    onChange={(e) => updateField('requirements', e.target.value)}
                    placeholder="What requirements or conditions apply to this listing?"
                    className="w-full h-24 rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Cancellation Policy</label>
                  <textarea 
                    value={formData.cancellationPolicy}
                    onChange={(e) => updateField('cancellationPolicy', e.target.value)}
                    placeholder="Describe your cancellation and refund policy"
                    className="w-full h-24 rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-[#0f111a]/80 backdrop-blur-md sticky bottom-0 z-10">
          <div className="flex gap-3">
            <button 
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span> Back
            </button>
            {currentStep > 1 && currentStep < 6 && (
              <button 
                onClick={onClose}
                className="hidden sm:block px-6 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
              >
                Save Draft
              </button>
            )}
          </div>
          
          <span className="text-xs text-gray-500 font-medium hidden sm:block">Step {currentStep} of 6</span>

          <button 
            onClick={handleNext}
            className={`px-8 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:bg-white transition-all shadow-[0_0_15px_rgba(204,255,0,0.4)] flex items-center gap-2 ${
              (currentStep === 1 && !listingType) ? 'opacity-50 cursor-not-allowed shadow-none' : ''
            }`}
            disabled={currentStep === 1 && !listingType}
          >
            {currentStep === 6 ? 'Create Listing' : 'Next'}
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateListingModal;
