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
  ArrowUp,
  ArrowDown,
  X,
  Search,
  Globe,
  Share2,
} from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { Project, ExperienceItem, EducationItem, SkillItem, ProfileData, SeoSettingsData } from '@/lib/types';
import { INITIAL_SEO } from '@/lib/initial-data';
import { uploadPortfolioFile } from '@/lib/upload';
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
  const [activeTab, setActiveTab] = useState<'heading' | 'about' | 'footer' | 'projects' | 'tech' | 'experience' | 'education' | 'seo'>('heading');

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
        const [profileRes, projectsRes, seoRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/projects'),
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

        const projectsData = await projectsRes.json();
        if (projectsData.success && projectsData.projects) {
          setProjects(projectsData.projects);
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
  }, [isAuthenticated, setProfile, setProjects, setExperiences, setEducations, setSkills]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const moveItem = async <T extends { id: string; order: number }>(
    items: T[],
    index: number,
    direction: -1 | 1,
    endpoint: string,
    setItems: (items: T[]) => void,
    label: string
  ) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const normalized = reordered.map((item, itemIndex) => ({
      ...item,
      order: itemIndex + 1,
    }));

    try {
      const responses = await Promise.all(
        normalized.map((item) =>
          fetch(`${endpoint}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: item.order }),
          })
        )
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error(`Failed to update ${label.toLowerCase()} order`);
      }

      setItems(normalized);
      showToast(`${label} order updated`);
    } catch (error) {
      console.error(`Error reordering ${label.toLowerCase()}:`, error);
      showToast(`Could not update ${label.toLowerCase()} order`);
    }
  };

  const moveSkill = async (categorySkills: SkillItem[], index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categorySkills.length) return;

    const current = categorySkills[index];
    const target = categorySkills[targetIndex];
    try {
      const responses = await Promise.all([
        fetch(`/api/skills/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/skills/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to update skill order');
      }

      const reordered = [...categorySkills];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      const reorderedById = new Map(reordered.map((skill) => [skill.id, skill]));
      setSkills(skills.map((skill) => reorderedById.get(skill.id) || skill));
      showToast('Tech stack order updated');
    } catch (error) {
      console.error('Error reordering skills:', error);
      showToast('Could not update tech stack order');
    }
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
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'about' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>About Section</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'footer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Footer Controls</span>
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

            <div className="pt-4 border-t border-slate-200/60 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero visual controls</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Control the technology strip, floating code card, and status badge shown beside the hero.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Technology Strip
                </label>
                <input
                  type="text"
                  value={profileForm.heroTechStack}
                  onChange={(e) => setProfileForm({ ...profileForm, heroTechStack: e.target.value })}
                  placeholder="NEXT.JS 14,POSTGRESQL,NEON STORAGE,ZUSTAND"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">Separate each item with a comma.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  value={profileForm.heroCodeLineOne}
                  onChange={(e) => setProfileForm({ ...profileForm, heroCodeLineOne: e.target.value })}
                  placeholder="const craft ="
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
                <input
                  value={profileForm.heroCodeLineTwo}
                  onChange={(e) => setProfileForm({ ...profileForm, heroCodeLineTwo: e.target.value })}
                  placeholder="detail +"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
                <input
                  value={profileForm.heroCodeLineThree}
                  onChange={(e) => setProfileForm({ ...profileForm, heroCodeLineThree: e.target.value })}
                  placeholder="curiosity;"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  value={profileForm.heroStatusLabel}
                  onChange={(e) => setProfileForm({ ...profileForm, heroStatusLabel: e.target.value })}
                  placeholder="CURRENTLY"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
                <input
                  value={profileForm.heroStatusText}
                  onChange={(e) => setProfileForm({ ...profileForm, heroStatusText: e.target.value })}
                  placeholder="Building for the web"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
              </div>
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
                <span>Resume Document / URL (Neon Object Storage)</span>
                <span className="text-[10px] text-indigo-600 font-normal">Neon Bucket: media</span>
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

            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <label className="block text-xs font-semibold uppercase text-indigo-950 mb-1.5">
                Contact Form Recipient Email
              </label>
              <input
                type="email"
                required
                value={profileForm.contactEmail}
                onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Contact form submissions will be delivered to this address through Resend.
              </p>
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

      {/* TAB CONTENT 2: ABOUT */}
      {activeTab === 'about' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10">
          <div className="pb-4 border-b border-slate-200/60 mb-6">
            <h2 className="text-lg font-bold text-slate-900">About Section Controls</h2>
            <p className="text-xs text-slate-500">
              Control every text element in the left bio card and each right-side philosophy card.
              Use <code className="text-indigo-600">{'{name}'}</code> in the intro title to insert the profile name.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-8 max-w-4xl">
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Section heading</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Eyebrow Label</label>
                  <input value={profileForm.aboutLabel} onChange={(e) => setProfileForm({ ...profileForm, aboutLabel: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Main Heading</label>
                  <input value={profileForm.aboutHeading} onChange={(e) => setProfileForm({ ...profileForm, aboutHeading: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Left bio card</h3>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">Intro Title</label>
                <input value={profileForm.aboutIntroTitle} onChange={(e) => setProfileForm({ ...profileForm, aboutIntroTitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <textarea rows={5} value={profileForm.aboutParagraphOne} onChange={(e) => setProfileForm({ ...profileForm, aboutParagraphOne: e.target.value })} placeholder="First paragraph" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none resize-none" />
                <textarea rows={5} value={profileForm.aboutParagraphTwo} onChange={(e) => setProfileForm({ ...profileForm, aboutParagraphTwo: e.target.value })} placeholder="Second paragraph" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input value={profileForm.aboutResumeLabel} onChange={(e) => setProfileForm({ ...profileForm, aboutResumeLabel: e.target.value })} placeholder="Resume button label" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
                <input value={profileForm.aboutGithubLabel} onChange={(e) => setProfileForm({ ...profileForm, aboutGithubLabel: e.target.value })} placeholder="GitHub button label" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
                <input value={profileForm.aboutContactLabel} onChange={(e) => setProfileForm({ ...profileForm, aboutContactLabel: e.target.value })} placeholder="Contact button label" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Right philosophy cards</h3>
              {([
                ['One', 'aboutPrincipleOneTitle', 'aboutPrincipleOneDescription'],
                ['Two', 'aboutPrincipleTwoTitle', 'aboutPrincipleTwoDescription'],
                ['Three', 'aboutPrincipleThreeTitle', 'aboutPrincipleThreeDescription'],
              ] as const).map(([label, titleKey, descriptionKey]) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <input value={profileForm[titleKey]} onChange={(e) => setProfileForm({ ...profileForm, [titleKey]: e.target.value })} placeholder={`Card ${label} title`} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none" />
                  <textarea rows={2} value={profileForm[descriptionKey]} onChange={(e) => setProfileForm({ ...profileForm, [descriptionKey]: e.target.value })} placeholder={`Card ${label} description`} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none resize-none" />
                </div>
              ))}
            </section>

            <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer">
              <Save className="w-4 h-4" />
              <span>Save About Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 3: FOOTER */}
      {activeTab === 'footer' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10">
          <div className="pb-4 border-b border-slate-200/60 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Footer Controls</h2>
            <p className="text-xs text-slate-500">
              Customize the footer branding, copyright text, and technology line shown on the home page.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Footer Brand
                </label>
                <input
                  type="text"
                  value={profileForm.footerBrand}
                  onChange={(e) => setProfileForm({ ...profileForm, footerBrand: e.target.value })}
                  placeholder="RA."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Footer Label
                </label>
                <input
                  type="text"
                  value={profileForm.footerLabel}
                  onChange={(e) => setProfileForm({ ...profileForm, footerLabel: e.target.value })}
                  placeholder="Software Engineer Portfolio"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={profileForm.footerCopyright}
                onChange={(e) => setProfileForm({ ...profileForm, footerCopyright: e.target.value })}
                placeholder="All rights reserved."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Technology Line
              </label>
              <input
                type="text"
                value={profileForm.footerTechStack}
                onChange={(e) => setProfileForm({ ...profileForm, footerTechStack: e.target.value })}
                placeholder="Designed with Next.js, PostgreSQL, Neon Storage, Zustand & TypeScript"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Footer Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 3: PROJECTS */}
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
            {projects.map((p, index) => (
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

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveItem(projects, index, -1, '/api/projects', setProjects, 'Project')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move project up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(projects, index, 1, '/api/projects', setProjects, 'Project')}
                      disabled={index === projects.length - 1}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move project down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400">Order {index + 1}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/70 text-slate-600 border border-slate-200/50">
                      {t}
                    </span>
                  ))}
                  </div>
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
                    .map((s, index, categorySkills) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs text-xs"
                      >
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSkill(categorySkills, index, -1)}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move skill up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSkill(categorySkills, index, 1)}
                            disabled={index === categorySkills.length - 1}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move skill down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              await fetch(`/api/skills/${s.id}`, { method: 'DELETE' });
                              deleteSkillFromStore(s.id);
                              showToast('Skill removed');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
            {experiences.map((exp, index) => (
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
                    onClick={() => moveItem(experiences, index, -1, '/api/experience', setExperiences, 'Experience')}
                    disabled={index === 0}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move experience up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(experiences, index, 1, '/api/experience', setExperiences, 'Experience')}
                    disabled={index === experiences.length - 1}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move experience down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
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
            {educations.map((edu, index) => (
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
                    onClick={() => moveItem(educations, index, -1, '/api/education', setEducations, 'Education')}
                    disabled={index === 0}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move education up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(educations, index, 1, '/api/education', setEducations, 'Education')}
                    disabled={index === educations.length - 1}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move education down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
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

                {/* OpenGraph Image Upload via Neon Object Storage */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase text-indigo-950 mb-1 flex items-center justify-between">
                    <span>OpenGraph / Social Share Image (1200x630)</span>
                    <span className="text-[10px] text-indigo-600 font-normal">
                      Neon Object Storage
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
                    try {
                      const isNew = !projects.some((p) => p.id === editingProject.id);
                      if (isNew) {
                        const res = await fetch('/api/projects', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingProject),
                        });
                        const d = await res.json();
                        if (!d.success) throw new Error(d.error || 'Failed to create project');
                        addProject(d.project);
                      } else {
                        const res = await fetch(`/api/projects/${editingProject.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingProject),
                        });
                        const d = await res.json();
                        if (!d.success) throw new Error(d.error || 'Failed to update project');
                        updateProjectInStore(d.project);
                      }
                      showToast('Project saved to PostgreSQL');
                      setEditingProject(null);
                    } catch (error) {
                      console.error('Error saving project:', error);
                      showToast(error instanceof Error ? error.message : 'Failed to save project');
                    }
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
