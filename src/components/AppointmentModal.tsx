import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Clipboard, CheckCircle, AlertCircle } from 'lucide-react';
import { Doctor, Appointment, UserProfile } from '../types';
import { bookAppointment, getDoctors } from '../lib/firebase';

interface AppointmentModalProps {
  doctor: Doctor | null;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export default function AppointmentModal({ doctor: initialDoctor, user, onClose, onSuccess, onOpenAuth }: AppointmentModalProps) {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(initialDoctor);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [complaints, setComplaints] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedStatus, setBookedStatus] = useState(false);
  const [dayWarning, setDayWarning] = useState<string | null>(null);

  // Fetch all doctors to allow selecting other doctors if initial doctor is null
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDoctors();
        setDoctorsList(docs);
        if (!selectedDoctor && docs.length > 0) {
          setSelectedDoctor(docs[0]);
        }
      } catch (err) {
        console.error("Failed to load doctors: ", err);
      }
    };
    fetchDocs();
  }, []);

  // Update user prefilled details when user changes
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Check if selected date corresponds to doctor's available days
  useEffect(() => {
    if (!date || !selectedDoctor) {
      setDayWarning(null);
      return;
    }

    const selectedDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[selectedDate.getUTCDay()];

    const isAvailable = selectedDoctor.availability.some(
      day => day.toLowerCase() === selectedDayName.toLowerCase()
    );

    if (!isAvailable) {
      setDayWarning(
        `Note: ${selectedDoctor.name} is usually available on: ${selectedDoctor.availability.join(', ')}. You can still request this slot, but approval may take longer.`
      );
    } else {
      setDayWarning(null);
    }
  }, [date, selectedDoctor]);

  const handleDoctorChange = (docId: string) => {
    const doc = doctorsList.find(d => d.id === docId);
    if (doc) {
      setSelectedDoctor(doc);
      setTime(''); // Reset selected time slot
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!time) {
      setError("Please select a time slot.");
      return;
    }

    setLoading(true);

    try {
      const apptData: Omit<Appointment, 'id' | 'createdAt'> = {
        userId: user.uid,
        patientName: name,
        patientEmail: email,
        patientPhone: phone,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        department: selectedDoctor.department,
        date: date,
        time: time,
        status: 'pending',
        complaints: complaints
      };

      await bookAppointment(apptData);
      setBookedStatus(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to book your appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-slideUp"
        id="booking-modal-card"
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Schedule Consultation</h2>
            <p className="text-emerald-100 text-xs mt-0.5 font-medium">Fully connected direct reservation system</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700/50 text-white transition-colors cursor-pointer"
            id="close-booking-modal-btn"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {bookedStatus ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full">
                <CheckCircle className="h-14 w-14" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Booking Requested!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Your appointment with <strong className="text-emerald-600 font-bold">{selectedDoctor?.name}</strong> is submitted. You can monitor its approval status under your Patient Dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-5">
              
              {!user && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start space-x-3 text-xs">
                  <AlertCircle className="h-5.5 w-5.5 shrink-0 text-amber-600" />
                  <div className="space-y-1">
                    <p className="font-bold">Authentication Required</p>
                    <p>You must be signed in to submit an appointment. Click below to quickly log in or register.</p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="mt-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Doctor Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Consulting Doctor
                  </label>
                  <select
                    disabled={!!initialDoctor || doctorsList.length === 0}
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 py-3 px-3.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-80"
                    id="booking-select-doctor"
                  >
                    {doctorsList.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedDoctor?.department || 'Select a doctor'}
                    className="w-full bg-slate-100 border border-slate-200 py-3 px-3.5 rounded-xl text-sm font-medium text-slate-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select Appointment Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Calendar className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                    id="booking-input-date"
                  />
                </div>
                {dayWarning && (
                  <p className="mt-2 text-xs text-amber-600 flex items-start space-x-1 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{dayWarning}</span>
                  </p>
                )}
              </div>

              {/* Time Slots Selector */}
              {selectedDoctor && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    Select Available Time Slot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedDoctor.timeSlots.map((slot) => {
                      const isSelected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          className={`py-2.5 px-3 border-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                              : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Patient Information */}
              <div className="border-t border-slate-150 pt-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Patient Demographics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Patient Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Patient Full Name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        id="booking-input-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        id="booking-input-phone"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Chief Complaint / Symptoms
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-3.5 flex items-start text-slate-400 pointer-events-none">
                      <Clipboard className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      required
                      value={complaints}
                      onChange={(e) => setComplaints(e.target.value)}
                      placeholder="Please describe your symptoms or reason for consulting. E.g. Chronic chest tightness, annual wellness check, dermatological screening, etc."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                      id="booking-input-complaints"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Trigger */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !user}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-4 rounded-xl text-sm font-extrabold shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  id="booking-submit-btn"
                >
                  <Calendar className="h-4.5 w-4.5" />
                  <span>{loading ? 'Submitting Reservation...' : 'Confirm Appointment Reservation'}</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
