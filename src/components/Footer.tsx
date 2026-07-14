import { Stethoscope, Mail, Phone, MapPin, Clock, Heart } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-emerald-600 text-white p-2 rounded-lg">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                GreenCare
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              GreenCare Hospital is dedicated to providing compassionate, state-of-the-art medical services. We combine top clinical experts with healing environments to protect and support your health.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium bg-emerald-950/50 p-2 rounded border border-emerald-900/50 w-fit">
              <Clock className="h-4 w-4" />
              <span>ER & Trauma Center open 24/7</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Navigate
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('departments')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Our Medical Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Meet Our Specialist Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Patient Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>100 Medical Plaza Way, Suite 400, San Francisco, CA 94102</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>+1 (555) 473-3622</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>support@greencarehospital.org</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Outpatient Hours
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Monday - Friday:</span>
                <span className="text-white font-medium">8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Saturday:</span>
                <span className="text-white font-medium">9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Sunday:</span>
                <span className="text-white font-medium">10:00 AM - 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Emergency Care:</span>
                <span className="text-emerald-400 font-bold">24 Hours / 7 Days</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© 2026 GreenCare Hospital and Medical Group. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-4 sm:mt-0">
            <span>Delivered with care for healthy communities</span>
            <Heart className="h-3 w-3 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
