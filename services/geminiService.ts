// This file has been repurposed to act as a mock Supabase service.
// It simulates database and authentication interactions for the frontend.

import { UserProfile, UserRole, ProfessionalStatus, VeterinarianProfile, VendorProfile, BusinessType, Clinic } from '../types';

// --- MOCK DATABASE ---

const MOCK_USERS: UserProfile[] = [
  {
    auth_user_id: 'admin-user-id',
    email: 'admin@dumblesdoor.com',
    role: UserRole.Admin,
    professional_status: ProfessionalStatus.Approved,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    auth_user_id: 'vet-pending-id',
    email: 'vet.pending@example.com',
    role: UserRole.Veterinarian,
    professional_status: ProfessionalStatus.Pending,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    veterinarian_profile: {
      id: 'vet-profile-1',
      user_id: 'vet-pending-id',
      full_name: 'Dr. Aisha Sharma',
      license_number: 'VCI-12345',
      specializations: ['Dermatology', 'Internal Medicine'],
      experience_years: 8,
      clinics: [
          {
              clinic_name: 'Paws & Claws Clinic (Main)',
              clinic_address: '123, MG Road, Bangalore, 560001',
              clinic_phone: '9876543210',
              google_place_id: 'ChIJb_p4q0ARrjsR1g1aXN-aCgQ',
              latitude: 12.9716,
              longitude: 77.5946
          },
          {
              clinic_name: 'PetCare Visiting Center',
              clinic_address: '789, Koramangala, Bangalore, 560095',
              clinic_phone: '9123456789',
          }
      ],
      emergency_available: true,
      consultation_fee: 800,
      services_offered: ['General Checkup', 'Vaccination', 'Skin Treatment'],
      bio: 'A passionate vet dedicated to animal welfare.',
      languages_spoken: ['English', 'Hindi', 'Kannada'],
      status: ProfessionalStatus.Pending,
    }
  },
  {
    auth_user_id: 'vendor-approved-id',
    email: 'vendor@example.com',
    role: UserRole.Vendor,
    professional_status: ProfessionalStatus.Approved,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date().toISOString(),
     vendor_profile: {
      id: 'vendor-profile-1',
      user_id: 'vendor-approved-id',
      business_name: 'Happy Tails Pet Store',
      business_type: BusinessType.PetShop,
      license_number: 'TSL-98765',
      gst_number: '29ABCDE1234F1Z5',
      business_address: '456, 10th Main, Indiranagar, Bangalore, 560038',
      business_phone: '9123456780',
      delivery_available: true,
      description: 'Your one-stop shop for all pet needs.',
      operating_hours: { monday: { start: '10:00', end: '20:00', closed: false } },
      services_offered: ['Pet Food', 'Toys', 'Accessories'],
      status: ProfessionalStatus.Approved,
    }
  },
  {
    auth_user_id: 'vet-onboarding-id',
    email: 'new.vet@example.com',
    role: UserRole.Veterinarian,
    professional_status: ProfessionalStatus.Pending, // Status during onboarding
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // No professional profile yet as they are in the process of creating it
  }
];

// --- MOCK API FUNCTIONS ---

export const mockSignIn = async (email: string, password: string): Promise<{ user: UserProfile, error: string | null }> => {
  console.log(`Attempting login for ${email}`);
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  const user = MOCK_USERS.find(u => u.email === email);
  if (user && password === 'password123') { // Use a fixed password for demo
    return { user, error: null };
  }
  return { user: null, error: 'Invalid email or password.' };
};

export const mockSignUp = async (email: string, password: string, role: UserRole): Promise<{ user: UserProfile, error: string | null }> => {
    console.log(`Attempting signup for ${email} as ${role}`);
    await new Promise(res => setTimeout(res, 500));
    if (MOCK_USERS.find(u => u.email === email)) {
        return { user: null, error: 'User with this email already exists.' };
    }
    const newUser: UserProfile = {
        auth_user_id: `new-user-${Date.now()}`,
        email,
        role,
        professional_status: ProfessionalStatus.Pending,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    return { user: newUser, error: null };
};

export const mockSignOut = async (): Promise<void> => {
    console.log('User signed out.');
    await new Promise(res => setTimeout(res, 200));
    return;
};

export const getPendingVerifications = async (): Promise<UserProfile[]> => {
    await new Promise(res => setTimeout(res, 800));
    return MOCK_USERS.filter(u => u.professional_status === ProfessionalStatus.Pending && (u.veterinarian_profile || u.vendor_profile));
};

export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
    await new Promise(res => setTimeout(res, 400));
    return MOCK_USERS.find(u => u.auth_user_id === userId) || null;
};

export const updateProfileStatus = async (userId: string, status: ProfessionalStatus, reason?: string): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 600));
    const userIndex = MOCK_USERS.findIndex(u => u.auth_user_id === userId);
    if (userIndex > -1) {
        MOCK_USERS[userIndex].professional_status = status;
        if (MOCK_USERS[userIndex].veterinarian_profile) {
            MOCK_USERS[userIndex].veterinarian_profile.status = status;
        }
         if (MOCK_USERS[userIndex].vendor_profile) {
            MOCK_USERS[userIndex].vendor_profile.status = status;
        }
        console.log(`Updated status for ${userId} to ${status}. Reason: ${reason || 'N/A'}`);
        return true;
    }
    return false;
};

// Simulate creating/updating the detailed professional profile after signup
export const saveVeterinarianProfile = async (userId: string, profileData: Omit<VeterinarianProfile, 'id' | 'user_id' | 'status'>): Promise<UserProfile> => {
    await new Promise(res => setTimeout(res, 1000));
    const userIndex = MOCK_USERS.findIndex(u => u.auth_user_id === userId);
    if (userIndex > -1) {
        MOCK_USERS[userIndex].veterinarian_profile = {
            ...profileData,
            id: `vet-profile-${Date.now()}`,
            user_id: userId,
            status: ProfessionalStatus.Pending,
        };
         MOCK_USERS[userIndex].professional_status = ProfessionalStatus.Pending;
        console.log(`Saved veterinarian profile for ${userId}`);
        return MOCK_USERS[userIndex];
    }
    throw new Error("User not found");
};

export const saveVendorProfile = async (userId: string, profileData: Omit<VendorProfile, 'id' | 'user_id' | 'status'>): Promise<UserProfile> => {
    await new Promise(res => setTimeout(res, 1000));
    const userIndex = MOCK_USERS.findIndex(u => u.auth_user_id === userId);
    if (userIndex > -1) {
        MOCK_USERS[userIndex].vendor_profile = {
            ...profileData,
            id: `vendor-profile-${Date.now()}`,
            user_id: userId,
            status: ProfessionalStatus.Pending,
        };
        MOCK_USERS[userIndex].professional_status = ProfessionalStatus.Pending;
        console.log(`Saved vendor profile for ${userId}`);
        return MOCK_USERS[userIndex];
    }
    throw new Error("User not found");
};