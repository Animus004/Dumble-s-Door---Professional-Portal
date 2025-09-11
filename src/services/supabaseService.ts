import { supabase } from '../supabaseClient';
import { UserProfile, UserRole, ProfessionalStatus, VeterinarianProfile, VendorProfile, Product, DocumentType, Clinic, ProfileAnalytics, NotificationType, NotificationPreferences, VerificationDocument, AppointmentStatus } from '../types';
import { TablesInsert, Json } from '../database.types';

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
        notification_preferences: { // Default preferences
            in_app: { status_changes: true, new_applicants: true },
            email: { status_changes: true, new_applicants: true }
        }
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

// FIX: Re-implemented to fetch user profile and related professional profiles
// in a single query, which is more efficient and aligns with the database schema.
// This resolves errors from trying to query a non-existent 'professional_profiles' table.
export const getCurrentUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        veterinarian_profile:veterinarian_profiles(*, clinics(*)),
        vendor_profile:vendor_profiles(*),
        verification_documents:verification_documents!user_id(*)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) {
        console.error("Error fetching user profile:", error?.message);
        return null;
    }
    
    // Supabase returns a single object for a to-one relationship.
    // The check for an array is for safety but typically not needed for one-to-one joins.
    const vetProfile = Array.isArray(data.veterinarian_profile) ? data.veterinarian_profile[0] : data.veterinarian_profile;
    const vendProfile = Array.isArray(data.vendor_profile) ? data.vendor_profile[0] : data.vendor_profile;

    const fullProfile: UserProfile = {
        auth_user_id: data.id,
        email: data.email,
        role: data.role as UserRole,
        professional_status: data.professional_status as ProfessionalStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        subscription_status: 'free', // Default value
        notification_preferences: (data.notification_preferences as unknown as NotificationPreferences) || {
            in_app: { status_changes: true, new_applicants: true },
            email: { status_changes: true, new_applicants: true }
        },
        veterinarian_profile: vetProfile || undefined,
        vendor_profile: vendProfile || undefined,
        verification_documents: (data.verification_documents as VerificationDocument[]) || [],
    };

    return fullProfile;
};


// --- ADMIN FUNCTIONS ---

