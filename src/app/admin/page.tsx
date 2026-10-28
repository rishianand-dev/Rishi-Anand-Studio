'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  LogOut,
  Sparkles,
  Layers,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  ExternalLink,
  Upload,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  Search,
  Globe,
  Share2,
} from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { Project, ExperienceItem, EducationItem, SkillItem, ProfileData, SeoSettingsData } from '@/lib/types';
import { INITIAL_SEO } from '@/lib/initial-data';
import { uploadPortfolioFile, isFirebaseConfigured } from '@/lib/firebase';
import confetti from 'canvas-confetti';

export default function AdminPage() {
  const router = useRouter();
  const {
    profile,
    setProfile,
    projects,
    setProjects,
    addProject,
    updateProjectInStore,
    deleteProjectFromStore,
    experiences,
    setExperiences,
    addExperience,
    updateExperienceInStore,
    deleteExperienceFromStore,
    educations,
    setEducations,
    addEducation,
    updateEducationInStore,
    deleteEducationFromStore,
    skills,
    setSkills,
    addSkill,
    updateSkillInStore,
    deleteSkillFromStore,
  } = usePortfolioStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'heading' | 'projects' | 'tech' | 'experience' | 'education' | 'seo'>('heading');

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);

  // Edit Modals
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState<ProfileData>(profile);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeProgress, setResumeProgress] = useState<number | null>(null);

  // SEO Form state
  const [seoForm, setSeoForm] = useState<SeoSettingsData>(INITIAL_SEO);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogProgress, setOgProgress] = useState<number | null>(null);
  const [seoSaving, setSeoSaving] = useState(false);

  // Check login status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
      } catch (e) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch initial profile & data & SEO
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, seoRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/seo'),
        ]);

        const data = await profileRes.json();
        if (data.success) {
          if (data.profile) {
            setProfile(data.profile);
            setProfileForm(data.profile);
          }
          if (data.experiences) setExperiences(data.experiences);
          if (data.educations) setEducations(data.educations);
          if (data.skills) setSkills(data.skills);
        }

        const seoData = await seoRes.json();
        if (seoData.success && seoData.seo) {
          setSeoForm(seoData.seo);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, setProfile, setExperiences, setEducations, setSkills]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }
      setIsAuthenticated(true);
      confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  // --- Profile / Heading Save ---
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalResumeUrl = profileForm.resumeUrl;
      if (resumeFile) {
        setResumeUploading(true);
        finalResumeUrl = await uploadPortfolioFile(resumeFile, 'resumes', (p) => setResumeProgress(p));
        setResumeUploading(false);
      }

      const updatedData = { ...profileForm, resumeUrl: finalResumeUrl };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setProfileForm(data.profile);
        showToast('Heading & Profile updated successfully in Postgres!');
      }
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    }
  };

  // --- SEO Save ---
  const handleSeoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeoSaving(true);
    try {
      let finalOgUrl = seoForm.ogImageUrl;
      if (ogImageFile) {
        setOgUploading(true);
        finalOgUrl = await uploadPortfolioFile(ogImageFile, 'seo-images', (p) => setOgProgress(p));
        setOgUploading(false);
      }

      const updatedSeo = { ...seoForm, ogImageUrl: finalOgUrl };
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSeo),
      });
      const data = await res.json();
      if (data.success) {
        setSeoForm(data.seo);
        showToast('SEO & Social metadata saved to PostgreSQL!');
        confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert('Error saving SEO settings: ' + err.message);
    } finally {
      setSeoSaving(false);
    }
  };

  // --- Loading screen ---
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // --- Login View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md liquid-glass-card rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Authentication</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage portfolio content, tech stack & SEO
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-[11px] text-slate-600">
              💡 Default demo credentials: <span className="font-mono font-semibold text-indigo-700">admin</span> /{' '}
              <span className="font-mono font-semibold text-indigo-700">admin123</span>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated Admin Dashboard ---
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              Authorized
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modify portfolio hero headings, projects, education, career experience, tech stack, resume & SEO.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass-nav text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Portfolio</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium border border-rose-200/60 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl liquid-glass-nav w-fit">
        <button
          onClick={() => setActiveTab('heading')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'heading' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Heading & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tech')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'tech' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Tech Stack ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'experience' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Experience ({experiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'education' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Education ({educations.length})</span>
        </button>

        {/* SEO TAB */}
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'seo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO & Metadata</span>
        </button>
      </div>

      {/* TAB CONTENT 1: HEADING & PROFILE */}
      {activeTab === 'heading' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Heading, Typography & Profile</h2>
              <p className="text-xs text-slate-500">Edit the hero headlines, subtitle tags, and resume document</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Role Subtitle Tag (Hero Tag)
                </label>
                <input
                  type="text"
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Main Hero Headline
              </label>
              <textarea
                rows={2}
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Subheadline / Description
              </label>
              <textarea
                rows={3}
                value={profileForm.subheadline}
                onChange={(e) => setProfileForm({ ...profileForm, subheadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="avail"
                  checked={profileForm.availableForWork}
                  onChange={(e) => setProfileForm({ ...profileForm, availableForWork: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="avail" className="text-xs font-semibold text-slate-700">
                  Available for Work (Shows green pulsing badge)
                </label>
              </div>
            </div>

            {/* Resume Upload Module */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <label className="block text-xs font-semibold uppercase text-indigo-950 mb-1 flex items-center justify-between">
                <span>Resume Document / URL (Firebase Storage)</span>
                <span className="text-[10px] text-indigo-600 font-normal">
                  {isFirebaseConfigured ? 'Firebase Cloud Bucket' : 'Firebase Ready'}
                </span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                <input
                  type="text"
                  value={profileForm.resumeUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                  placeholder="https://... or /resume.pdf"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{resumeFile ? resumeFile.name : 'Upload New PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {resumeUploading && resumeProgress !== null && (
                <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${resumeProgress}%` }} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={profileForm.githubUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profileForm.linkedinUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={profileForm.twitterUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, twitterUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes to Postgres</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 2: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Portfolio Projects</h2>
              <p className="text-xs text-slate-500">Edit, modify, or remove showcase project items</p>
            </div>
            <button
              onClick={() => {
                const newP: Project = {
                  id: `proj-${Date.now()}`,
                  title: 'New Innovation Platform',
                  slug: `project-${Date.now()}`,
                  description: 'Description of the new system...',
                  longDescription: 'Extended technical overview...',
                  category: 'Full Stack',
                  tags: ['Next.js', 'PostgreSQL', 'TypeScript'],
                  featured: true,
                  imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
                  demoUrl: 'https://example.com',
                  githubUrl: 'https://github.com',
                  stars: 10,
                  metrics: '99.9% Uptime',
                  order: projects.length + 1,
                };
                setEditingProject(newP);
              }}
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {p.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProject(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete "${p.title}"?`)) {
                            await fetch(`/api/projects/${p.id}`, { method: 'DELETE' });
                            deleteProjectFromStore(p.id);
                            showToast('Project deleted');
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{p.description}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/50">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/70 text-slate-600 border border-slate-200/50">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TECH STACK */}
      {activeTab === 'tech' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tech Stack & Skills Matrix</h2>
              <p className="text-xs text-slate-500">Manage categories, frameworks, libraries, and tools</p>
            </div>
            <button
              onClick={() => {
                const name = prompt('Skill Name (e.g. Next.js, Rust, Kafka):');
                if (!name) return;
                const category = prompt('Category (Frontend, Backend, Practices, Tools):', 'Frontend') || 'Frontend';
                fetch('/api/skills', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, category }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.success) {
                      addSkill(d.skill);
                      showToast('Skill added');
                    }
                  });
              }}
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Frontend', 'Backend', 'Practices'].map((cat) => (
              <div key={cat} className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-indigo-700 tracking-wider">
                  {cat}
                </h3>
                <div className="flex flex-col gap-2">
                  {skills
                    .filter((s) => s.category.toLowerCase() === cat.toLowerCase())
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs text-xs"
                      >
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <button
                          onClick={async () => {
                            await fetch(`/api/skills/${s.id}`, { method: 'DELETE' });
                            deleteSkillFromStore(s.id);
                            showToast('Skill removed');
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Career Experience</h2>
              <p className="text-xs text-slate-500">Add or edit engineering positions & company history</p>
            </div>
            <button
              onClick={() => {
                const newExp: ExperienceItem = {
                  id: `exp-${Date.now()}`,
                  role: 'Lead Full Stack Engineer',
                  company: 'Acme Systems',
                  period: '2024 — Present',
                  location: 'New York, NY',
                  description: 'Spearheaded real-time collaboration architecture and optimized database query plans.',
                  skills: ['Next.js', 'PostgreSQL', 'TypeScript', 'Zustand'],
                  order: experiences.length + 1,
                };
                setEditingExperience(newExp);
              }}
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="liquid-glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                    <span className="text-indigo-600 text-xs font-semibold">@ {exp.company}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mb-2">
                    {exp.period} • {exp.location}
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-3">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/70 text-slate-600 border border-slate-200/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 self-start">
                  <button
                    onClick={() => setEditingExperience(exp)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${exp.role}?`)) {
                        await fetch(`/api/experience/${exp.id}`, { method: 'DELETE' });
                        deleteExperienceFromStore(exp.id);
                        showToast('Experience deleted');
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Education & Certifications</h2>
              <p className="text-xs text-slate-500">Degrees, academic institutions, and achievements</p>
            </div>
            <button
              onClick={() => {
                const newEdu: EducationItem = {
                  id: `edu-${Date.now()}`,
                  degree: 'B.S. in Computer Science',
                  institution: 'University Name',
                  period: '2016 — 2020',
                  location: 'New York, NY',
                  description: 'Honors, core subjects, algorithms, and systems engineering.',
                  order: educations.length + 1,
                };
                setEditingEducation(newEdu);
              }}
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu.id} className="liquid-glass-card rounded-2xl p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{edu.degree}</h3>
                  <div className="text-xs font-semibold text-indigo-600 mb-1">{edu.institution}</div>
                  <div className="text-xs font-mono text-slate-500 mb-2">
                    {edu.period} {edu.location && `• ${edu.location}`}
                  </div>
                  {edu.description && (
                    <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{edu.description}</p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center gap-2 self-start">
                  <button
                    onClick={() => setEditingEducation(edu)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${edu.degree}?`)) {
                        await fetch(`/api/education/${edu.id}`, { method: 'DELETE' });
                        deleteEducationFromStore(edu.id);
                        showToast('Education deleted');
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: SEO & SOCIAL METADATA */}
      {activeTab === 'seo' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <span>Search Engine Optimization & Social Sharing</span>
              </h2>
              <p className="text-xs text-slate-500">
                Configure meta tags, OpenGraph previews, social cards, and Google indexing directives.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: SEO Inputs Form */}
            <div className="lg:col-span-7 space-y-5">
              <form onSubmit={handleSeoSave} className="space-y-5">
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Meta Page Title *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {seoForm.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={seoForm.metaTitle}
                    onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                    placeholder="Alex Miller — Liquid Glass Engineer Portfolio"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Appears in browser tabs and as the primary headline in Google search results.
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Meta Description *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {seoForm.metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={seoForm.metaDescription}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
                    placeholder="Product-minded software engineer crafting fast, thoughtful digital experiences..."
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                    Meta Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={seoForm.keywords}
                    onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                    placeholder="Software Engineer, Full Stack, Next.js 14, TypeScript, PostgreSQL"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Canonical URL */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                      Canonical Site URL
                    </label>
                    <input
                      type="url"
                      value={seoForm.canonicalUrl || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                      placeholder="https://alexmiller.dev"
                    />
                  </div>

                  {/* Twitter Handle */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                      Twitter / X Handle
                    </label>
                    <input
                      type="text"
                      value={seoForm.twitterHandle || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, twitterHandle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                      placeholder="@alexmiller"
                    />
                  </div>
                </div>

                {/* Robots Indexing Directive */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                    Search Engine Robots Directive
                  </label>
                  <select
                    value={seoForm.robots}
                    onChange={(e) => setSeoForm({ ...seoForm, robots: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                  >
                    <option value="index, follow">index, follow (Recommended — Allow indexing)</option>
                    <option value="noindex, follow">noindex, follow (Hidden from search, follow links)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Completely private)</option>
                  </select>
                </div>

                {/* OpenGraph Image Upload via Firebase */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase text-indigo-950 mb-1 flex items-center justify-between">
                    <span>OpenGraph / Social Share Image (1200x630)</span>
                    <span className="text-[10px] text-indigo-600 font-normal">
                      {isFirebaseConfigured ? 'Firebase Cloud Storage' : 'Firebase Ready'}
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
                    <input
                      type="text"
                      value={seoForm.ogImageUrl || ''}
                      onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                      placeholder="https://... or upload photo"
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500/40 outline-none"
                    />

                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{ogImageFile ? ogImageFile.name : 'Upload OG Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setOgImageFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {ogUploading && ogProgress !== null && (
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${ogProgress}%` }} />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={seoSaving}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {seoSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Neon Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save SEO Settings</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Live Search & Social Card Previews */}
            <div className="lg:col-span-5 space-y-6">
              {/* Google Search Live Preview */}
              <div className="liquid-glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Google Search Live Snippet</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner font-sans space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                      G
                    </span>
                    <span className="text-[11px] text-slate-700 truncate">
                      {seoForm.canonicalUrl || 'https://alexmiller.dev'}
                    </span>
                  </div>
                  <h4 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer leading-snug line-clamp-1">
                    {seoForm.metaTitle || 'Portfolio Title'}
                  </h4>
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {seoForm.metaDescription || 'Your portfolio meta description will appear here in search queries...'}
                  </p>
                </div>
              </div>

              {/* Social Media Share Preview */}
              <div className="liquid-glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Social Share Preview (X / LinkedIn / Slack)</span>
                </div>

                <div className="bg-white rounded-xl overflow-hidden border border-slate-200/70 shadow-sm">
                  <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seoForm.ogImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'}
                      alt="OG Image Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-200/60">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                      {seoForm.canonicalUrl?.replace(/https?:\/\//, '') || 'alexmiller.dev'}
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {seoForm.metaTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {seoForm.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: PROJECT */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto liquid-glass-card bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Modify Project</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                    <option value="AI / Creative">AI / Creative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Metrics / Tag</label>
                  <input
                    type="text"
                    value={editingProject.metrics || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, metrics: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingProject.imageUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingProject.tags.join(', ')}
                  onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const isNew = !projects.some((p) => p.id === editingProject.id);
                    if (isNew) {
                      const res = await fetch('/api/projects', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingProject),
                      });
                      const d = await res.json();
                      if (d.success) addProject(d.project);
                    } else {
                      const res = await fetch(`/api/projects/${editingProject.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingProject),
                      });
                      const d = await res.json();
                      if (d.success) updateProjectInStore(d.project);
                    }
                    showToast('Project saved to PostgreSQL');
                    setEditingProject(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: EXPERIENCE */}
      {editingExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl liquid-glass-card bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Modify Experience</h3>
              <button onClick={() => setEditingExperience(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={editingExperience.role}
                    onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={editingExperience.company}
                    onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={editingExperience.period}
                    onChange={(e) => setEditingExperience({ ...editingExperience, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingExperience.location}
                    onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingExperience.description}
                  onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editingExperience.skills.join(', ')}
                  onChange={(e) => setEditingExperience({ ...editingExperience, skills: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setEditingExperience(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const isNew = !experiences.some((e) => e.id === editingExperience.id);
                    if (isNew) {
                      const res = await fetch('/api/experience', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingExperience),
                      });
                      const d = await res.json();
                      if (d.success) addExperience(d.experience);
                    } else {
                      const res = await fetch(`/api/experience/${editingExperience.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingExperience),
                      });
                      const d = await res.json();
                      if (d.success) updateExperienceInStore(d.experience);
                    }
                    showToast('Experience updated');
                    setEditingExperience(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: EDUCATION */}
      {editingEducation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl liquid-glass-card bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Modify Education</h3>
              <button onClick={() => setEditingEducation(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Degree / Qualification</label>
                <input
                  type="text"
                  value={editingEducation.degree}
                  onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Institution / University</label>
                <input
                  type="text"
                  value={editingEducation.institution}
                  onChange={(e) => setEditingEducation({ ...editingEducation, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={editingEducation.period}
                    onChange={(e) => setEditingEducation({ ...editingEducation, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingEducation.location || ''}
                    onChange={(e) => setEditingEducation({ ...editingEducation, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description / Honors</label>
                <textarea
                  rows={2}
                  value={editingEducation.description || ''}
                  onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setEditingEducation(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const isNew = !educations.some((e) => e.id === editingEducation.id);
                    if (isNew) {
                      const res = await fetch('/api/education', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingEducation),
                      });
                      const d = await res.json();
                      if (d.success) addEducation(d.education);
                    } else {
                      const res = await fetch(`/api/education/${editingEducation.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editingEducation),
                      });
                      const d = await res.json();
                      if (d.success) updateEducationInStore(d.education);
                    }
                    showToast('Education saved');
                    setEditingEducation(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Education
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
