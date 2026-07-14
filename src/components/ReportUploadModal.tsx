import React, { useState, useRef } from 'react';
import { X, Upload, FileText, FileImage, Clipboard, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { uploadMedicalReport } from '../lib/firebase';
import { UserProfile } from '../types';

interface ReportUploadModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportUploadModal({ user, onClose, onSuccess }: ReportUploadModalProps) {
  const [reportName, setReportName] = useState('');
  const [notes, setNotes] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded file to base64
  const processFile = (file: File) => {
    setError(null);

    // Limit file size to 2MB to keep base64 strings reasonable in Firestore
    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit. Please upload a smaller image or PDF document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileData(reader.result);
        setFileType(file.type);
        setFileName(file.name);
      } else {
        setError("Failed to read the file correctly. Try another format.");
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reportName.trim()) {
      setError("Please enter a descriptive report name.");
      return;
    }

    if (!fileData) {
      setError("Please select or drag-and-drop a medical report file.");
      return;
    }

    setLoading(true);

    try {
      await uploadMedicalReport({
        userId: user.uid,
        patientName: user.displayName || 'Patient',
        reportName: reportName,
        fileData: fileData,
        fileType: fileType,
        notes: notes
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to persist report in database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col animate-slideUp"
        id="report-upload-card"
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Upload Medical Report</h2>
            <p className="text-emerald-100 text-xs mt-0.5 font-medium">Direct cloud persistence for medical documents</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700/50 text-white transition-colors cursor-pointer"
            id="close-report-modal-btn"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
          {success ? (
            <div className="py-10 text-center space-y-4">
              <div className="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full">
                <CheckCircle className="h-14 w-14 animate-scaleUp" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Report Saved!</h3>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Your medical report <strong className="text-emerald-600 font-bold">{reportName}</strong> has been saved securely to your cloud profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="E.g., Complete Blood Count (CBC) July 2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                  id="report-input-name"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Upload Document or Lab Results
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3.5 ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : fileData
                      ? 'border-emerald-500/60 bg-slate-50'
                      : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
                  }`}
                  id="report-dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />

                  {fileData ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                        {fileType.includes('pdf') ? (
                          <FileText className="h-8 w-8" />
                        ) : (
                          <FileImage className="h-8 w-8" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-emerald-700 truncate max-w-[280px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Click or drag to replace file (Max 2MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-slate-100 text-slate-500 p-3 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Upload className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Drag & Drop or <span className="text-emerald-600 font-bold underline">Browse files</span>
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Supports PDF, PNG, JPG (Max 2MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Textarea for Report Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Private Notes / Summary
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3.5 flex items-start text-slate-400 pointer-events-none">
                    <Clipboard className="h-4.5 w-4.5" />
                  </span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Dr. Jenkins recommended repeating this test if cholesterol readings remain over 200 mg/dL. Strict diet plan for 3 weeks."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    id="report-input-notes"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl text-sm font-extrabold shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  id="report-submit-btn"
                >
                  <Upload className="h-4.5 w-4.5" />
                  <span>{loading ? 'Uploading & Securing...' : 'Securely Persist Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
