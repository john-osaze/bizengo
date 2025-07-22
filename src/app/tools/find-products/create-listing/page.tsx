"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';
import { LucideIconName } from '@/components/ui/AppIcon'; // Adjust path if needed

interface FormData {
  images: { id: number; file: File; url: string; isMain: boolean }[];
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  brand: string;
  model: string;
  dimensions: string;
  quantity: number;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
  };
  availability: {
    immediate: boolean;
    duration: string;
    customEndDate: string;
  };
}

const CreateListing = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    images: [],
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    brand: '',
    model: '',
    dimensions: '',
    quantity: 1,
    location: {
      address: '',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      pickupAvailable: true,
      deliveryAvailable: false
    },
    availability: {
      immediate: true,
      duration: '30',
      customEndDate: ''
    }
  });

  const categories: string[] = [
    'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Sports & Outdoors',
    'Books & Media', 'Automotive', 'Health & Beauty', 'Toys & Games',
    'Food & Beverages', 'Art & Collectibles', 'Tools & Equipment', 'Other'
  ];

  const conditions: string[] = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];


  interface Step {
    id: number;
    title: string;
    icon: LucideIconName; // <--- This is the key change!
    // Add other properties of your step object here
  }


  const steps: Step[] = [
    { id: 1, title: 'Photos', icon: 'Camera' },
    { id: 2, title: 'Details', icon: 'FileText' },
    { id: 3, title: 'Location', icon: 'MapPin' },
    { id: 4, title: 'Availability', icon: 'Clock' }
  ];

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (formData.title || formData.description || formData.images.length > 0) {
        localStorage.setItem('createListingDraft', JSON.stringify(formData));
        setIsDraft(true);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('createListingDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      setIsDraft(true);
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  type NestedFormObjectKeys = 'location' | 'availability';

  // Generic handler for updating nested state properties
  const handleNestedInputChange = <
    ParentKey extends NestedFormObjectKeys, // Constrain ParentKey to be 'location' or 'availability'
    FieldKey extends keyof FormData[ParentKey] // FieldKey must be a key of the specific nested object (e.g., 'address' if ParentKey is 'location')
  >(
    parent: ParentKey,
    field: FieldKey,
    value: FormData[ParentKey][FieldKey] // Value type must match the type of the target field
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as FormData[ParentKey]), // Cast prev[parent] to ensure it's treated as the correct nested object type
        [field]: value
      }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      isMain: formData.images.length === 0
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10)
    }));
  };


  const removeImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const setMainImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: { lat: latitude, lng: longitude },
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
          }));
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
        }
      );
    }
  };

  const getSuggestedPrice = () => {
    const categoryPrices: { [key: string]: number[] } = {
      'Electronics': [50, 500],
      'Clothing & Accessories': [10, 100],
      'Home & Garden': [20, 200],
      'Sports & Outdoors': [25, 300],
      'Books & Media': [5, 50],
      'Automotive': [100, 1000],
      'Health & Beauty': [15, 150],
      'Toys & Games': [10, 80],
      'Food & Beverages': [5, 30],
      'Art & Collectibles': [20, 500],
      'Tools & Equipment': [30, 400],
      'Other': [10, 100]
    };

    const range = categoryPrices[formData.category] || [10, 100];
    return `$${range[0]} - $${range[1]}`;
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (formData.images.length === 0) errors.push('At least one photo is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.condition) errors.push('Condition is required');
    if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
    if (!formData.location.address.trim()) errors.push('Location is required');

    return errors;
  };

  const handlePublish = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setIsPublishing(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.removeItem('createListingDraft');
      setIsPublishing(false);
      alert('Listing published successfully!');
      router.push('/tools/find-products/');
    }, 2000);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('createListingDraft', JSON.stringify(formData));
    setIsDraft(true);
    alert('Draft saved successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Add Photos</h3>
              <p className="text-text-secondary text-sm">Add up to 10 photos. The first photo will be your main image.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={image.id} className="relative aspect-square bg-surface-secondary rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {image.isMain && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!image.isMain && (
                      <button
                        onClick={() => setMainImage(image.id)}
                        className="p-1 bg-black bg-opacity-50 text-white rounded"
                        title="Set as main image"
                      >
                        <Icon name="Star" size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {formData.images.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-border-dark rounded-lg flex flex-col items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors duration-200"
                >
                  <Icon name="Plus" size={24} className="mb-2" />
                  <span className="text-sm">Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center space-x-2 py-3 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              >
                <Icon name="Upload" size={18} />
                <span>Upload from Gallery</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center space-x-2 py-3 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              >
                <Icon name="Camera" size={18} />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Product Details</h3>
              <p className="text-text-secondary text-sm">Provide detailed information about your product.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="What are you selling?"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  maxLength={100}
                />
                <div className="text-xs text-text-secondary mt-1">
                  {formData.title.length}/100 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your item's condition, features, and any other relevant details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-text-secondary mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value="">Select condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Price * <span className="text-text-secondary">($)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
                {formData.category && (
                  <div className="text-xs text-text-secondary mt-1">
                    Suggested price range: {getSuggestedPrice()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Brand name"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Model number/name"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="e.g., 12 x 8 x 4 inches"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Location & Pickup</h3>
              <p className="text-text-secondary text-sm">Set your location and delivery preferences.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Address *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                    placeholder="Enter your address"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                  <button
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Icon name="MapPin" size={16} />
                    <span className="hidden sm:inline">Current</span>
                  </button>
                </div>
                {locationPermission === 'denied' && (
                  <p className="text-xs text-accent mt-1">Location access denied. Please enter address manually.</p>
                )}
              </div>

              <div className="bg-surface-secondary rounded-lg p-4">
                <div className="aspect-video bg-border-light rounded-lg flex items-center justify-center mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Product Location"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${formData.location.coordinates.lat},${formData.location.coordinates.lng}&z=14&output=embed`}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-xs text-text-secondary text-center">
                  Buyers will see the general area, not your exact address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Delivery Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.location.pickupAvailable}
                      onChange={(e) => handleNestedInputChange('location', 'pickupAvailable', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Pickup Available</span>
                      <p className="text-xs text-text-secondary">Buyers can pick up from your location</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.location.deliveryAvailable}
                      onChange={(e) => handleNestedInputChange('location', 'deliveryAvailable', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Delivery Available</span>
                      <p className="text-xs text-text-secondary">You can deliver to buyers</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Availability</h3>
              <p className="text-text-secondary text-sm">Set quantity and listing duration.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
                    className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                  >
                    <Icon name="Minus" size={16} />
                  </button>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-20 px-3 py-2 border border-border rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                  <button
                    onClick={() => handleInputChange('quantity', formData.quantity + 1)}
                    className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Availability
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="availability"
                      checked={formData.availability.immediate}
                      onChange={() => handleNestedInputChange('availability', 'immediate', true)}
                      className="w-4 h-4 text-primary border-border focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Available Now</span>
                      <p className="text-xs text-text-secondary">Item is ready for immediate sale</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="availability"
                      checked={!formData.availability.immediate}
                      onChange={() => handleNestedInputChange('availability', 'immediate', false)}
                      className="w-4 h-4 text-primary border-border focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Schedule for Later</span>
                      <p className="text-xs text-text-secondary">Set a future date when item becomes available</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Listing Duration
                </label>
                <select
                  value={formData.availability.duration}
                  onChange={(e) => handleNestedInputChange('availability', 'duration', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="custom">Custom date</option>
                </select>
              </div>

              {formData.availability.duration === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.availability.customEndDate}
                    onChange={(e) => handleNestedInputChange('availability', 'customEndDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Preview</h3>

      {formData.images.length > 0 && (
        <div className="relative aspect-video bg-surface-secondary rounded-lg overflow-hidden">
          <Image
            src={formData.images.find(img => img.isMain)?.url || formData.images[0]?.url}
            alt="Product preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>
      )}

      <div>
        <h4 className="font-semibold text-text-primary">{formData.title || 'Product Title'}</h4>
        <p className="text-2xl font-bold text-primary mt-1">
          {formData.price ? `$${formData.price}` : '$0.00'}
        </p>
      </div>

      {formData.description && (
        <p className="text-text-secondary text-sm">{formData.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {formData.category && (
          <span className="px-2 py-1 bg-primary-50 text-primary text-xs rounded-full">
            {formData.category}
          </span>
        )}
        {formData.condition && (
          <span className="px-2 py-1 bg-secondary-50 text-secondary text-xs rounded-full">
            {formData.condition}
          </span>
        )}
      </div>

      {formData.location.address && (
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Icon name="MapPin" size={14} />
          <span>{formData.location.address}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()} // Use router.back() instead of navigate(-1)
            className="p-2 -ml-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
          >
            <Icon name="ArrowLeft" size={20} className="text-text-primary" />
          </button>

          <h1 className="text-lg font-semibold text-text-primary">Create Listing</h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${currentStep === step.id
                    ? 'bg-primary text-white'
                    : currentStep > step.id
                      ? 'bg-secondary text-white' : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <Icon
                    name={currentStep > step.id ? 'Check' : step.icon}
                    size={16}
                  />
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-secondary' : 'bg-border'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:px-6 lg:py-8">
            {/* Form Content */}
            <div className="lg:col-span-3">
              <div className="p-6">
                {isDraft && (
                  <div className="mb-6 p-3 bg-warning-50 border border-warning-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Icon name="Save" size={16} className="text-warning" />
                      <span className="text-sm text-warning font-medium">Draft saved automatically</span>
                    </div>
                  </div>
                )}

                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary transition-colors duration-200"
                  >
                    <Icon name="ChevronLeft" size={16} />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={currentStep === 4}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors duration-200"
                  >
                    <span>Next</span>
                    <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-32 p-6">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-12 h-12 bg-primary text-white rounded-full shadow-elevation-2 flex items-center justify-center hover:bg-primary-700 transition-colors duration-200"
        >
          <Icon name="Eye" size={20} />
        </button>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="w-full bg-surface rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              >
                <Icon name="X" size={20} className="text-text-primary" />
              </button>
            </div>
            <div className="p-4">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListing;
