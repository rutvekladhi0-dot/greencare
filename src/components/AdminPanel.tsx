import React, { useState, useEffect } from 'react';
import { Users, Calendar, ShieldAlert, Plus, Trash2, CheckCircle, Clock, XCircle, Filter, Stethoscope, Search, FileText, AlertCircle, Sparkles, MessageSquare, DollarSign, X } from 'lucide-react';
import { Doctor, Appointment, UserProfile, MedicalReport } from '../types';
import { 
  getDoctors, 
  getAllAppointments, 
  updateAppointmentStatus, 
  addDoctor, 
  deleteDoctor, 
  getDepartments,
  db 
} from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminPanel() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [allReports, setAllReports] = useState<MedicalReport[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'patients'>('appointments');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');

  // Doctor Form State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocDept, setNewDocDept] = useState('Cardiology');
  const [newDocBio, setNewDocBio] = useState('');
  const [newDocFees, setNewDocFees] = useState(100);
  const [newDocExp, setNewDocExp] = useState('5 years');
  const [newDocImg, setNewDocImg] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400');
  const [newDocAvailability, setNewDocAvailability] = useState<string[]>(['Monday', 'Wednesday']);
  const [formError, setFormError] = useState<string | null>(null);

  // Advisory Note Form State
  const [selectedApptForNote, setSelectedApptForNote] = useState<string | null>(null);
  const [apptNoteText, setApptNoteText] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch doctors & appointments
      const [docs, appts] = await Promise.all([
        getDoctors(),
        getAllAppointments()
      ]);
      setDoctors(docs);
      setAppointments(appts);

      // 2. Fetch users/patients directly from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const patientsList = usersSnapshot.docs.map(d => d.data() as UserProfile);
      setPatients(patientsList);

      // 3. Fetch all reports directly from Firestore for admin view
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const reportsList = reportsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }) as MedicalReport);
      setAllReports(reportsList);

    } catch (err) {
      console.error("Error loading admin data: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (apptId: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(apptId, status);
      setAppointments(prev => 
        prev.map(app => app.id === apptId ? { ...app, status } : app)
      );
    } catch (err) {
      console.error("Failed to update status: ", err);
      alert("Error updating status. Please try again.");
    }
  };

  const handleSaveAdvisoryNote = async (apptId: string) => {
    if (!apptNoteText.trim()) return;
    try {
      await updateAppointmentStatus(apptId, 'approved', apptNoteText);
      setAppointments(prev => 
        prev.map(app => app.id === apptId ? { ...app, notes: apptNoteText, status: 'approved' } : app)
      );
      setSelectedApptForNote(null);
      setApptNoteText('');
    } catch (err) {
      console.error("Failed to add advisory note: ", err);
      alert("Error saving note.");
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newDocName.trim() || !newDocSpecialty.trim() || !newDocBio.trim()) {
      setFormError("All fields are required.");
      return;
    }

    try {
      const docData: Omit<Doctor, 'id'> = {
        name: newDocName,
        specialty: newDocSpecialty,
        department: newDocDept,
        imageUrl: newDocImg,
        rating: 4.8,
        reviewsCount: 1,
        experience: newDocExp,
        availability: newDocAvailability,
        timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        bio: newDocBio,
        fees: Number(newDocFees)
      };

      await addDoctor(docData);
      setShowAddDoctorModal(false);
      
      // Reset form
      setNewDocName('');
      setNewDocSpecialty('');
      setNewDocBio('');
      
      // Refresh list
      const updatedDocs = await getDoctors();
      setDoctors(updatedDocs);
    } catch (err: any) {
      setFormError(err.message || "Failed to add doctor.");
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this doctor permanently?");
    if (!confirmDelete) return;

    try {
      await deleteDoctor(doctorId);
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
    } catch (err) {
      console.error("Failed to delete doctor: ", err);
      alert("Failed to remove doctor.");
    }
  };

  const toggleDaySelection = (day: string) => {
    setNewDocAvailability(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Filtering Logic
  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.patientName.toLowerCase().includes(patientSearch.toLowerCase()) || 
                          app.doctorName.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          app.department.toLowerCase().includes(patientSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doc.department.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-xl border border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-500 text-slate-900 p-3.5 rounded-2xl shadow-lg">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-amber-500/30">
                Administrative Control Panel
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">System Console</h1>
            </div>
          </div>
          <button
            onClick={loadAdminData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
          >
            Refresh Logs
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Reservations & Appointments ({appointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'doctors'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <Stethoscope className="h-4.5 w-4.5" />
            <span>Specialist Staff ({doctors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'patients'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Patient Registry ({patients.length})</span>
          </button>
        </div>

        {/* Console loading state */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-slate-500 font-semibold text-sm">Querying live cloud infrastructure...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            
            {/* 1. Appointments Controller */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search patient or doctor..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="all">All Booking States</option>
                      <option value="pending">Pending Approval</option>
                      <option value="approved">Approved & Scheduled</option>
                      <option value="completed">Completed Visits</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 text-xs bg-slate-50/50">
                    No matching medical reservations found
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-150 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                        <tr>
                          <th className="px-5 py-3.5">Patient Details</th>
                          <th className="px-5 py-3.5">Assigned Clinician</th>
                          <th className="px-5 py-3.5">Schedule Slot</th>
                          <th className="px-5 py-3.5">Chief Complaint</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Console Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredAppointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/35">
                            <td className="px-5 py-4">
                              <p className="font-extrabold text-slate-800">{appt.patientName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{appt.patientEmail}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{appt.patientPhone}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-800">{appt.doctorName}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold">{appt.specialty}</p>
                              <p className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded w-fit mt-1 uppercase font-bold">
                                {appt.department}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-800">{appt.date}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{appt.time}</p>
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <p className="line-clamp-2 italic text-slate-500">"{appt.complaints}"</p>
                              {appt.notes && (
                                <p className="text-[9px] text-amber-700 font-bold mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit">
                                  Advised: "{appt.notes}"
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {appt.status === 'pending' && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping"></span>
                                  <span>Pending</span>
                                </span>
                              )}
                              {appt.status === 'approved' && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                                  <span>Approved</span>
                                </span>
                              )}
                              {appt.status === 'completed' && (
                                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <span>Completed</span>
                                </span>
                              )}
                              {appt.status === 'cancelled' && (
                                <span className="bg-rose-50 text-rose-700 border border-rose-150 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <span>Cancelled</span>
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex flex-wrap gap-1.5 justify-end">
                                {appt.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(appt.id, 'approved')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-2.5 rounded cursor-pointer text-[10px]"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedApptForNote(appt.id);
                                        setApptNoteText('');
                                      }}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold p-1 px-2.5 rounded cursor-pointer text-[10px] flex items-center gap-0.5"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      Advise
                                    </button>
                                  </>
                                )}
                                {appt.status === 'approved' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-1 px-2 rounded cursor-pointer text-[10px]"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                                {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold p-1 px-2 rounded cursor-pointer text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>

                              {/* Advisory Note Inline Dialog */}
                              {selectedApptForNote === appt.id && (
                                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2 max-w-xs ml-auto">
                                  <label className="block text-[10px] font-extrabold text-slate-700">Add Advisory Instructions:</label>
                                  <input
                                    type="text"
                                    placeholder="E.g., Please bring your blood test result and do not eat 8 hrs prior."
                                    value={apptNoteText}
                                    onChange={(e) => setApptNoteText(e.target.value)}
                                    className="w-full border border-slate-200 rounded p-1.5 text-[10px] bg-white focus:outline-none"
                                  />
                                  <div className="flex gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedApptForNote(null)}
                                      className="text-[9px] text-slate-500 bg-slate-200 px-2 py-1 rounded cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveAdvisoryNote(appt.id)}
                                      className="text-[9px] text-white bg-emerald-600 px-2 py-1 rounded cursor-pointer font-bold"
                                    >
                                      Approve & Send Note
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. Doctors Staff Panel */}
            {activeTab === 'doctors' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search doctor or specialty..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddDoctorModal(true)}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Onboard New Specialist</span>
                  </button>
                </div>

                {filteredDoctors.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 text-xs">
                    No medical specialists match your search criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-slate-150 rounded-2xl p-4 bg-white hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={doc.imageUrl}
                            alt={doc.name}
                            className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                              {doc.department}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800 mt-1">{doc.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Consultation fee: ${doc.fees}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400">Experience: <strong>{doc.experience}</strong></span>
                          <button
                            onClick={() => handleDeleteDoctor(doc.id)}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Remove Doctor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Patients Library / Reports Registry */}
            {activeTab === 'patients' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Registered Patients Catalog</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Clinical logs and uploaded patient reports database tracking</p>
                </div>

                {patients.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 text-xs">
                    No patients have registered yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {patients.map((pat) => {
                      const patientReports = allReports.filter(r => r.userId === pat.uid);
                      const patientAppts = appointments.filter(a => a.userId === pat.uid);
                      
                      return (
                        <div
                          key={pat.uid}
                          className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={pat.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${pat.uid}`}
                              alt={pat.displayName || 'Patient'}
                              className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                            />
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{pat.displayName}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{pat.email}</p>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize font-bold">
                                {pat.role}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px]">
                            <div>
                              <p className="font-bold text-slate-500">Reservations</p>
                              <p className="text-sm font-black text-slate-800 mt-0.5">{patientAppts.length}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-500">Uploaded Reports</p>
                              <p className="text-sm font-black text-slate-800 mt-0.5">{patientReports.length}</p>
                            </div>
                          </div>

                          {/* Patient reports preview tracker */}
                          {patientReports.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Uploaded Documents Tracker:</p>
                              <div className="space-y-1">
                                {patientReports.map(rep => (
                                  <div key={rep.id} className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100/50 p-2 rounded text-[11px] text-emerald-800">
                                    <span className="font-semibold truncate max-w-[180px]">{rep.reportName}</span>
                                    <a
                                      href={rep.fileData}
                                      download={rep.reportName}
                                      className="text-emerald-700 underline font-extrabold text-[10px] cursor-pointer"
                                    >
                                      Download
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Add Doctor Modal Dialog */}
        {showAddDoctorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col animate-slideUp">
              <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-base">Onboard Specialty Staff</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Register new clinician to the hospital database</p>
                </div>
                <button
                  onClick={() => setShowAddDoctorModal(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <form onSubmit={handleAddDoctor} className="space-y-4">
                  {formError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-start space-x-1.5 text-xs">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alexander Fleming"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Clinician Department
                      </label>
                      <select
                        value={newDocDept}
                        onChange={(e) => setNewDocDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Specialty Designation
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Pediatric Allergy Specialist"
                        value={newDocSpecialty}
                        onChange={(e) => setNewDocSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Consultation Fees ($)
                      </label>
                      <input
                        type="number"
                        required
                        min={20}
                        max={500}
                        value={newDocFees}
                        onChange={(e) => setNewDocFees(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Total Experience
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12 years"
                        value={newDocExp}
                        onChange={(e) => setNewDocExp(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Doctor Photo URL
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocImg}
                      onChange={(e) => setNewDocImg(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Weekly Active Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                        const isSelected = newDocAvailability.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => toggleDaySelection(day)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      required
                      placeholder="Enter details about training, academic fellowships, and medical approach..."
                      value={newDocBio}
                      onChange={(e) => setNewDocBio(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save & Complete Onboarding
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
