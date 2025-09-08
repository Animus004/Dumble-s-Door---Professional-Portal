import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { UserProfile, UserRole, ProfessionalStatus, BusinessType } from './types';
import * as ApiService from './services/geminiService';
import { SIDENAV_ITEMS, ICONS } from './constants';
import Header from './components/Header';

// FIX: Add global declaration for window.google to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
}

// --- AUTH CONTEXT ---
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<string | null>;
  signUp: (email: string, pass: string, role: UserRole) => Promise<string | null>;
  signOut: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}
const AuthContext = createContext<AuthContextType | null>(null);
const useAuth = () => useContext(AuthContext)!;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const storedUser = localStorage.getItem('dumble_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('dumble_user');
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, pass: string) => {
    const { user, error } = await ApiService.mockSignIn(email, pass);
    if (user) {
      setUser(user);
      localStorage.setItem('dumble_user', JSON.stringify(user));
    }
    return error;
  };
  
  const signUp = async (email: string, pass: string, role: UserRole) => {
     const { user, error } = await ApiService.mockSignUp(email, pass, role);
     if (user) {
      setUser(user);
      // Don't store in localStorage until onboarding is complete in a real app
      // But for this mock, we'll store it to persist login state.
      localStorage.setItem('dumble_user', JSON.stringify(user));
     }
     return error;
  };

  const signOut = async () => {
    await ApiService.mockSignOut();
    setUser(null);
    localStorage.removeItem('dumble_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- UI COMPONENTS ---

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
    </div>
);

const Badge: React.FC<{ status: ProfessionalStatus }> = ({ status }) => {
    const statusStyles = {
        [ProfessionalStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [ProfessionalStatus.Approved]: 'bg-green-100 text-green-800',
        [ProfessionalStatus.Rejected]: 'bg-red-100 text-red-800',
        [ProfessionalStatus.Suspended]: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

// --- LAYOUT COMPONENTS ---

const Sidebar: React.FC<{ userRole: UserRole, currentPage: string, setPage: (page: string) => void, isOpen: boolean }> = ({ userRole, currentPage, setPage, isOpen }) => {
    const navItems = SIDENAV_ITEMS[userRole] || [];
    return (
        <aside className={`bg-gray-800 text-white w-64 space-y-2 py-4 flex-shrink-0 absolute lg:relative lg:translate-x-0 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
             <nav>
                {navItems.map(item => (
                    <button key={item.path} onClick={() => setPage(item.path)} className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 ${currentPage === item.path ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        {item.icon}
                        <span className="ml-4 font-medium">{item.title}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, signOut } = useAuth();
    const [page, setPage] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (!user) return null;

    const renderPage = () => {
        // A simple router
        switch (page) {
            case 'dashboard':
                 if (user.role === UserRole.Admin) return <AdminDashboard />;
                 return <ProfessionalDashboard />; // Default for Vet/Vendor
            case 'verification':
                 if (user.role === UserRole.Admin) return <VerificationQueue />;
                 return <p>Access Denied</p>
            // Add other pages here
            default:
                return <ProfessionalDashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar userRole={user.role} currentPage={page} setPage={setPage} isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={signOut} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                   {renderPage()}
                </main>
            </div>
        </div>
    );
};

// --- PAGE COMPONENTS ---

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mock data cards */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Verifications</h3>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Veterinarians</h3>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Vendors</h3>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                </div>
            </div>
        </div>
    );
};

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    const profile = user?.veterinarian_profile || user?.vendor_profile;
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.veterinarian_profile?.full_name || user?.vendor_profile?.business_name}!</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-800">Your profile status:</h3>
                    <Badge status={profile?.status || ProfessionalStatus.Pending} />
                </div>
                <p className="text-gray-600 mt-2">Your profile is currently being reviewed by our team. You will be notified once the status changes.</p>
            </div>
        </div>
    )
}

const VerificationQueue: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        ApiService.getPendingVerifications().then(data => {
            setProfiles(data);
            setIsLoading(false);
        });
    }, []);

    const handleStatusUpdate = async (userId: string, status: ProfessionalStatus) => {
        await ApiService.updateProfileStatus(userId, status, "Admin action");
        setSelectedProfile(null);
        // Refetch
        setIsLoading(true);
        ApiService.getPendingVerifications().then(data => {
            setProfiles(data);
            setIsLoading(false);
        });
    };

    if (isLoading) return <Spinner />;
    if (selectedProfile) return <VerificationDetails profile={selectedProfile} onBack={() => setSelectedProfile(null)} onStatusUpdate={handleStatusUpdate} />;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Verification Queue</h1>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {profiles.map(p => (
                            <tr key={p.auth_user_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{p.veterinarian_profile?.full_name || p.vendor_profile?.business_name}</div>
                                    <div className="text-sm text-gray-500">{p.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{p.role.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><Badge status={p.professional_status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedProfile(p)} className="text-blue-600 hover:text-blue-900">Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const VerificationDetails: React.FC<{ profile: UserProfile, onBack: () => void, onStatusUpdate: (userId: string, status: ProfessionalStatus) => void }> = ({ profile, onBack, onStatusUpdate }) => {
    const details = profile.veterinarian_profile || profile.vendor_profile;
    const isVet = !!profile.veterinarian_profile;

    return (
        <div>
             <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
               {ICONS.ARROW_LEFT} <span className="ml-1">Back to Queue</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Application</h1>
            <p className="text-gray-600 mb-6">{isVet ? (details as any).full_name : (details as any).business_name} ({profile.email})</p>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{isVet ? 'Veterinarian Details' : 'Vendor Details'}</h3>
                <p><strong>License:</strong> {details?.license_number}</p>
                {isVet && <p><strong>Experience:</strong> {(details as any).experience_years} years</p>}
                {isVet && <p><strong>Specializations:</strong> {(details as any).specializations.join(', ')}</p>}
                {!isVet && <p><strong>Business Type:</strong> {(details as any).business_type}</p>}
                
                {isVet && (details as any).clinics && (
                    <div className="pt-2">
                        <h4 className="font-semibold text-gray-700">Clinics:</h4>
                        <ul className="list-disc list-inside space-y-2 mt-2 pl-2">
                            {(details as any).clinics.map((clinic, index) => (
                                <li key={index} className="text-gray-600">
                                   <span className="font-medium text-gray-800">{clinic.clinic_name}</span> - {clinic.clinic_address} ({clinic.clinic_phone})
                                   {clinic.google_place_id && <span className="text-xs text-blue-500 ml-2">(Verified Location)</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                 <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Documents</h3>
                 <p className="text-gray-500">Document viewer would be here. Mock documents are considered valid.</p>
            </div>

            <div className="mt-6 flex space-x-4">
                 <button onClick={() => onStatusUpdate(profile.auth_user_id, ProfessionalStatus.Approved)} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Approve</button>
                 <button onClick={() => onStatusUpdate(profile.auth_user_id, ProfessionalStatus.Rejected)} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Reject</button>
            </div>
        </div>
    );
};

// --- AUTH & ONBOARDING FLOW ---

const AuthForm: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Veterinarian);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const err = isLogin ? await signIn(email, password) : await signUp(email, password, role);
        if (err) setError(err);
        setIsLoading(false);
    };

    return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (use 'password123')" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {!isLogin && (
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value={UserRole.Veterinarian}>I'm a Veterinarian</option>
                            <option value={UserRole.Vendor}>I'm a Vendor/Shop</option>
                        </select>
                    )}
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                        {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// --- ONBOARDING COMPONENTS ---

const GoogleMapsApiKeyPrompt: React.FC = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
    <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Google Maps API Key Required</h2>
      <p className="text-gray-600 mb-6">
        This feature requires a Google Maps API key to function. Please set your API key as the{' '}
        <code className="bg-gray-200 text-red-600 font-mono p-1 rounded">GOOGLE_MAPS_API_KEY</code> environment variable.
      </p>
      <p className="text-sm text-gray-500">
        The application will start working automatically once the environment variable is correctly configured. You might need to restart your development server.
      </p>
    </div>
  </div>
);

// FIX: Define props interface and correctly type the Input component using React.forwardRef
// to resolve type errors for props and ref forwarding.
interface InputProps {
  label: string;
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, name, value, onChange, type = "text", required = true, placeholder = '', disabled = false }, ref) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      ref={ref}
      type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} disabled={disabled}
      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${disabled ? 'bg-gray-100' : ''}`}
    />
  </div>
));
Input.displayName = 'Input';


const ProgressBar = ({ currentStep, totalSteps }) => (
    <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {currentStep > step ? '✓' : step}
                </div>
                {step < totalSteps && <div className={`flex-auto border-t-2 ${currentStep > step ? 'border-blue-600' : 'border-gray-200'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const VeterinarianOnboardingForm = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '', license_number: '', experience_years: 0,
        emergency_available: false,
        consultation_fee: 0,
        clinics: [{ clinic_name: '', clinic_address: '', clinic_phone: '', google_place_id: null, latitude: null, longitude: null }],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMapsScriptLoaded, setIsMapsScriptLoaded] = useState(!!window.google);
    
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!googleApiKey || window.google?.maps) {
          if(window.google?.maps) setIsMapsScriptLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsMapsScriptLoaded(true);
        script.onerror = () => console.error("Google Maps script failed to load.");
        
        document.head.appendChild(script);
        
        return () => {
          // Find the script and remove it
          const allScripts = document.getElementsByTagName('script');
          for (let i = 0; i < allScripts.length; i++) {
            if (allScripts[i].src.includes('maps.googleapis.com')) {
              allScripts[i].parentNode.removeChild(allScripts[i]);
            }
          }
        };
    }, [googleApiKey]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleClinicChange = (index, e) => {
        const updatedClinics = formData.clinics.map((clinic, i) => 
            i === index ? { ...clinic, [e.target.name]: e.target.value } : clinic
        );
        setFormData({ ...formData, clinics: updatedClinics });
    };
    
    const handlePlaceSelected = (index, place) => {
        const updatedClinics = formData.clinics.map((clinic, i) => {
            if (i === index) {
                const existingClinic = formData.clinics[i];
                return {
                    ...existingClinic,
                    clinic_name: place.name || existingClinic.clinic_name,
                    // Conditionally populate address and phone only if they are currently empty.
                    clinic_address: existingClinic.clinic_address.trim() === '' 
                        ? (place.formatted_address || '') 
                        : existingClinic.clinic_address,
                    clinic_phone: existingClinic.clinic_phone.trim() === '' 
                        ? (place.international_phone_number || '') 
                        : existingClinic.clinic_phone,
                    google_place_id: place.place_id,
                    latitude: place.geometry?.location?.lat(),
                    longitude: place.geometry?.location?.lng(),
                };
            }
            return clinic;
        });
        setFormData({ ...formData, clinics: updatedClinics });
    };

    const clearPlaceSelection = (index) => {
        const updatedClinics = formData.clinics.map((clinic, i) => {
            if (i === index) {
                // Keep the clinic name, but clear address/phone and Google data
                // to allow manual entry.
                return {
                    ...clinic,
                    clinic_address: '',
                    clinic_phone: '',
                    google_place_id: null,
                    latitude: null,
                    longitude: null,
                };
            }
            return clinic;
        });
        setFormData({ ...formData, clinics: updatedClinics });
    }

    const addClinic = () => {
        setFormData({ ...formData, clinics: [...formData.clinics, { clinic_name: '', clinic_address: '', clinic_phone: '', google_place_id: null, latitude: null, longitude: null }] });
    };

    const removeClinic = (index) => {
        if (formData.clinics.length <= 1) return; // Don't remove the last one
        const updatedClinics = formData.clinics.filter((_, i) => i !== index);
        setFormData({ ...formData, clinics: updatedClinics });
    };

    const handleNext = e => { e.preventDefault(); setStep(s => s + 1); };
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fullProfileData = { ...formData, specializations: ['General'], bio: 'N/A', services_offered: [], languages_spoken: [] };
        const updatedUser = await ApiService.saveVeterinarianProfile(user.auth_user_id, fullProfileData);
        onComplete(updatedUser);
    };
    
    const AutocompleteInput = ({ clinic, index, onClinicChange, onPlaceSelected, isMapsReady }) => {
        const inputRef = useRef(null);

        useEffect(() => {
            if (!isMapsReady || !inputRef.current) return;
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['establishment'],
                fields: ['place_id', 'name', 'formatted_address', 'international_phone_number', 'geometry.location']
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.place_id) onPlaceSelected(index, place);
            });
        }, [isMapsReady, index, onPlaceSelected]);

        return <Input ref={inputRef} label={`Clinic Name #${index + 1}`} name="clinic_name" value={clinic.clinic_name} onChange={e => onClinicChange(index, e)} placeholder="Start typing clinic name..." />;
    };

    if (!googleApiKey) return <GoogleMapsApiKeyPrompt />;

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Veterinarian Onboarding</h2>
            <p className="text-gray-500 mb-6">Complete your professional profile to get started.</p>
            <ProgressBar currentStep={step} totalSteps={3} />
            <div className="mt-8 space-y-4">
                {step === 1 && (
                    <>
                        <h3 className="text-lg font-semibold">Professional Information</h3>
                        <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
                        <Input label="Veterinary License Number" name="license_number" value={formData.license_number} onChange={handleChange} />
                        <Input label="Years of Experience" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
                        <Input label="Consultation Fee (INR)" name="consultation_fee" type="number" value={formData.consultation_fee} onChange={handleChange} placeholder="e.g., 500"/>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-gray-700">Available for Emergencies?</span>
                            <label htmlFor="emergency_available" className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="emergency_available" 
                                    className="sr-only peer"
                                    checked={formData.emergency_available}
                                    onChange={e => setFormData({ ...formData, emergency_available: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h3 className="text-lg font-semibold">Clinic Details</h3>
                        <p className="text-sm text-gray-500 mb-4">Search for your clinic on Google Maps or enter details manually.</p>
                        {!isMapsScriptLoaded && <div className="text-center text-gray-500">Loading mapping service...</div>}
                        {isMapsScriptLoaded && formData.clinics.map((clinic, index) => {
                           const placeSelected = !!clinic.google_place_id;
                           return (
                            <div key={index} className="p-4 border rounded-md relative space-y-4 mb-4 bg-gray-50">
                                {formData.clinics.length > 1 && (
                                    <button type="button" onClick={() => removeClinic(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" aria-label="Remove clinic">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                                <AutocompleteInput clinic={clinic} index={index} onClinicChange={handleClinicChange} onPlaceSelected={handlePlaceSelected} isMapsReady={isMapsScriptLoaded} />
                                <Input label="Clinic Address" name="clinic_address" value={clinic.clinic_address} onChange={(e) => handleClinicChange(index, e)} disabled={placeSelected} />
                                <Input label="Clinic Phone" name="clinic_phone" value={clinic.clinic_phone} onChange={(e) => handleClinicChange(index, e)} disabled={placeSelected} />
                                {placeSelected && (
                                    <button type="button" onClick={() => clearPlaceSelection(index)} className="text-sm text-blue-600 hover:underline">Clear & Enter Manually</button>
                                )}
                            </div>
                           )
                        })}
                        {isMapsScriptLoaded && <button type="button" onClick={addClinic} className="w-full mt-2 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            Add Another Clinic
                        </button>}
                    </>
                )}
                 {step === 3 && (
                    <>
                        <h3 className="text-lg font-semibold">Document Upload</h3>
                        <p className="text-gray-600">Please upload your veterinary license and degree certificates.</p>
                        <div className="mt-4 p-6 border-2 border-dashed rounded-md text-center">
                            <p className="text-gray-500">[Mock File Upload Component]</p>
                            <button type="button" className="mt-2 px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Select Files</button>
                        </div>
                    </>
                )}
            </div>
            <div className="mt-8 flex justify-between">
                {step > 1 && <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400">Back</button>}
                <div /> {/* Spacer */}
                {step < 3 && <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Next</button>}
                {step === 3 && <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>}
            </div>
        </form>
    );
};

const VendorOnboardingForm = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        business_name: '', business_type: BusinessType.PetShop, license_number: '',
        business_address: '', business_phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleNext = e => { e.preventDefault(); setStep(s => s + 1); };
    const handleBack = () => setStep(s => s - 1);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fullProfileData = { ...formData, description: 'N/A', delivery_available: false, operating_hours: {}, services_offered: [] };
        const updatedUser = await ApiService.saveVendorProfile(user.auth_user_id, fullProfileData);
        onComplete(updatedUser);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vendor Onboarding</h2>
            <p className="text-gray-500 mb-6">Complete your business profile to get started.</p>
            <ProgressBar currentStep={step} totalSteps={3} />
            <div className="mt-8 space-y-4">
                {step === 1 && (
                     <>
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} />
                        <div>
                           <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">Business Type</label>
                           <select name="business_type" id="business_type" value={formData.business_type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                               {Object.values(BusinessType).map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                           </select>
                        </div>
                        <Input label="Business License Number" name="license_number" value={formData.license_number} onChange={handleChange} />
                    </>
                )}
                 {step === 2 && (
                    <>
                        <h3 className="text-lg font-semibold">Contact & Location</h3>
                        <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} />
                        <Input label="Business Phone" name="business_phone" value={formData.business_phone} onChange={handleChange} />
                    </>
                )}
                 {step === 3 && (
                     <>
                        <h3 className="text-lg font-semibold">Document Upload</h3>
                        <p className="text-gray-600">Please upload your business license and GST certificate.</p>
                        <div className="mt-4 p-6 border-2 border-dashed rounded-md text-center">
                            <p className="text-gray-500">[Mock File Upload Component]</p>
                            <button type="button" className="mt-2 px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">Select Files</button>
                        </div>
                    </>
                )}
            </div>
            <div className="mt-8 flex justify-between">
                {step > 1 && <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400">Back</button>}
                <div />
                {step < 3 && <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Next</button>}
                {step === 3 && <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>}
            </div>
        </form>
    );
};


const OnboardingFlow: React.FC = () => {
    const { user, setUser, signOut } = useAuth();
    
    const handleOnboardingComplete = (updatedUser: UserProfile) => {
        setUser(updatedUser);
        localStorage.setItem('dumble_user', JSON.stringify(updatedUser));
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-2xl">
                 <div className="text-right mb-2">
                    <button onClick={signOut} className="text-sm text-gray-500 hover:underline">Logout</button>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                    {user.role === UserRole.Veterinarian && <VeterinarianOnboardingForm user={user} onComplete={handleOnboardingComplete} />}
                    {user.role === UserRole.Vendor && <VendorOnboardingForm user={user} onComplete={handleOnboardingComplete} />}
                </div>
            </div>
        </div>
    );
}

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen"><Spinner /></div>;
    }

    if (!user) {
        return <AuthForm />;
    }
    
    // Route to onboarding if profile is not complete
    // This is a simplified check. A real app would check for veterinarian_profile or vendor_profile existence.
    if (user.role !== UserRole.Admin && !user.veterinarian_profile && !user.vendor_profile) {
        return <OnboardingFlow />;
    }
    
    // Once onboarded, route to the appropriate dashboard
    return <DashboardLayout>Content for {user.role}</DashboardLayout>;
};

export default App;
