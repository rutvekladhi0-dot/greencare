import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Plus, LogIn, Clock, ShieldAlert, CheckCircle, Trash2, Eye, Download, AlertCircle, Phone, Sparkles, X } from 'lucide-react';
import { Appointment, MedicalReport, UserProfile } from '../types';
import { getPatientAppointments, getPatientReports, updateAppointmentStatus, deleteMedicalReport } from '../lib/firebase';

interface PatientDashboardProps {
  user: UserProfile;
  onOpenBooking: () => void;
  onOpenReportUpload: () => void;
  onOpenAuth: () => void;
}

export default function PatientDashboard({ user, onOpenBooking, onOpenReportUpload, onOpenAuth }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'reports'>('appointments');
  const [selectedReportForView, setSelectedReportForView] = useState<MedicalReport | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appts, rpts] = await Promise.all([
        getPatientAppointments(user.uid),
        getPatientReports(user.uid)
      ]);
      setAppointments(appts);
      setReports(rpts);
    } catch (err) {
      console.error("Error loading dashboard data: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCancelAppointment = async (apptId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment consultation?");
    if (!confirmCancel) return;

    try {
      await updateAppointmentStatus(apptId, 'cancelled');
      // Refresh local list
      setAppointments(prev => 
        prev.map(app => app.id === apptId ? { ...app, status: 'cancelled' } : app)
      );
    } catch (err) {
      console.error("Failed to cancel appointment: ", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this medical report permanently from the cloud database?");
    if (!confirmDelete) return;

    try {
      await deleteMedicalReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Failed to delete report: ", err);
      alert("Failed to delete medical report. Please try again.");
    }
  };

  // Get status badge colors
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1 w-fit">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Awaiting Approval</span>
          </span>
        );
      case 'approved':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Approved & Scheduled</span>
          </span>
        );
      case 'completed':
        return (
          <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1 w-fit">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1 w-fit">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const upcomingConsultations = appointments.filter(app => app.status === 'approved' || app.status === 'pending');
  const pastConsultations = appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Profile Card / Header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
              alt={user.displayName || 'Profile'}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-emerald-500 bg-emerald-50 object-cover"
            />
            <div className="text-center sm:text-left">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-full border border-emerald-100">
                Patient Portal Active
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2 leading-none">
                {user.displayName}
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenBooking}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={onOpenReportUpload}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Upload Report</span>
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center space-x-4 shadow-xs">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl">
              <Calendar className="h-6.5 w-6.5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Appointments</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{appointments.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center space-x-4 shadow-xs">
            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl">
              <Clock className="h-6.5 w-6.5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Upcoming Visits</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{upcomingConsultations.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center space-x-4 shadow-xs">
            <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl">
              <FileText className="h-6.5 w-6.5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stored Reports</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{reports.length}</p>
            </div>
          </div>
        </div>

        {/* Secondary Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveSubTab('appointments')}
              className={`flex-1 sm:flex-none py-4 px-8 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'appointments'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Consultations & Bookings
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`flex-1 sm:flex-none py-4 px-8 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'reports'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Medical Reports Library
            </button>
          </div>

          {/* Tab contents */}
          <div className="p-6">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 font-semibold text-sm">Syncing with Cloud Firestore...</p>
              </div>
            ) : activeSubTab === 'appointments' ? (
              <div className="space-y-8">
                
                {/* Upcoming */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-4 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Active Consultations ({upcomingConsultations.length})</span>
                  </h3>
                  
                  {upcomingConsultations.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 bg-slate-50/50">
                      <Calendar className="h-10 w-10 mx-auto text-slate-350" />
                      <p className="text-sm font-semibold mt-3">No active appointments scheduled</p>
                      <button
                        onClick={onOpenBooking}
                        className="mt-3.5 inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Schedule Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingConsultations.map((appt) => (
                        <div 
                          key={appt.id}
                          className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all relative"
                        >
                          <div className="absolute top-5 right-5">
                            {getStatusBadge(appt.status)}
                          </div>

                          <div className="space-y-3 pr-24">
                            <div>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                {appt.department}
                              </span>
                              <h4 className="text-lg font-black text-slate-800 mt-1 leading-tight">{appt.doctorName}</h4>
                              <p className="text-xs text-emerald-600 font-bold">{appt.specialty}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                              <div>
                                <p className="font-semibold text-slate-400">Date Requested</p>
                                <p className="font-bold text-slate-800 mt-0.5">{appt.date}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-400">Time Selected</p>
                                <p className="font-bold text-slate-800 mt-0.5">{appt.time}</p>
                              </div>
                            </div>

                            <div className="text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="font-bold text-slate-700">Chief Complaint:</p>
                              <p className="text-slate-600 mt-0.5 italic">"{appt.complaints}"</p>
                            </div>

                            {appt.notes && (
                              <div className="text-xs bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-amber-900">
                                <p className="font-bold flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                                  Doctor's Advisory Note:
                                </p>
                                <p className="mt-0.5 italic">"{appt.notes}"</p>
                              </div>
                            )}
                          </div>

                          {appt.status !== 'cancelled' && (
                            <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-end">
                              <button
                                onClick={() => handleCancelAppointment(appt.id)}
                                className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-150 transition-all cursor-pointer"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-4 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    <span>Historical Consultations ({pastConsultations.length})</span>
                  </h3>
                  
                  {pastConsultations.length === 0 ? (
                    <div className="border border-dashed border-slate-150 rounded-2xl py-6 text-center text-slate-400 text-xs bg-slate-50/25">
                      No historical consultations found
                    </div>
                  ) : (
                    <div className="overflow-hidden border border-slate-150 rounded-xl bg-white">
                      <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                          <tr>
                            <th className="px-5 py-3">Doctor</th>
                            <th className="px-5 py-3">Department</th>
                            <th className="px-5 py-3">Date / Time</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {pastConsultations.map((appt) => (
                            <tr key={appt.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5">
                                <p className="font-bold text-slate-800">{appt.doctorName}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold">{appt.specialty}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">
                                  {appt.department}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="font-bold text-slate-800">{appt.date}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{appt.time}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                {getStatusBadge(appt.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Your Medical Records Folder</h3>
                  <button
                    onClick={onOpenReportUpload}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload New Report</span>
                  </button>
                </div>

                {reports.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 bg-slate-50/50">
                    <FileText className="h-10 w-10 mx-auto text-slate-350" />
                    <p className="text-sm font-semibold mt-3">No medical reports uploaded yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Persist your blood work, vaccination files, or diagnostics in the cloud folder.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white border border-slate-150 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl w-fit">
                            <FileText className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-800 leading-tight truncate">
                              {report.reportName}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                              Uploaded: {report.uploadedAt?.toDate ? report.uploadedAt.toDate().toLocaleDateString() : 'Just now'}
                            </p>
                          </div>
                          
                          {report.notes && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 leading-relaxed italic">
                              "{report.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedReportForView(report)}
                            className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-emerald-100 transition-all cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View File</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-xs font-bold text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Base64 Report Lightbox Viewer */}
        {selectedReportForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-slideUp">
              <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-base">{selectedReportForView.reportName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Secure Document Viewer</p>
                </div>
                <button
                  onClick={() => setSelectedReportForView(null)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center bg-slate-100">
                {selectedReportForView.fileType.includes('pdf') ? (
                  <div className="text-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm max-w-sm">
                    <FileText className="h-16 w-16 mx-auto text-emerald-600 mb-3" />
                    <h4 className="font-bold text-slate-800">PDF Report Document</h4>
                    <p className="text-xs text-slate-500 mt-1.5 mb-5 leading-relaxed">
                      PDF files are stored as base64 database objects. Click below to securely download and open the document.
                    </p>
                    <a
                      href={selectedReportForView.fileData}
                      download={selectedReportForView.reportName}
                      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 max-w-full">
                    <img
                      src={selectedReportForView.fileData}
                      alt={selectedReportForView.reportName}
                      className="max-h-[55vh] object-contain rounded-lg mx-auto"
                    />
                    <div className="mt-3 flex justify-between items-center text-xs text-slate-500 px-1">
                      <span>Image Preview</span>
                      <a
                        href={selectedReportForView.fileData}
                        download={selectedReportForView.reportName}
                        className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Image
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
