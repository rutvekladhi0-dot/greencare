import React from 'react';
import { Star, Calendar, Clock, DollarSign, Award } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorCardProps {
  key?: string | number;
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps): React.JSX.Element {
  return (
    <div 
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
      id={`doctor-card-${doctor.id}`}
    >
      {/* Image Header */}
      <div className="relative h-56 bg-slate-100 overflow-hidden shrink-0">
        <img
          src={doctor.imageUrl}
          alt={doctor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5">
          <Star className="h-3.5 w-3.5 fill-white" />
          <span>{doctor.rating}</span>
          <span className="text-emerald-100 font-normal">({doctor.reviewsCount})</span>
        </div>
        <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-xs text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-md shadow-xs border border-emerald-50">
          {doctor.department}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
            {doctor.name}
          </h3>
          <p className="text-sm text-emerald-600 font-semibold mt-0.5">{doctor.specialty}</p>
          <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">{doctor.bio}</p>

          {/* Quick Metrics */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{doctor.experience} Exp</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Consultation: <strong className="text-slate-800">${doctor.fees}</strong></span>
            </div>
          </div>

          {/* Weekly Schedule Preview */}
          <div className="mt-4 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start space-x-2 text-xs">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">Days Available</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {doctor.availability.map((day, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-700 border border-emerald-100/60"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-5">
          <button
            onClick={() => onBook(doctor)}
            id={`book-doctor-${doctor.id}`}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center space-x-2 group-hover:-translate-y-0.5"
          >
            <Clock className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
