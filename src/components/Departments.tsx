import { useState } from 'react';
import { HeartPulse, Baby, Bone, Brain, Sparkles, Stethoscope, Star, Clock, Calendar, Check } from 'lucide-react';
import { Department, Doctor } from '../types';

interface DepartmentsProps {
  departments: Department[];
  doctors: Doctor[];
  onBookDoctor: (doctor: Doctor) => void;
}

export default function Departments({ departments, doctors, onBookDoctor }: DepartmentsProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="h-6 w-6" />;
      case 'Baby': return <Baby className="h-6 w-6" />;
      case 'Bone': return <Bone className="h-6 w-6" />;
      case 'Brain': return <Brain className="h-6 w-6" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6" />;
      default: return <Stethoscope className="h-6 w-6" />;
    }
  };

  const activeDept = selectedDeptId 
    ? departments.find(d => d.id === selectedDeptId) || departments[0]
    : departments[0];

  const deptDoctors = doctors.filter(doc => doc.department.toLowerCase() === activeDept.name.toLowerCase());

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            Our Medical Departments
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Specialized Clinical Expertise
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            From pediatric preventative checkups to advanced interventional cardiovascular surgeries, explore our medical hubs and connect with top accredited consultants.
          </p>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Department List Selection (Sidebar Left) */}
          <div className="lg:col-span-4 bg-white border border-slate-150 rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 mb-3">Clinical Specialties</h3>
            {departments.map((dept) => {
              const isActive = activeDept.id === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${isActive ? 'text-white' : 'text-emerald-600 group-hover:scale-105'} transition-all`}>
                      {getDeptIcon(dept.icon)}
                    </div>
                    <span>{dept.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {doctors.filter(d => d.department.toLowerCase() === dept.name.toLowerCase()).length} Staff
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed View (Right Panel) */}
          <div className="lg:col-span-8 space-y-8">
            {activeDept && (
              <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden animate-slideUp">
                {/* Banner */}
                <div className="h-60 relative">
                  <img
                    src={activeDept.bannerUrl}
                    alt={activeDept.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-2.5 text-white">
                      <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-700/40">
                        {getDeptIcon(activeDept.icon)}
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-emerald-300 tracking-widest leading-none">GreenCare Wings</p>
                        <h2 className="text-2xl font-black mt-1 leading-none tracking-tight">{activeDept.name} Division</h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info & Treatments */}
                <div className="p-6 sm:p-8 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Overview & Care Philosophy</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {activeDept.description}
                    </p>
                  </div>

                  {/* Treatments list */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Focus Areas & Therapeutic Treatments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDept.treatments.map((treatment, idx) => (
                        <div key={idx} className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs text-slate-700 font-semibold">
                          <div className="bg-emerald-100 text-emerald-700 rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                          <span>{treatment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department Doctors Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-2">
                <span>{activeDept?.name} Specialist Staff</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2.5 py-1 rounded-full">
                  {deptDoctors.length} Clinicians
                </span>
              </h3>

              {deptDoctors.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl py-10 text-center text-slate-400 text-xs bg-white">
                  No specialists currently assigned to this clinical department.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {deptDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      className="bg-white border border-slate-150 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex items-start space-x-4 relative group"
                    >
                      <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-150 shrink-0"
                      />
                      <div className="space-y-2 flex-grow">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors">{doc.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{doc.specialty}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1.5 border-t border-slate-100">
                          <span>Experience: <strong>{doc.experience}</strong></span>
                          <span>Consult: <strong className="text-slate-700">${doc.fees}</strong></span>
                        </div>
                        <button
                          onClick={() => onBookDoctor(doc)}
                          className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center block"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
