import { supabase } from '../supabaseClient';
import { UserProfile, UserRole, ProfessionalStatus, VeterinarianProfile, VendorProfile, Product, DocumentType } from '../types';
import { TablesInsert } from '../database.types';

// --- AUTH FUNCTIONS ---

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, role: UserRole) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
      },
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const onAuthStateChange = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
}

export const getSession = async () => {
    return supabase.auth.getSession();
}


// --- USER PROFILE FUNCTIONS ---

export const getCurrentUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
            *,
            veterinarian_profile:veterinarian_profiles(*, clinics(*)),
            vendor_profile:vendor_profiles(*)
        `)
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
    }
    
    // The RPC result might not match the desired shape, so we cast it carefully.
    const userProfile: UserProfile = {
        auth_user_id: data.id,
        email: data.email,
        role: data.role as UserRole,
        professional_status: data.professional_status as ProfessionalStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // The nested selects return arrays, but they are one-to-one, so we take the first element.
        veterinarian_profile: data.veterinarian_profile[0] as VeterinarianProfile | undefined,
        vendor_profile: data.vendor_profile[0] as VendorProfile | undefined,
    };

    return userProfile;
};


// --- ADMIN FUNCTIONS ---

export const getPendingVerifications = async () => {
    // This function fetches user profiles that are pending and have a related professional profile.
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        auth_user_id:id,
        email,
        role,
        professional_status,
        created_at,
        updated_at,
        veterinarian_profile:veterinarian_profiles(*),
        vendor_profile:vendor_profiles(*),
        verification_documents(*)
      `)
      .eq('professional_status', ProfessionalStatus.Pending);

    if (error) console.error("Error fetching pending verifications:", error);
    
    // Filter out users who are pending but haven't submitted their profile yet
    const profilesWithDetails = data?.filter(p => p.veterinarian_profile.length > 0 || p.vendor_profile.length > 0)
     .map(p => ({
        ...p,
        veterinarian_profile: p.veterinarian_profile[0],
        vendor_profile: p.vendor_profile[0]
     }));
     
    return { data: profilesWithDetails, error };
};

export const updateProfileStatus = async (userId: string, status: ProfessionalStatus, reason?: string) => {
    // We should ideally use an RPC function to update both tables transactionally
    // For simplicity, we update them sequentially.
    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ professional_status: status, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (profileError) return { error: profileError };

    // Also update the status in the specific professional profile table
    const { data: userProfile } = await supabase.from('user_profiles').select('role').eq('id', userId).single();

    if (userProfile?.role === UserRole.Veterinarian) {
        return supabase.from('veterinarian_profiles').update({ status }).eq('user_id', userId);
    }
    if (userProfile?.role === UserRole.Vendor) {
        return supabase.from('vendor_profiles').update({ status }).eq('user_id', userId);
    }
    
    return { error: null };
};

// --- ONBOARDING & PROFILE MANAGEMENT ---

type UploadedDoc = { document_type: DocumentType; document_url: string };

export const saveVeterinarianProfile = async (
    userId: string, 
    profileData: Omit<VeterinarianProfile, 'id' | 'user_id' | 'status' | 'clinics'> & { clinics: Partial<any>[]}, 
    documents: UploadedDoc[]
) => {
    // This should be a transaction. We'll use an RPC function in a real app.
    // For now, we do it step-by-step.
    
    const { data: vetProfile, error: vetError } = await supabase
        .from('veterinarian_profiles')
        .insert({ ...profileData, user_id: userId, status: ProfessionalStatus.Pending })
        .select()
        .single();
    
    if (vetError) return { profile: null, error: vetError };

    // Insert clinics
    const clinicData = profileData.clinics.map(c => ({ ...c, vet_profile_id: vetProfile.id }));
    const { error: clinicError } = await supabase.from('clinics').insert(clinicData);
    if(clinicError) return { profile: null, error: clinicError };


    // Insert documents
    const docData = documents.map(d => ({ ...d, user_id: userId }));
    const { error: docError } = await supabase.from('verification_documents').insert(docData);
    if(docError) return { profile: null, error: docError };
    
    // Finally, get the full updated profile
    const updatedProfile = await getCurrentUserProfile(userId);
    return { profile: updatedProfile, error: null };
};

export const saveVendorProfile = async (userId: string, profileData: Omit<VendorProfile, 'id' | 'user_id' | 'status'>, documents: UploadedDoc[]) => {
    const { error } = await supabase
        .from('vendor_profiles')
        .insert({ ...profileData, user_id: userId, status: ProfessionalStatus.Pending });

    if (error) return { profile: null, error };
    
     // Insert documents
    const docData = documents.map(d => ({ ...d, user_id: userId }));
    const { error: docError } = await supabase.from('verification_documents').insert(docData);
    if(docError) return { profile: null, error: docError };

    const updatedProfile = await getCurrentUserProfile(userId);
    return { profile: updatedProfile, error: null };
};


export const updateVeterinarianProfile = async (userId: string, profileData: Partial<VeterinarianProfile>) => {
    const { error } = await supabase
        .from('veterinarian_profiles')
        .update(profileData)
        .eq('user_id', userId);

    if (error) return { updatedProfile: null, error };
    
    const updatedProfile = await getCurrentUserProfile(userId);
    return { updatedProfile, error: null };
};

export const updateVendorProfile = async (userId: string, profileData: Partial<VendorProfile>) => {
    const { error } = await supabase
        .from('vendor_profiles')
        .update(profileData)
        .eq('user_id', userId);
        
    if (error) return { updatedProfile: null, error };

    const updatedProfile = await getCurrentUserProfile(userId);
    return { updatedProfile, error: null };
};

// --- PRODUCT MANAGEMENT ---

export const getProductsByVendor = async (vendorProfileId: string) => {
    return supabase.from('products').select('*').eq('vendor_id', vendorProfileId);
};

export const saveProduct = async (productData: Product) => {
    const dataToSave: TablesInsert<'products'> = {
        ...productData,
        vendor_id: productData.vendor_id,
        id: productData.id || undefined, // Let Supabase generate ID if it's new
    };
    return supabase.from('products').upsert(dataToSave);
};

export const deleteProduct = async (productId: string) => {
    return supabase.from('products').delete().eq('id', productId);
};


// --- FILE STORAGE ---

export const uploadDocument = async (
    userId: string, 
    file: File, 
    onProgress: (progress: number) => void
): Promise<{ publicUrl: string | null; error: Error | null }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            // @ts-ignore - Supabase JS v2 has this, but types might be lagging
            onProgress: ({ loaded, total }) => {
                onProgress(Math.round((loaded / total) * 100));
            },
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { publicUrl: null, error: uploadError };
    }

    const { data } = supabase.storage
        .from('verification_documents')
        .getPublicUrl(filePath);
        
    return { publicUrl: data.publicUrl, error: null };
};