export const getPendingVerifications = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        role,
        professional_status,
        created_at,
        updated_at,
        notification_preferences,
        veterinarian_profile:veterinarian_profiles(*, clinics(*)),
        vendor_profile:vendor_profiles(*),
        verification_documents!user_id(*)
      `)
      .eq('professional_status', ProfessionalStatus.Pending);

    if (error) {
        console.error("Error fetching pending verifications:", error);
        return { data: [], error };
    }
    
    const userProfiles: UserProfile[] = (data || [])
        .filter((p: any) => !!p.veterinarian_profile || !!p.vendor_profile)
        .map((p: any) => ({
            auth_user_id: p.id,
            email: p.email,
            role: p.role as UserRole,
            professional_status: p.professional_status as ProfessionalStatus,
            created_at: p.created_at,
            updated_at: p.updated_at,
            notification_preferences: (p.notification_preferences as unknown as NotificationPreferences) || {
                in_app: { status_changes: true, new_applicants: true },
                email: { status_changes: true, new_applicants: true }
            },
            veterinarian_profile: (Array.isArray(p.veterinarian_profile) ? p.veterinarian_profile[0] : p.veterinarian_profile) || undefined,
            vendor_profile: (Array.isArray(p.vendor_profile) ? p.vendor_profile[0] : p.vendor_profile) || undefined,
            verification_documents: p.verification_documents as VerificationDocument[],
            subscription_status: 'free', // Default value, assuming not selected in this query
        }));
     
    return { data: userProfiles, error: null };
};

export const updateProfileStatus = async (userId: string, status: ProfessionalStatus, rejectionDetails?: { reason: string, comments: string }) => {
    console.log(`Updating status for ${userId} to ${status} with rejection details:`, rejectionDetails);

    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ professional_status: status, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (profileError) return { error: profileError };

    // Also update the status in the specific professional profile table
    const { data: userProfile } = await supabase.from('user_profiles').select('role').eq('id', userId).single();
    let specificProfileUpdate;
    if (userProfile?.role === UserRole.Veterinarian) {
        specificProfileUpdate = await supabase.from('veterinarian_profiles').update({ status }).eq('user_id', userId);
    }
    if (userProfile?.role === UserRole.Vendor) {
        specificProfileUpdate = await supabase.from('vendor_profiles').update({ status }).eq('user_id', userId);
    }
    if(specificProfileUpdate?.error) return { error: specificProfileUpdate.error };
    
    // Create a notification for the user. This will be picked up by the real-time listener.
    let message = '';
    let type: NotificationType;
    if (status === ProfessionalStatus.Approved) {
        message = 'Congratulations! Your profile has been approved.';
        type = NotificationType.StatusApproved;
    } else if (status === ProfessionalStatus.Rejected) {
        message = `Your profile review is complete. Reason: ${rejectionDetails?.reason || 'Details in email'}.`;
        type = NotificationType.StatusRejected;
    } else {
        return { error: null }; // No notification for other statuses for now
    }
    await createNotification({ userId, message, type });


    return { error: null };
};

// --- MOCK FUNCTIONS FOR ADMIN DASHBOARD - in a real app, these would be RPC calls or complex queries. ---
// TODO: Replace these mock implementations with Supabase RPC calls for production.
export const getDashboardAnalytics = async () => {
    await new Promise(res => setTimeout(res, 800));
    const { data: pending } = await getPendingVerifications();
    const mockData = {
        pendingVerifications: pending?.length ?? 0,
        newRegistrations: 5,
        approvalRate: 85.2,
        registrationTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            vetData: [12, 19, 3, 5, 2, 3],
            vendorData: [8, 15, 7, 9, 6, 5],
        },
        approvalStats: {
            approved: 150,
            pending: pending?.length ?? 0,
            rejected: 25,
        },
    };
    return { data: mockData, error: null };
}

export const getAuditTrail = async () => {
    await new Promise(res => setTimeout(res, 500));
    // TODO: Replace with a query to a real 'audit_log' table
    const mockAuditLog = [
        { id: '1', admin_email: 'admin@dumblesdoor.com', action: 'Approved', target_user_email: 'vendor@example.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', admin_email: 'admin@dumblesdoor.com', action: 'Rejected', target_user_email: 'test@test.com', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', admin_email: 'admin@dumblesdoor.com', action: 'Requested document changes for', target_user_email: 'vet.pending@example.com', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];
    return { data: mockAuditLog, error: null };
}

export const batchUpdateProfileStatus = async (userIds: string[], status: ProfessionalStatus, rejectionDetails?: { reason: string, comments: string }) => {
    for (const userId of userIds) {
        const { error } = await updateProfileStatus(userId, status, rejectionDetails);
        if (error) {
            // If an error occurs during one of the updates, stop and return the error.
            return { error };
        }
    }
    // If all updates were successful, return no error.
    return { error: null };
}

export const exportApprovedUsers = async () => {
    console.log("Generating CSV for approved users...");
    // TODO: This should be a server-side function that queries the database and returns a CSV file.
    await new Promise(res => setTimeout(res, 1500));
    const headers = "email,role,business_name,full_name,license_number,status\n";
    const rows = [
        "vendor@example.com,vendor,Happy Tails Pet Store,,TSL-98765,approved",
        "another.vet@example.com,veterinarian,,Dr. Jane Doe,VCI-54321,approved"
    ].join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "approved_professionals.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    return { error: null };
}

// --- ONBOARDING & PROFILE MANAGEMENT ---

// TODO: Replace with a Supabase RPC call for production.
export const getProfileAnalytics = async (): Promise<{ data: ProfileAnalytics | null, error: any }> => {
    await new Promise(res => setTimeout(res, 700));
    const mockData: ProfileAnalytics = {
        profile_views: { total: 1280, change: 15 },
        appointments_booked: { total: 45, change: -5 },
        conversion_rate: { value: 3.5, change: -0.2 },
        views_over_time: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [150, 220, 300, 250, 400, 560],
        },
    };
    return { data: mockData, error: null };
};

type UploadedDoc = { document_type: DocumentType; document_url: string };

export const saveVeterinarianProfile = async (
    userId: string, 
    profileData: Omit<VeterinarianProfile, 'id' | 'user_id' | 'status' | 'clinics'> & { clinics: Clinic[]}, 
    documents: UploadedDoc[]
) => {
    const { data: vetProfile, error: vetError } = await supabase
        .from('veterinarian_profiles')
        .insert({ ...profileData, user_id: userId, status: ProfessionalStatus.Pending })
        .select()
        .single();
    
    if (vetError) return { profile: null, error: vetError };

    const clinicData = profileData.clinics.map(c => ({ ...c, vet_profile_id: vetProfile.id }));
    const { error: clinicError } = await supabase.from('clinics').insert(clinicData);
    if(clinicError) return { profile: null, error: clinicError };

    const docData = documents.map(d => ({ ...d, user_id: userId }));
    const { error: docError } = await supabase.from('verification_documents').insert(docData);
    if(docError) return { profile: null, error: docError };
    
    const updatedProfile = await getCurrentUserProfile(userId);
    return { profile: updatedProfile, error: null };
};

export const saveVendorProfile = async (userId: string, profileData: Omit<VendorProfile, 'id' | 'user_id' | 'status'>, documents: UploadedDoc[]) => {
    const { error } = await supabase
        .from('vendor_profiles')
        .insert({ ...profileData, user_id: userId, status: ProfessionalStatus.Pending });

    if (error) return { profile: null, error };
    
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
        id: productData.id || undefined,
    };
    return supabase.from('products').upsert(dataToSave);
};

export const deleteProduct = async (productId: string) => {
    return supabase.from('products').delete().eq('id', productId);
};

// --- APPOINTMENT MANAGEMENT ---

export const getAppointmentsForVet = async (vetProfileId: string) => {
    // Note: The 'appointments' table and its columns are assumed based on the user request,
    // as they are not present in the provided database.types.ts file.
    // The select query includes a join on user_profiles to fetch the pet parent's email.
    const { data, error } = await supabase
        .from('appointments')
        .select(`
            id,
            pet_id,
            auth_user_id,
            vet_id,
            appointment_date,
            status,
            notes,
            user_profiles ( email )
        `)
        .eq('vet_id', vetProfileId)
        .order('appointment_date', { ascending: false });
        
    return { data, error };
};
    
export const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    // Note: The 'appointments' table is assumed based on the user request.
    const { error } = await supabase
        .from('appointments')
        .update({ status: status })
        .eq('id', appointmentId);
        
    // In a real app, you might create a notification for the pet parent here.
    
    return { error };
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
        });

    // Mock progress since Supabase JS client v2 doesn't support upload progress yet.
    // In a real app, you might use a server-side endpoint with tus-js-client for this.
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) onProgress(progress);
        if(progress >= 100 && !uploadError) clearInterval(interval);
    }, 100);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        clearInterval(interval);
        onProgress(100); // Mark as complete even on error
        return { publicUrl: null, error: uploadError };
    }

    clearInterval(interval);
    onProgress(100);
    
    const { data } = supabase.storage.from('verification_documents').getPublicUrl(filePath);
    return { publicUrl: data.publicUrl, error: null };
};

// --- NOTIFICATION SYSTEM ---

export const createNotification = async (details: { userId: string, message: string, type: NotificationType, link?: string }) => {
    return supabase.from('notifications').insert({
        user_id: details.userId,
        message: details.message,
        type: details.type,
        link: details.link
    });
};

export const getNotificationsForUser = async (userId: string) => {
    return supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
}

export const markNotificationAsRead = async (notificationId: string) => {
    return supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
}

export const markAllNotificationsAsRead = async (userId: string) => {
     return supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
}

export const updateNotificationPreferences = async (userId: string, preferences: NotificationPreferences) => {
    const { error } = await supabase
        .from('user_profiles')
        // FIX: Cast 'NotificationPreferences' to 'Json' via 'unknown' to match the expected type for the Supabase update operation.
        .update({ notification_preferences: preferences as unknown as Json })
        .eq('id', userId);
        
    if (error) return { updatedProfile: null, error };

    const updatedProfile = await getCurrentUserProfile(userId);
    return { updatedProfile, error: null };
}