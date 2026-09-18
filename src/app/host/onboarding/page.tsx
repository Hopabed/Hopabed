"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  getHostPropertyDetails, 
  updatePropertyDraft, 
  createProperty, 
  addRoom, 
  updateRoom,
  deleteRoom,
  uploadPropertyImage,
  submitHostPropertyForReview 
} from "@/lib/api";
import { CITIES } from "@/data/cities";
import { 
  Building, MapPin, Bed, Image as ImageIcon, UserCheck, 
  CheckCircle, ArrowRight, ArrowLeft, UploadCloud, Trash2, PlusCircle, Check
} from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState(searchParams.get("propertyId") || "");
  const [isLoading, setIsLoading] = useState(propertyId ? true : false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "hotel",
    description: "",
    contactPhone: "",
    contactEmail: "",
    city: "Mumbai",
    state: "Maharashtra",
    address: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    amenities: [] as string[],
    ownerInfo: {
      relationship: "owner" as "owner" | "manager" | "representative",
      fullName: "",
      phone: "",
      email: "",
      whatsapp: "",
      businessName: "",
      pan: "",
      gstin: ""
    }
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // Rooms Form State
  const [roomForm, setRoomForm] = useState({ name: "", capacity: 2, inventory: 1, pricePerNight: 2000, roomType: "private" });
  
  // Image Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (propertyId && user) {
      loadProperty(propertyId);
    }
  }, [propertyId, user]);

  const loadProperty = async (id: string) => {
    try {
      const res = await getHostPropertyDetails(id);
      const p = res.property;
      setFormData({
        title: p.title || "",
        propertyType: p.propertyType || "hotel",
        description: p.description || "",
        contactPhone: p.contactPhone || "",
        contactEmail: p.contactEmail || "",
        city: p.city || "Mumbai",
        state: p.state || "Maharashtra",
        address: p.address || "",
        pinCode: p.pinCode || "",
        latitude: p.latitude || "",
        longitude: p.longitude || "",
        amenities: p.amenities || [],
        ownerInfo: p.ownerInfo || {
          relationship: "owner", fullName: "", phone: "", email: "", whatsapp: "", businessName: "", pan: "", gstin: ""
        }
      });
      setRooms(res.rooms || []);
      setImages(res.images || []);
    } catch (err) {
      console.error("Failed to load property", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (moveToNext = false) => {
    setIsSaving(true);
    try {
      let currentId = propertyId;
      
      const payload = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      };

      if (!currentId) {
        // Create draft
        const res = await createProperty(payload);
        currentId = (res._id || res.id) as string;
        setPropertyId(currentId);
        // update URL without reloading
        window.history.replaceState(null, "", `/host/onboarding?propertyId=${currentId}`);
      } else {
        // Update draft
        await updatePropertyDraft(currentId, payload);
      }

      if (moveToNext) {
        setStep(prev => prev + 1);
      } else {
        alert("Draft saved successfully.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to save draft. Error: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => handleSaveDraft(true);
  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  // --- Rooms Logic ---
  const handleAddRoom = async () => {
    if (!propertyId) return alert("Save draft first.");
    try {
      const res = await addRoom(propertyId, { ...roomForm, currency: "INR" });
      setRooms(prev => [...prev, res.room]);
      setRoomForm({ name: "", capacity: 2, inventory: 1, pricePerNight: 2000, roomType: "private" });
    } catch (err) {
      console.error(err);
      alert("Failed to add room");
    }
  };

  const handleRemoveRoom = async (roomId: string) => {
    try {
      await deleteRoom(propertyId, roomId);
      setRooms(prev => prev.filter(r => r._id !== roomId));
    } catch (err) {
      alert("Failed to delete room");
    }
  };

  // --- Images Logic ---
  const handleImageUpload = async () => {
    if (!propertyId) return alert("Save draft first.");
    if (imageFiles.length === 0) return;
    setIsSaving(true);
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        await uploadPropertyImage(propertyId, {
          originalFilename: file.name,
          mimeType: file.type,
          fileBase64: base64,
          isPrimary: images.length === 0 && i === 0,
        });
      }
      setImageFiles([]);
      loadProperty(propertyId);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await submitHostPropertyForReview(propertyId);
      alert("Property submitted successfully! It is now pending review.");
      router.push("/host/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to submit property.");
    } finally {
      setIsSaving(false);
    }
  };

  const ALL_AMENITIES = ["WiFi", "AC", "TV", "Parking", "Breakfast", "Restaurant", "Room Service", "24/7 Reception", "CCTV", "Power Backup", "Lift", "Laundry", "Hot Water", "Housekeeping", "Swimming Pool"];
  
  const toggleAmenity = (am: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(am) 
        ? prev.amenities.filter(a => a !== am) 
        : [...prev.amenities, am]
    }));
  };

  if (!user) return <div className="p-20 text-center">Please sign in as a host.</div>;
  if (isLoading) return <div className="p-20 text-center">Loading property...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Top Navbar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-extrabold text-xl text-gray-900">List Your Property</h1>
          <button onClick={() => handleSaveDraft(false)} disabled={isSaving} className="text-sm font-bold text-brand hover:underline">
            {isSaving ? "Saving..." : "Save & Exit"}
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div className="bg-brand h-1.5 transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }}></div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 py-8">
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">1. Property Information</h2>
              <p className="text-gray-500 text-sm mt-1">Let's start with the basics.</p>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Property Name *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" placeholder="e.g. Hopebed Residency" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Property Type *</label>
                <select value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none">
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="pg">Paying Guest (PG)</option>
                  <option value="hostel">Hostel</option>
                  <option value="homestay">Homestay</option>
                  <option value="guesthouse">Guest House</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Property Description *</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" placeholder="Describe the vibe, features, and target audience..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Property Contact Number</label>
                  <input type="text" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Property Email</label>
                  <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">2. Location</h2>
              <p className="text-gray-500 text-sm mt-1">Where is your property located?</p>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">City *</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">State *</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Full Address *</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">PIN Code *</label>
                  <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-bold text-gray-700 block mb-1">Map Coordinates (Optional)</label>
                <p className="text-xs text-gray-500 mb-3">You can manually enter latitude/longitude if known.</p>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                  <input type="number" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Rooms & Inventory */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">3. Rooms & Inventory</h2>
              <p className="text-gray-500 text-sm mt-1">Add the types of rooms or beds available at your property.</p>
            </div>
            
            {rooms.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {rooms.map(room => (
                  <div key={room._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{room.name}</h4>
                      <p className="text-xs text-gray-500">{room.inventory} units • Max {room.capacity} guests</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-extrabold text-brand">₹{room.pricePerNight} <span className="text-xs font-normal text-gray-500">/night</span></p>
                      <button onClick={() => handleRemoveRoom(room._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><PlusCircle className="h-4 w-4 text-brand" /> Add a Room Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Room Name (e.g. Deluxe AC Room)</label>
                  <input type="text" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Number of Units/Rooms</label>
                  <input type="number" min="1" value={roomForm.inventory} onChange={e => setRoomForm({...roomForm, inventory: Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Max Guests per unit</label>
                  <input type="number" min="1" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price Per Night (₹)</label>
                  <input type="number" min="0" value={roomForm.pricePerNight} onChange={e => setRoomForm({...roomForm, pricePerNight: Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
              </div>
              <button onClick={handleAddRoom} disabled={!roomForm.name} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-brand hover:text-brand transition-colors disabled:opacity-50">
                Save Room Type
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Photos & Amenities */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">4. Photos & Amenities</h2>
              <p className="text-gray-500 text-sm mt-1">Upload at least 3 photos and select available facilities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900">Property Photos</h3>
              
              {images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative h-24 w-32 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                      <img src={img.url} alt="Property" className="w-full h-full object-cover" />
                      {img.isPrimary && <span className="absolute top-1 left-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Cover</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <UploadCloud className="h-8 w-8 text-gray-400 group-hover:text-brand transition-colors mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  {imageFiles.length > 0 ? `${imageFiles.length} photo(s) selected` : "Select photos to upload"}
                </p>
                <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              {imageFiles.length > 0 && (
                <button onClick={handleImageUpload} disabled={isSaving} className="w-full bg-brand text-white font-bold py-2 rounded-xl hover:bg-brand-dark transition-colors">
                  {isSaving ? "Uploading..." : "Upload Selected Photos"}
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_AMENITIES.map(am => (
                  <label key={am} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${formData.amenities.includes(am) ? 'border-brand bg-blue-50 text-brand' : 'border-gray-200 hover:border-brand/50'}`}>
                    <input type="checkbox" className="hidden" checked={formData.amenities.includes(am)} onChange={() => toggleAmenity(am)} />
                    <Check className={`h-4 w-4 ${formData.amenities.includes(am) ? 'opacity-100' : 'opacity-0'}`} />
                    <span className="text-sm font-medium">{am}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Owner Info */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">5. Owner Information</h2>
              <p className="text-gray-500 text-sm mt-1">Provide KYC details. Documents are securely stored and never public.</p>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Relationship to Property *</label>
                  <select value={formData.ownerInfo.relationship} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, relationship: e.target.value as any}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none">
                    <option value="owner">Owner</option>
                    <option value="manager">Property Manager</option>
                    <option value="representative">Authorized Representative</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input type="text" value={formData.ownerInfo.fullName} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, fullName: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Email *</label>
                  <input type="email" value={formData.ownerInfo.email} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, email: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Mobile Number *</label>
                  <input type="text" value={formData.ownerInfo.phone} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, phone: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">WhatsApp Number</label>
                  <input type="text" value={formData.ownerInfo.whatsapp} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, whatsapp: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 border-b pb-2 mb-2 mt-6">Business Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Legal / Business Name</label>
                  <input type="text" value={formData.ownerInfo.businessName} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, businessName: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">PAN</label>
                  <input type="text" value={formData.ownerInfo.pan} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, pan: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none uppercase" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">GSTIN (Optional)</label>
                  <input type="text" value={formData.ownerInfo.gstin} onChange={e => setFormData({...formData, ownerInfo: {...formData.ownerInfo, gstin: e.target.value}})} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand outline-none uppercase" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">6. Review & Submit</h2>
              <p className="text-gray-500 text-sm mt-1">Review your property details before sending it for admin approval.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{formData.title || "Unnamed Property"}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {formData.city}, {formData.state}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-brand text-sm font-bold">Edit</button>
              </div>

              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Rooms & Inventory ({rooms.length})</h4>
                  {rooms.map(r => (
                    <div key={r._id} className="text-sm text-gray-600 flex justify-between w-64 mb-1">
                      <span>{r.name} (x{r.inventory})</span>
                      <span className="font-medium text-gray-900">₹{r.pricePerNight}</span>
                    </div>
                  ))}
                  {rooms.length === 0 && <p className="text-sm text-red-500 font-medium">No rooms added. Required.</p>}
                </div>
                <button onClick={() => setStep(3)} className="text-brand text-sm font-bold">Edit</button>
              </div>

              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Photos ({images.length})</h4>
                  {images.length < 3 && <p className="text-sm text-red-500 font-medium">At least 3 photos are required.</p>}
                  {images.length >= 3 && <p className="text-sm text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Photos uploaded.</p>}
                </div>
                <button onClick={() => setStep(4)} className="text-brand text-sm font-bold">Edit</button>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Owner Info</h4>
                  <p className="text-sm text-gray-600">{formData.ownerInfo.fullName || "Missing Name"}</p>
                  <p className="text-sm text-gray-600">{formData.ownerInfo.phone || "Missing Phone"}</p>
                </div>
                <button onClick={() => setStep(5)} className="text-brand text-sm font-bold">Edit</button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t p-4 fixed bottom-0 w-full z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack} 
            disabled={step === 1 || isSaving}
            className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900 disabled:opacity-30 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          
          {step < 6 ? (
            <button 
              onClick={handleNext}
              disabled={isSaving}
              className="px-8 py-3 bg-brand text-white font-extrabold rounded-xl shadow-lg shadow-brand/30 hover:bg-brand-dark transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-3 bg-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Submit for Approval <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
