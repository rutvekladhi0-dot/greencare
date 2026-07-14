import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged as onAuthStateChangedReal,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { Doctor, Department, UserProfile, Appointment, MedicalReport } from '../types';
import config from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(config);
export const auth = getAuth(app);
export const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Custom listener mechanism for local auth state changes
type AuthCallback = (user: UserProfile | null) => void;
const authCallbacks: AuthCallback[] = [];

// Initialize local user state from localStorage
let currentLocalUser: UserProfile | null = null;
try {
  const stored = localStorage.getItem('current_user_profile');
  if (stored) {
    currentLocalUser = JSON.parse(stored);
  }
} catch (e) {
  console.error("Failed to parse stored user profile", e);
}

// Function to trigger all custom auth listeners
const notifyAuthListeners = (user: UserProfile | null) => {
  currentLocalUser = user;
  authCallbacks.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      console.error("Error in auth callback: ", e);
    }
  });
};

// Custom onAuthStateChanged wrapper to support fallback auth
export const onAuthStateChanged = (firebaseAuth: any, callback: (user: any) => void) => {
  const wrapperCallback = async (user: UserProfile | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: true
      } as any);
    } else {
      callback(null);
    }
  };

  authCallbacks.push(wrapperCallback);

  // Trigger initial state callback immediately in a macrotask
  setTimeout(() => {
    wrapperCallback(currentLocalUser);
  }, 0);

  // Sync real Firebase Auth changes if they happen
  const unsubscribeReal = onAuthStateChangedReal(firebaseAuth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          localStorage.setItem('current_user_profile', JSON.stringify(profile));
          notifyAuthListeners(profile);
        }
      } catch (err) {
        console.error("Failed to load user profile in auth listener: ", err);
      }
    } else if (currentLocalUser && !currentLocalUser.uid.startsWith('local-')) {
      // Clear if not a custom local user
      localStorage.removeItem('current_user_profile');
      notifyAuthListeners(null);
    }
  });

  return () => {
    const index = authCallbacks.indexOf(wrapperCallback);
    if (index !== -1) {
      authCallbacks.splice(index, 1);
    }
    unsubscribeReal();
  };
};

// 1. Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user profile already exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let role: 'patient' | 'admin' = 'patient';
    // Make first user or specific emails admin for testing, or check existing
    if (user.email === 'rutvekladhi0@gmail.com' || user.email?.startsWith('admin')) {
      role = 'admin';
    } else if (userDoc.exists()) {
      role = userDoc.data().role || 'patient';
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Patient',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
      role: role,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp()
    };

    await setDoc(userDocRef, profile, { merge: true });
    
    localStorage.setItem('current_user_profile', JSON.stringify(profile));
    notifyAuthListeners(profile);

    return profile;
  } catch (error: any) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string, role: 'patient' | 'admin' = 'patient') => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Check if email already registered in our users collection
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const err = new Error("This email is already in use.");
      (err as any).code = 'auth/email-already-in-use';
      throw err;
    }

    // 2. Generate a custom local UID
    const uid = 'local-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();

    let finalRole = role;
    if (cleanEmail === 'rutvekladhi0@gmail.com' || cleanEmail.startsWith('admin')) {
      finalRole = 'admin';
    }

    const profile: UserProfile = {
      uid: uid,
      email: cleanEmail,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
      role: finalRole,
      createdAt: serverTimestamp()
    };

    // 3. Save directly to Firestore users collection
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      _password: password
    });

    localStorage.setItem('current_user_profile', JSON.stringify(profile));
    notifyAuthListeners(profile);

    return profile;
  } catch (error: any) {
    console.error("Error signing up with email fallback: ", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Query for the user document in Firestore
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const err = new Error("Invalid email or password.");
      (err as any).code = 'auth/invalid-credential';
      throw err;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData._password !== password) {
      const err = new Error("Invalid email or password.");
      (err as any).code = 'auth/invalid-credential';
      throw err;
    }

    const profile: UserProfile = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      createdAt: userData.createdAt
    };

    localStorage.setItem('current_user_profile', JSON.stringify(profile));
    notifyAuthListeners(profile);

    return profile;
  } catch (error: any) {
    console.error("Error logging in with email fallback: ", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Signout warning: ", e);
  }
  localStorage.removeItem('current_user_profile');
  notifyAuthListeners(null);
};

