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

// --- NEW INTERFACES for advanced features ---

export enum NotificationType {
    StatusApproved = 'status_approved',
    StatusRejected = 'status_rejected',
    NewApplicant = 'new_applicant', // For admins
    DocumentReminder = 'document_reminder',
}

export enum AppointmentStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Completed = 'completed',
}


export interface Notification {
  id: string;
  user_id: string;
  created_at: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
}

export interface NotificationPreferences {
    in_app: {
        status_changes: boolean;
        new_applicants: boolean; // For admins
    };
    email: {
        status_changes: boolean;
        new_applicants: boolean;
    }
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  before_image_url: string;
  after_image_url: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  text: string;
  rating: number; // 1-5
}

export interface ProfileAnalytics {
  profile_views: { total: number; change: number };
  appointments_booked: { total: number; change: number };
  conversion_rate: { value: number; change: number };
  views_over_time: { labels: string[]; data: number[] };
}


// --- BASE INTERFACES ---

export interface UserProfile {
  auth_user_id: string; // From Supabase Auth
  email: string;
  role: UserRole;
  professional_status: ProfessionalStatus;
  subscription_status?: 'free' | 'premium';
  notification_preferences: NotificationPreferences;
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
  expires_at?: string;
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
  portfolio?: PortfolioItem[];
  testimonials?: Testimonial[];
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
  portfolio?: PortfolioItem[];
  testimonials?: Testimonial[];
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

export interface Appointment {
  id: string;
  pet_id: string;
  auth_user_id: string; // This is the pet parent
  vet_id: string; // The veterinarian_profile id
  appointment_date: string;
  status: AppointmentStatus;
  notes?: string;
  
  // Joined data for display
  user_profiles?: { email: string };
  // Mocked for display as we don't have pet info
  pet_details?: { name: string; breed: string };
}

// --- ADMIN & ANALYTICS ---

export interface DashboardAnalytics {
  pendingVerifications: number;
  newRegistrations: number;
  approvalRate: number;
  registrationTrends: {
    labels: string[];
    vetData: number[];
    vendorData: number[];
  };
  approvalStats: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

export interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_user_email: string;
  timestamp: string;
}