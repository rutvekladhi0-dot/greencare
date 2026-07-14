import { HeartPulse, Shield, Activity, PhoneCall, Stethoscope, Star, Clock, Calendar, Users, Briefcase } from 'lucide-react';
import { Department } from '../types';

interface HomeProps {
  departments: Department[];
  onOpenBooking: () => void;
  setActiveTab: (tab: string) => void;
}

export default function Home({ departments, onOpenBooking, setActiveTab }: HomeProps) {
  const stats = [
    { value: '99%', label: 'Patient Satisfaction', icon: Shield },
    { value: '50+', label: 'Expert Specialists', icon: Stethoscope },
    { value: '24/7', label: 'Emergency Service', icon: HeartPulse },
    { value: '150k+', label: 'Happy Recoveries', icon: Activity },
  ];

  const testimonials = [
    {
      name: 'Michael Thompson',
      role: 'Heart Bypass Patient',
      rating: 5,
      text: 'The cardiology team at GreenCare was exceptional. Their attentiveness, state-of-the-art facilities, and compassionate post-op care gave me a second chance at life.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Sarah Goldstein',
      role: 'Parent of Pediatric Patient',
      rating: 5,
      text: 'Dr. Vance has an incredible way with kids. My daughter actually looks forward to her checkups! The pediatric wing is welcoming, stress-free, and incredibly clean.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'David Chen',
      role: 'Orthopedic Patient',
      rating: 5,
      text: 'Following my knee reconstruction, GreenCare provided complete support—from surgery to outpatient physical therapy. I am back to running marathon trials in under six months!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    }
  ];

  return (
    <div className="font-sans text-slate-650 bg-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-emerald-100/80 uppercase tracking-wide">
                <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Excellence in Clinical Health & Compassion</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-[1.1]">
                Your Health, Our <span className="text-emerald-600">Greatest Promise</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Welcome to GreenCare Hospital. Experience exceptional, evidence-based outpatient consultations, advanced diagnostic tools, and supportive medical directories fully integrated for patient care.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button
                  onClick={onOpenBooking}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 px-8 rounded-xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all cursor-pointer hover:-translate-y-0.5"
                  id="hero-book-btn"
                >
                  Schedule Your Appointment
                </button>
                <button
                  onClick={() => setActiveTab('departments')}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm py-4 px-8 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs"
                >
                  Explore Medical Services
                </button>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-150">
                {stats.map((stat, idx) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={idx} className="text-center lg:text-left space-y-1">
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-600">
                        <IconComp className="h-5 w-5 shrink-0" />
                        <span className="text-xl sm:text-2xl font-black text-slate-800">{stat.value}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Right Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
                  alt="Modern Hospital Environment"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Emergency callout */}
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-5 rounded-2xl shadow-xl border-2 border-white flex items-center space-x-3.5 max-w-xs">
                <div className="bg-emerald-700 p-2.5 rounded-lg text-emerald-100">
                  <PhoneCall className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-200">24/7 ER Hotline</p>
                  <p className="font-black text-sm tracking-tight">+1 (555) 473-3622</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Medical Care Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              Why Choose GreenCare Hospital
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              Clinical Excellence Designed Around You
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
              We leverage modern technology, world-class medical staff, and an empathetic care methodology to provide high-efficacy health solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-150 p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:border-emerald-200">
              <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl w-fit">
                <Stethoscope className="h-6.5 w-6.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">World-Class Specialists</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our clinical faculty features board-certified physicians, academic lecturers, and award-winning practitioners across all primary specialties.
              </p>
            </div>

            <div className="bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-150 p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:border-emerald-200">
              <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl w-fit">
                <Clock className="h-6.5 w-6.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Rapid Outpatient Scheduling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skip long lobby times. Use our direct real-time appointment scheduler to book virtual or physical consultations with instantaneous booking tracking.
              </p>
            </div>

            <div className="bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-150 p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:border-emerald-200">
              <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl w-fit">
                <Shield className="h-6.5 w-6.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Durable Patient Records</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log in to store and preview your diagnostic results, lab sheets, or prescriptions securely inside our encrypted patient registry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Departments Quick Browse */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-3 max-w-xl">
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">
                Explore Clinical Wings
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                Specialized Diagnostic & Therapeutic Care
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('departments')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-100 cursor-pointer shrink-0"
            >
              Browse All Departments
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.slice(0, 3).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-slate-100">
                    <img
                      src={dept.bannerUrl}
                      alt={dept.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <span className="absolute bottom-3 left-4 text-white font-black text-lg tracking-tight">
                      {dept.name}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setActiveTab('departments')}
                    className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-emerald-100"
                  >
                    View Treatments & Doctors
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">
              Patient Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              Reassurance from Our Restored Families
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{test.text}"
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-slate-150">
                  <img
                    src={test.image}
                    alt={test.name}
                    className="h-10 w-10 rounded-full object-cover border border-emerald-300"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{test.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
