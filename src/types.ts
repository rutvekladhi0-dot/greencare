export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'patient' | 'admin';
  phone?: string;
  createdAt: any;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  experience: string;
  availability: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
  timeSlots: string[]; // e.g., ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  bio: string;
  fees: number;
}

export interface Appointment {
  id: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "09:00 AM"
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  complaints: string;
  notes?: string;
  createdAt: any;
}

export interface MedicalReport {
  id: string;
  userId: string;
  patientName: string;
  reportName: string;
  fileData: string; // Base64 string of the uploaded file/image
  fileType: string; // e.g., "application/pdf", "image/jpeg"
  notes: string;
  uploadedAt: any;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  description: string;
  treatments: string[];
  bannerUrl: string;
}
