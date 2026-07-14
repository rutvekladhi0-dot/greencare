import React, { useState } from 'react';
import { Search, Filter, Stethoscope, Star } from 'lucide-react';
import { Doctor } from '../types';
import DoctorCard from './DoctorCard';

interface DoctorsListingProps {
  doctors: Doctor[];
  onBookDoctor: (doctor: Doctor) => void;
}

export default function DoctorsListing({ doctors, onBookDoctor }: DoctorsListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const departmentsList = ['All', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Dermatology', 'Internal Medicine'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || doc.department.toLowerCase() === selectedDept.toLowerCase();
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            Meet Our Specialist Clinicians
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Accredited Medical Doctors
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Connect with board-certified physicians dedicated to providing exceptional diagnostic insights, counseling, and restorative treatments.
          </p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or bio keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                id="doctors-search-input"
              />
            </div>

            {/* Department Quick Filter Pills */}
            <div className="md:col-span-7 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter:
              </span>
              {departmentsList.map((dept) => {
                const isSelected = selectedDept.toLowerCase() === dept.toLowerCase();
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-150'
                    }`}
                    id={`filter-pill-${dept}`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Doctors Grid output */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-500 shadow-xs max-w-lg mx-auto">
            <Stethoscope className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700 mt-4">No specialists found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any medical staff matching your search query. Try choosing another clinical filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onBook={onBookDoctor}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