// 2. Fetch User Profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

// 3. Doctors & Departments Operations
export const getDoctors = async (): Promise<Doctor[]> => {
  const snapshot = await getDocs(collection(db, 'doctors'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Doctor);
};

export const addDoctor = async (doctorData: Omit<Doctor, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'doctors'), doctorData);
  return docRef.id;
};

export const updateDoctor = async (doctorId: string, doctorData: Partial<Doctor>): Promise<void> => {
  await updateDoc(doc(db, 'doctors', doctorId), doctorData);
};

export const deleteDoctor = async (doctorId: string): Promise<void> => {
  await deleteDoc(doc(db, 'doctors', doctorId));
};

export const getDepartments = async (): Promise<Department[]> => {
  const snapshot = await getDocs(collection(db, 'departments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Department);
};

// 4. Appointments Operations
export const bookAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getPatientAppointments = async (userId: string): Promise<Appointment[]> => {
  const q = query(
    collection(db, 'appointments'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Appointment);
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Appointment);
};

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status'], notes?: string): Promise<void> => {
  const updateData: any = { status };
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  await updateDoc(doc(db, 'appointments', appointmentId), updateData);
};

// 5. Medical Reports Operations
export const uploadMedicalReport = async (reportData: Omit<MedicalReport, 'id' | 'uploadedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'reports'), {
    ...reportData,
    uploadedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getPatientReports = async (userId: string): Promise<MedicalReport[]> => {
  const q = query(
    collection(db, 'reports'), 
    where('userId', '==', userId),
    orderBy('uploadedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MedicalReport);
};

export const getAllReports = async (): Promise<MedicalReport[]> => {
  const q = query(collection(db, 'reports'), orderBy('uploadedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MedicalReport);
};

export const deleteMedicalReport = async (reportId: string): Promise<void> => {
  await deleteDoc(doc(db, 'reports', reportId));
};

// 6. Database Seeder
export const seedDatabaseIfNeeded = async () => {
  try {
    const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    
    // Seed Departments if empty
    if (departmentsSnapshot.empty) {
      console.log("Seeding departments...");
      const departments: Omit<Department, 'id'>[] = [
        {
          name: 'Cardiology',
          icon: 'HeartPulse',
          description: 'Specialized diagnostic and therapeutic care for heart and vascular diseases, offering modern surgical and non-invasive methods.',
          treatments: ['Electrocardiogram (ECG)', 'Echocardiography', 'Cardiac Catheterization', 'Angioplasty & Stenting', 'Heart Failure Management'],
          bannerUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600'
        },
        {
          name: 'Pediatrics',
          icon: 'Baby',
          description: 'Comprehensive compassionate medical care for infants, children, and adolescents, covering vaccinations, growth, and developmental needs.',
          treatments: ['Newborn Assessments', 'Immunization & Vaccinations', 'Developmental Screening', 'Pediatric Allergy Care', 'Childhood Infections Treatment'],
          bannerUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=600'
        },
        {
          name: 'Orthopedics',
          icon: 'Bone',
          description: 'Expert treatment for bone, joint, ligament, tendon, and muscle issues, including sports medicine, joint replacements, and physical therapy.',
          treatments: ['Joint Replacement (Hip/Knee)', 'Arthroscopic Surgery', 'Fracture Care & Casting', 'Spine Care & Surgery', 'Sports Injury Rehabilitation'],
          bannerUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=600'
        },
        {
          name: 'Neurology',
          icon: 'Brain',
          description: 'Comprehensive evaluation and treatment of disorders affecting the central, peripheral, and autonomic nervous systems.',
          treatments: ['EEG & EMG Testing', 'Stroke Prevention & Recovery', 'Epilepsy & Seizure Care', 'Migraine & Headache Management', 'Alzheimer & Dementia Support'],
          bannerUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600'
        },
        {
          name: 'Dermatology',
          icon: 'Sparkles',
          description: 'Expert clinical care for skin, hair, and nail conditions, including medical dermatology, skin cancer screenings, and advanced cosmetic procedures.',
          treatments: ['Acne & Rosacea Treatment', 'Skin Cancer Screening', 'Psoriasis & Eczema Management', 'Mole & Cyst Removal', 'Laser Skin Resurfacing'],
          bannerUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600'
        },
        {
          name: 'Internal Medicine',
          icon: 'Stethoscope',
          description: 'Primary, preventative, and comprehensive health care for adults, focusing on chronic disease management and overall system wellness.',
          treatments: ['Annual Physicals', 'Hypertension & Diabetes Control', 'Cholesterol Management', 'Adult Vaccinations', 'Chronic Condition Coordination'],
          bannerUrl: 'https://images.unsplash.com/photo-1504813184591-015556c5c576?auto=format&fit=crop&q=80&w=600'
        }
      ];

      for (const dept of departments) {
        await addDoc(collection(db, 'departments'), dept);
      }
    }

    // Seed Doctors if empty
    if (doctorsSnapshot.empty) {
      console.log("Seeding doctors...");
      const doctors: Omit<Doctor, 'id'>[] = [
        {
          name: 'Dr. Sarah Jenkins',
          specialty: 'Senior Cardiologist',
          department: 'Cardiology',
          imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
          rating: 4.9,
          reviewsCount: 184,
          experience: '14 years',
          availability: ['Monday', 'Wednesday', 'Friday'],
          timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
          bio: 'Dr. Jenkins is a highly respected specialist in interventional cardiology with a passion for preventative medicine and clinical wellness.',
          fees: 150
        },
        {
          name: 'Dr. Marcus Vance',
          specialty: 'Pediatric Specialist',
          department: 'Pediatrics',
          imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
          rating: 4.8,
          reviewsCount: 142,
          experience: '10 years',
          availability: ['Monday', 'Tuesday', 'Thursday'],
          timeSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '01:30 PM', '02:30 PM', '03:30 PM'],
          bio: 'Dr. Vance delivers friendly, empathetic care to kids of all ages, ensuring their growth benchmarks are met with the highest clinical standards.',
          fees: 120
        },
        {
          name: 'Dr. Elena Rostova',
          specialty: 'Orthopedic Surgeon',
          department: 'Orthopedics',
          imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
          rating: 4.9,
          reviewsCount: 215,
          experience: '16 years',
          availability: ['Tuesday', 'Thursday', 'Friday'],
          timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
          bio: 'Dr. Rostova specializes in joint reconstructive surgery, sports arthroscopy, and traumatic musculoskeletal rehabilitation with a focus on patient mobility.',
          fees: 180
        },
        {
          name: 'Dr. Julian Sterling',
          specialty: 'Neurologist',
          department: 'Neurology',
          imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
          rating: 4.7,
          reviewsCount: 98,
          experience: '12 years',
          availability: ['Wednesday', 'Thursday', 'Friday'],
          timeSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'],
          bio: 'Dr. Sterling researches cognitive disorders and specializes in pain management and neurological screening for epilepsy, stroke, and migraines.',
          fees: 160
        },
        {
          name: 'Dr. Fiona Gallagher',
          specialty: 'Clinical Dermatologist',
          department: 'Dermatology',
          imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
          rating: 4.9,
          reviewsCount: 256,
          experience: '8 years',
          availability: ['Monday', 'Tuesday', 'Wednesday'],
          timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
          bio: 'Dr. Gallagher offers cutting-edge treatments for chronic skin disorders and leads advanced screenings for melanoma and aesthetic laser treatments.',
          fees: 110
        },
        {
          name: 'Dr. Robert Chen',
          specialty: 'Internal Medicine Lead',
          department: 'Internal Medicine',
          imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
          rating: 4.8,
          reviewsCount: 310,
          experience: '20 years',
          availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
          timeSlots: ['08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
          bio: 'Dr. Chen oversees the adult primary care program with two decades of experience in chronic care management, wellness counseling, and multi-system diagnostics.',
          fees: 100
        }
      ];

      for (const docVal of doctors) {
        await addDoc(collection(db, 'doctors'), docVal);
      }
    }
    
    console.log("Database seeded successfully if missing.");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
};
