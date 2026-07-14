import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, seedDatabaseIfNeeded, getDoctors, getDepartments, getUserProfile, logoutUser } from './lib/firebase';
import { UserProfile, Doctor, Department } from './types';

// Component Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AppointmentModal from './components/AppointmentModal';
import ReportUploadModal from './components/ReportUploadModal';
import Home from './components/Home';
import Departments from './components/Departments';
import DoctorsListing from './components/DoctorsListing';
import PatientDashboard from './components/PatientDashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal controls
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showReportUploadModal, setShowReportUploadModal] = useState<boolean>(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  useEffect(() => {
    // 1. Initial Seeder & Data load
    const initializeApp = async () => {
      try {
        await seedDatabaseIfNeeded();
        const [docs, depts] = await Promise.all([getDoctors(), getDepartments()]);
        setDoctors(docs);
        setDepartments(depts);
      } catch (err) {
        console.error("Failed during initial database sync: ", err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // 2. Auth State listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch (err) {
          console.error("Failed to load user profile: ", err);
        }
      } else {
        setUser(null);
        // Reset tab if user logged out and was on dashboard/admin
        if (activeTab === 'dashboard' || activeTab === 'admin') {
          setActiveTab('home');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setActiveTab('home');
    } catch (err) {
      console.error("Failed to log out: ", err);
    }
  };

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    setShowBookingModal(true);
  };

  const handleOpenBookingTabOrModal = () => {
    setSelectedDoctorForBooking(null);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // Force switch to dashboard so patient can see their requested appointment
    setActiveTab('dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar header */}
      <Navbar
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main viewport */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] text-slate-500 font-sans">
            <div className="text-center space-y-4">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]" />
              <p className="font-extrabold text-sm text-slate-700">Connecting to GreenCare Secure Node...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <Home
                departments={departments}
                onOpenBooking={handleOpenBookingTabOrModal}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'departments' && (
              <Departments
                departments={departments}
                doctors={doctors}
                onBookDoctor={handleBookDoctor}
              />
            )}

            {activeTab === 'doctors' && (
              <DoctorsListing
                doctors={doctors}
                onBookDoctor={handleBookDoctor}
              />
            )}

            {activeTab === 'dashboard' && user && (
              <PatientDashboard
                user={user}
                onOpenBooking={handleOpenBookingTabOrModal}
                onOpenReportUpload={() => setShowReportUploadModal(true)}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            )}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <AdminPanel />
            )}
          </>
        )}
      </main>

      {/* Footer footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Modals Overlay layer */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setShowAuthModal(false);
          }}
        />
      )}

      {showBookingModal && (
        <AppointmentModal
          doctor={selectedDoctorForBooking}
          user={user}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
          onOpenAuth={() => {
            setShowBookingModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {showReportUploadModal && user && (
        <ReportUploadModal
          user={user}
          onClose={() => setShowReportUploadModal(false)}
          onSuccess={() => {
            setShowReportUploadModal(false);
            // Dashboard report tab will sync automatically
          }}
        />
      )}
    </div>
  );
}
