import { supabase } from '../supabaseClient';
import { UserProfile, UserRole, ProfessionalStatus, VeterinarianProfile, VendorProfile, Product, DocumentType, Clinic, ProfileAnalytics, Notification, NotificationType, NotificationPreferences } from '../types';
import { TablesInsert } from '../database.types';
import { notificationEmitter } from './notificationEmitter';

// --- MOCK NOTIFICATIONS ---
const MOCK_NOTIFICATIONS: Notification[] = [];

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
    
    const userProfile: UserProfile = {
        auth_user_id: data.id,
        email: data.email,
        role: data.role as UserRole,
        professional_status: data.professional_status as ProfessionalStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
        subscription_status: (data as any).subscription_status || 'free',
        notification_preferences: (data as any).notification_preferences || { // Add default
             in_app: { status_changes: true, new_applicants: true },
             email: { status_changes: true, new_applicants: true }
        },
        veterinarian_profile: Array.isArray(data.veterinarian_profile) ? data.veterinarian_profile[0] : data.veterinarian_profile,
        vendor_profile: Array.isArray(data.vendor_profile) ? data.vendor_profile[0] : data.vendor_profile,
    };

    return userProfile;
};


// --- ADMIN FUNCTIONS ---

export const getPendingVerifications = async () => {
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
    
    const profilesWithDetails = data?.filter(p => !!p.veterinarian_profile || !!p.vendor_profile)
     .map(p => ({
        ...p,
        veterinarian_profile: p.veterinarian_profile,
        vendor_profile: p.vendor_profile
     }));
     
    return { data: profilesWithDetails, error };
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
    
    // SIMULATE BACKEND TRIGGER: Create a notification for the user
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
    const mockAuditLog = [
        { id: '1', admin_email: 'admin@dumblesdoor.com', action: 'Approved', target_user_email: 'vendor@example.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', admin_email: 'admin@dumblesdoor.com', action: 'Rejected', target_user_email: 'test@test.com', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', admin_email: 'admin@dumblesdoor.com', action: 'Requested document changes for', target_user_email: 'vet.pending@example.com', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ];
    return { data: mockAuditLog, error: null };
}

export const batchUpdateProfileStatus = async (userIds: string[], status: ProfessionalStatus, rejectionDetails?: { reason: string, comments: string }) => {
    console.log(`Batch updating users ${userIds.join(', ')} to status ${status} with details:`, rejectionDetails);
    await new Promise(res => setTimeout(res, 1000));
    for (const userId of userIds) {
        await updateProfileStatus(userId, status, rejectionDetails);
    }
    return { error: null };
}

export const exportApprovedUsers = async () => {
    console.log("Generating CSV for approved users...");
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

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) onProgress(progress);
        if(progress >= 100 && !uploadError) clearInterval(interval);
    }, 100);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        clearInterval(interval);
        onProgress(100);
        return { publicUrl: null, error: uploadError };
    }

    clearInterval(interval);
    onProgress(100);
    
    const { data } = supabase.storage.from('verification_documents').getPublicUrl(filePath);
    return { publicUrl: data.publicUrl, error: null };
};

// --- NOTIFICATION SYSTEM ---

export const createNotification = async (details: { userId: string, message: string, type: NotificationType, link?: string }): Promise<Notification | null> => {
    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        user_id: details.userId,
        message: details.message,
        type: details.type,
        link: details.link,
        created_at: new Date().toISOString(),
        is_read: false,
    };
    // In a real app, this would be an insert to the 'notifications' table.
    MOCK_NOTIFICATIONS.unshift(newNotification);
    
    // Emit event to notify the frontend in real-time
    notificationEmitter.emit(newNotification);

    return newNotification;
};

export const getNotificationsForUser = async (userId: string) => {
    await new Promise(res => setTimeout(res, 500));
    return { data: MOCK_NOTIFICATIONS.filter(n => n.user_id === userId), error: null };
}

export const markNotificationAsRead = async (notificationId: string) => {
    await new Promise(res => setTimeout(res, 200));
    const notification = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
    if (notification) notification.is_read = true;
    return { error: null };
}

export const markAllNotificationsAsRead = async (userId: string) => {
    await new Promise(res => setTimeout(res, 300));
    MOCK_NOTIFICATIONS.forEach(n => {
        if (n.user_id === userId) n.is_read = true;
    });
    return { error: null };
}

export const updateNotificationPreferences = async (userId: string, preferences: NotificationPreferences) => {
    const { error } = await supabase
        .from('user_profiles')
        // FIX: Remove 'as any' cast now that database types are updated.
        .update({ notification_preferences: preferences })
        .eq('id', userId);
        
    if (error) return { updatedProfile: null, error };

    const updatedProfile = await getCurrentUserProfile(userId);
    return { updatedProfile, error: null };
}
