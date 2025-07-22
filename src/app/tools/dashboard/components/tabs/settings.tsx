"use client"; //
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from 'lucide-react';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface ApiBusinessItem {
  id: string;
  email: string;
  business_id: string;
  business_name: string;
  business_email: string;
  address: string;
  description: string;
  contact: string;
  identifier: string; // e.g., "CAC", "TIN", or a custom name like "Business Permit No."
  logo: string;
  number: string; // e.g., "RC-4567", "1234567890" (the actual registration number)
  status: string;
  reg_time: string;
  uptime: string;
  admin: string | null;
}

// Updated BusinessDataPayload interface to match the requested interpretation
interface BusinessDataPayload {
  email: string;
  business_name: string;
  business_email: string;
  address: string;
  description: string;
  contact: string;
  identifier: string; // This will now hold the identifier type (e.g., "CAC", "TIN", or the custom name for 'Other')
  number: string; // This will now hold the registration number associated with the identifier
  logo?: string; // Optional URL of the uploaded logo
}

interface SettingsProps {
  businessData: ApiBusinessItem[] | null;
}

export default function Settings({ businessData }: SettingsProps) {
  const [hasBusinessData, setHasBusinessData] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for form inputs.
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_email: '',
    address: '',
    description: '',
    contact: '',
    custom_identifier_name: '', // Used only when 'Other' is selected for identifier type
    registration_number: '', // The actual registration number
  });

  const [selectedIdentifierType, setSelectedIdentifierType] = useState<string>('CAC'); // State for the dropdown
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null); // To display current/uploaded logo

  // Effect to determine if business data exists, usually on component mount
  useEffect(() => {
    if (businessData && businessData.length > 0) {
      setHasBusinessData(true);
    } else {
      setHasBusinessData(false);
    }
  }, [businessData]);

  // Function to handle changes in text/textarea inputs
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle changes in the identifier type dropdown
  const handleIdentifierTypeChange = (value: string) => {
    setSelectedIdentifierType(value);
    // Clear the custom identifier input when switching away from 'Other'
    if (value !== 'Other') {
      setBusinessForm(prev => ({ ...prev, custom_identifier_name: '' }));
    }
  };

  // Function to handle logo file selection and create a preview URL
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file)); // Create a URL for image preview
    } else {
      setLogoFile(null);
      setLogoPreviewUrl(null);
    }
  };

  // Function to upload the logo file to the server
  const uploadLogo = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const uploadResponse = await fetch("https://api.rootsnsquares.com/innovations/upload-file.php", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || uploadData.status !== "success" || !uploadData.file_url) {
        throw new Error(uploadData.message || "Failed to upload logo. Please try again.");
      }

      return uploadData.file_url;
    } catch (error) {
      console.error("Logo upload error:", error);
      toast({
        title: "Logo Upload Failed",
        description: (error as Error).message || "There was an error uploading your logo.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Function to reset the form fields
  const resetForm = () => {
    setBusinessForm({
      business_name: '',
      business_email: '',
      address: '',
      description: '',
      contact: '',
      custom_identifier_name: '',
      registration_number: '',
    });
    setSelectedIdentifierType('CAC');
    setLogoFile(null);
    setLogoPreviewUrl(null);
  };

  // Function to pre-fill the form when opening in 'Edit' mode
  const prefillFormForEdit = () => {
    resetForm(); // Clear existing state first

    if (hasBusinessData && businessData && businessData.length > 0) {
      // Assuming we edit the first business item found for the user
      const itemToEdit = businessData[0];

      setBusinessForm({
        business_name: itemToEdit.business_name || '',
        business_email: itemToEdit.business_email || '',
        address: itemToEdit.address || '',
        description: itemToEdit.description || '',
        contact: itemToEdit.contact || '',
        custom_identifier_name: '', // Will be set below if 'Other'
        registration_number: itemToEdit.number || '', // Pre-fill the registration number
      });

      // Determine the identifier type and set custom_identifier_name if 'Other'
      if (itemToEdit.identifier === 'CAC' || itemToEdit.identifier === 'TIN') {
        setSelectedIdentifierType(itemToEdit.identifier);
      } else {
        setSelectedIdentifierType('Other');
        setBusinessForm(prev => ({ ...prev, custom_identifier_name: itemToEdit.identifier || '' }));
      }

      setLogoPreviewUrl(itemToEdit.logo || null); // Pre-fill existing logo for preview
      // logoFile remains null so we only upload if a new file is chosen.
    }
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const RSEmail = sessionStorage.getItem("RSEmail");
    if (!RSEmail) {
      toast({
        title: "Authentication Error",
        description: "Your session email is missing. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    let logoUrl: string | null = null;

    // Logo is compulsory: check if a new file is selected or an existing logo is present
    if (!logoFile && !logoPreviewUrl) {
      toast({
        title: "Missing Logo",
        description: "Please upload your business logo. It is compulsory.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (logoFile) {
      // If a new logo file is selected, upload it
      logoUrl = await uploadLogo(logoFile);
      if (logoUrl === null) { // If upload failed, stop submission
        setIsLoading(false);
        return;
      }
    } else if (logoPreviewUrl) {
      // If no new file is selected but an existing logo URL is present, use it
      logoUrl = logoPreviewUrl;
    }

    // Determine the 'identifier' value for the payload
    const identifierValue = selectedIdentifierType === 'Other'
      ? businessForm.custom_identifier_name // Use the custom name if 'Other'
      : selectedIdentifierType;             // Use "CAC" or "TIN"

    const payload: BusinessDataPayload = {
      email: RSEmail,
      business_name: businessForm.business_name,
      business_email: businessForm.business_email,
      address: businessForm.address,
      description: businessForm.description,
      contact: businessForm.contact,
      identifier: identifierValue,
      number: businessForm.registration_number, // The registration number
      ...(logoUrl && { logo: logoUrl }), // Conditionally add logo URL if available
    };

    try {
      const verifyResponse = await fetch("https://api.bizengo.com/innovations/verify.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || verifyData.status !== "success") {
        throw new Error(verifyData.message || "Failed to save business settings.");
      }

      toast({
        title: "Success!",
        description: "Business settings saved successfully.",
        variant: "default",
      });
      setHasBusinessData(true); // Update state to reflect that business data is now configured
      setIsDialogOpen(false); // Close the dialog on successful submission
      // No need to resetForm here, as prefillFormForEdit will be called on next open for edit.
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "There was an error saving your business settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="border-0 shadow-none min-h-[90vh]">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-3 sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 sm:mb-2 text-xl sm:text-2xl">
            <SettingsIcon className="h-5 w-5 text-purple-600" />
            Settings
          </CardTitle>
          <CardDescription>Manage your platform and account settings</CardDescription>
        </div>
      </CardHeader>

      <CardContent className='px-3 sm:px-6'>
        <div className="space-y-8">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Customize Business Dashboard</h4>
              <p className="text-sm text-gray-600 mt-1">
                Personalize the look and feel of your business dashboard, upload logo, and update details.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0 mt-4 sm:mt-0"
                  onClick={prefillFormForEdit} // Call prefill function on dialog trigger click
                >
                  {hasBusinessData ? "Edit Customization" : "Customize Now"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[705px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{hasBusinessData ? "Edit Business Customization" : "Customize Business Dashboard"}</DialogTitle>
                  <DialogDescription>
                    {hasBusinessData ? "Update your business details and logo." : "Enter your business details to personalize your dashboard."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  {/* Business Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="business_name" className="text-right">
                      Business Name
                    </Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      value={businessForm.business_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {/* Business Email */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="business_email" className="text-right">
                      Business Email
                    </Label>
                    <Input
                      id="business_email"
                      name="business_email"
                      type="email"
                      value={businessForm.business_email}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {/* Address */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={businessForm.address}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {/* Description */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={businessForm.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {/* Contact */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right">
                      Contact
                    </Label>
                    <Input
                      id="contact"
                      name="contact"
                      type="tel" // Use type="tel" for phone numbers
                      value={businessForm.contact}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g., 08012345678" // Add placeholder
                      required
                    />
                  </div>
                  {/* Identifier Type Dropdown */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="identifier_type" className="text-right">
                      Identifier Type
                    </Label>
                    <Select onValueChange={handleIdentifierTypeChange} value={selectedIdentifierType}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select identifier type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAC">CAC</SelectItem>
                        <SelectItem value="TIN">TIN</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Conditional Custom Identifier Input (only for 'Other') */}
                  {selectedIdentifierType === 'Other' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="custom_identifier_name" className="text-right">
                        Custom Identifier (Optional)
                      </Label>
                      <Input
                        id="custom_identifier_name"
                        name="custom_identifier_name"
                        value={businessForm.custom_identifier_name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="e.g., Business Permit No."
                      // Not required as per instructions
                      />
                    </div>
                  )}

                  {/* Registration Number Input */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="registration_number" className="text-right">
                      Registration Number (Optional)
                    </Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      value={businessForm.registration_number}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g., RC-4567 or CAC4535"
                    // Not required as per instructions
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="logo" className="text-right pt-2">
                      Logo (Compulsory)
                    </Label>
                    <div className="col-span-3 flex flex-col gap-2">
                      <Input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*" // Accept only image files
                        onChange={handleLogoChange}
                        className="col-span-3"
                      />
                      {logoPreviewUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Logo Preview:</p>
                          <img src={logoPreviewUrl} alt="Logo Preview" className="max-w-[150px] max-h-[150px] object-contain border rounded p-1" />
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Customization"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}