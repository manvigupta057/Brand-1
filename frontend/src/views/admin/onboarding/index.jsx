import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, 
  Building, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Zap,
  Flag, 
  Flame, 
  Briefcase,
  Layers,
  Globe,
  Database,
  Clock,
  Layout,
  Save as SaveIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    brandName: "",
    industry: "",
    tagline: "",
    audience: "",
    competitor: "",
    goal: ""
  });

  const steps = [
    { title: "Profile", subtitle: "Tell us who you are.", icon: <User size={18} /> },
    { title: "Brand Identity", subtitle: "What's your business called?", icon: <Building size={18} /> },
    { title: "Strategic Context", subtitle: "Who are your rivals?", icon: <Target size={18} /> },
    { title: "Goals & Review", subtitle: "Confirm and finish.", icon: <Flag size={18} /> },
  ];

  // Auto-restore draft
  useEffect(() => {
    const saved = localStorage.getItem("brand_onboarding_draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem("brand_onboarding_draft", JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const saveOnboarding = () => {
    localStorage.setItem("brand_onboarding_draft", JSON.stringify(formData));
    alert("Draft saved to local storage!");
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:8000/api/onboarding", formData);
      localStorage.removeItem("brand_onboarding_draft");
      alert("Onboarding complete! Redirecting to Chat...");
      navigate("/chat");
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Failed to save onboarding data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between onboarding-glass p-6 px-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Layers className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Client Onboarding</h1>
              <p className="text-xs text-slate-500 font-medium">Strategic Brand Analyst Terminal v1.0</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-l border-white/10 pl-8">
             <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span>Persistence Active</span>
             </div>
             <div className="flex items-center gap-2">
                <Database size={14} className="text-blue-500" />
                <span>SQLite Secured</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          
          {/* Step Navigation Rail */}
          <aside className="onboarding-glass p-6 space-y-8 h-fit">
            <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4">
               <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
               STEPS
            </div>
            <nav className="space-y-4">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  disabled={idx > step}
                  onClick={() => setStep(idx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                    step === idx 
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                      : idx < step 
                        ? 'border-green-500/20 opacity-70' 
                        : 'border-white/5 opacity-40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    step === idx ? 'bg-blue-600' : idx < step ? 'bg-green-600' : 'bg-slate-800'
                  }`}>
                    {idx < step ? <CheckCircle size={16} /> : idx + 1}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${step === idx ? 'text-white' : 'text-slate-400'}`}>{s.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{s.subtitle}</p>
                  </div>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Form Panel */}
          <section className="onboarding-glass overflow-hidden flex flex-col min-h-[500px]">
             
             {/* Panel Header */}
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                     <span className="animate-pulse">●</span> STEP {step + 1} / 4
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
                    <p className="text-sm text-slate-500 font-medium">{steps[step].subtitle}</p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Progress</p>
                  <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div className="bg-blue-600 h-full transition-all duration-700" style={{width: `${(step + 1) * 25}%`}}></div>
                  </div>
                </div>
             </div>

             {/* Form Content */}
             <div className="p-8 flex-1">
                {step === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            className="onboarding-input with-icon w-full" 
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Work Email</label>
                       <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="email" 
                            className="onboarding-input with-icon w-full" 
                            placeholder="ash@brandanalyst.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Primary Role</label>
                       <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <select 
                            className="onboarding-input with-icon w-full appearance-none"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                          >
                            <option value="">Select Role</option>
                            <option value="founder">Founder / CEO</option>
                            <option value="manager">Marketing Manager</option>
                            <option value="analyst">Data Analyst</option>
                            <option value="other">Other</option>
                          </select>
                       </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Brand Name</label>
                       <div className="relative group">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            className="onboarding-input with-icon w-full" 
                            placeholder="e.g. ZenFoods"
                            value={formData.brandName}
                            onChange={e => setFormData({...formData, brandName: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Industry</label>
                       <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <select 
                            className="onboarding-input with-icon w-full appearance-none"
                            value={formData.industry}
                            onChange={e => setFormData({...formData, industry: e.target.value})}
                          >
                           <option value="">Select Industry</option>
                           <option value="saas">SaaS / Tech</option>
                           <option value="retail">Retail / E-commerce</option>
                           <option value="fintech">Fintech</option>
                           <option value="healthcare">Healthcare</option>
                           <option value="other">Other</option>
                          </select>
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Brand Tagline / Mission</label>
                       <div className="relative group">
                          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            className="onboarding-input with-icon w-full" 
                            placeholder="The simplest way to automate your brand analysis."
                            value={formData.tagline}
                            onChange={e => setFormData({...formData, tagline: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Target Audience</label>
                       <div className="relative group">
                          <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            className="onboarding-input with-icon w-full" 
                            placeholder="e.g. Gen Z Entrepreneurs"
                            value={formData.audience}
                            onChange={e => setFormData({...formData, audience: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Main Competitor</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            className="onboarding-input with-icon w-full" 
                            placeholder="e.g. CompetitorX"
                            value={formData.competitor}
                            onChange={e => setFormData({...formData, competitor: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Strategic Goal</label>
                       <div className="relative group">
                          <Target className="absolute left-4 top-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <textarea 
                            rows={4}
                            className="onboarding-input with-icon w-full resize-none" 
                            placeholder="e.g. Increase market share by 15% in the next 12 months using AI-driven insights."
                            value={formData.goals}
                            onChange={e => setFormData({...formData, goals: e.target.value})}
                          ></textarea>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Profile</p>
                          <p className="text-sm font-bold truncate">{formData.fullName || '---'}</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Brand</p>
                          <p className="text-sm font-bold truncate">{formData.brandName || '---'}</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Industry</p>
                          <p className="text-sm font-bold truncate uppercase">{formData.industry || '---'}</p>
                       </div>
                    </div>
                  </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-8 border-t border-white/5 bg-black/20 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ArrowLeft size={18} /> Back
                </button>

                <div className="flex items-center gap-4">
                   <button 
                    onClick={saveOnboarding}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold"
                   >
                     <SaveIcon size={16} /> Save Draft
                   </button>
                   
                   {step < 3 ? (
                      <button 
                        onClick={handleNext}
                        className="onboarding-btn-primary px-10 py-4 rounded-2xl font-black flex items-center gap-3 text-white tracking-tight"
                      >
                        Next Step <ArrowRight size={20} />
                      </button>
                   ) : (
                      <button 
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="onboarding-btn-primary px-10 py-4 rounded-2xl font-black flex items-center gap-3 text-white tracking-tight shadow-blue-600/40"
                      >
                        {isSubmitting ? 'Securing Data...' : 'Finish Setup'} <CheckCircle size={20} />
                      </button>
                   )}
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
