// --- ENUMS ---

export enum UserRole {
  PetParent = 'pet_parent',
  Veterinarian = 'veterinarian',
  Vendor = 'vendor',
  Pharmacy = 'pharmacy',
  Admin = 'admin',
}

export enum ProfessionalStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Suspended = 'suspended',
}

export enum BusinessType {
    PetShop = 'pet_shop',
    Pharmacy = 'pharmacy',
    Grooming = 'grooming',
    Boarding = 'boarding',
    Training = 'training',
    Other = 'other',
}

export enum ProductCategory {
    Food = 'food',
    Medicine = 'medicine',
    Toy = 'toy',
    Accessory = 'accessory',
    Grooming = 'grooming',
    Healthcare = 'healthcare',
    Supplement = 'supplement',
}

export enum VerificationStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export enum DocumentType {
    License = 'license',
    Degree = 'degree',
    ExperienceCertificate = 'experience_certificate',
    ClinicRegistration = 'clinic_registration',
    GstCertificate = 'gst_certificate',
    BusinessLicense = 'business_license',
    PharmacyLicense = 'pharmacy_license',
}


// --- BASE INTERFACES ---

export interface UserProfile {
  auth_user_id: string; // From Supabase Auth
  email: string;
  role: UserRole;
  professional_status: ProfessionalStatus;
  verification_documents?: VerificationDocument[]; // Simplified for frontend
  created_at: string;
  updated_at: string;
  // Dynamic profile based on role
  veterinarian_profile?: VeterinarianProfile;
  vendor_profile?: VendorProfile;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_url: string; // URL from Supabase Storage
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  uploaded_at: string;
}

// --- PROFESSIONAL PROFILES ---

export interface Clinic {
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  working_hours?: Record<string, { start: string; end: string; closed: boolean }>;
}

export interface VeterinarianProfile {
  id: string;
  user_id: string;
  full_name: string;
  license_number: string;
  specializations: string[];
  experience_years: number;
  clinics: Clinic[];
  emergency_available: boolean;
  consultation_fee: number;
  services_offered: string[];
  profile_image_url?: string;
  clinic_images?: string[];
  bio: string;
  languages_spoken: string[];
  status: ProfessionalStatus;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  license_number: string;
  gst_number?: string;
  business_address: string;
  business_phone: string;
  // location: Geography(POINT, 4326);
  operating_hours: Record<string, { start: string; end: string; closed: boolean }>;
  delivery_available: boolean;
  delivery_radius_km?: number;
  minimum_order_amount?: number;
  business_images?: string[];
  description: string;
  services_offered: string[];
  status: ProfessionalStatus;
}


// --- OTHER ---

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  price: number;
  discounted_price?: number;
  stock_quantity: number;
  images: string[];
  prescription_required: boolean;
  // enums for age_group, pet_size
  brand?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'out_of_stock';
}
