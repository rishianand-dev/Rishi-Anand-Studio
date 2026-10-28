'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { X, Upload, Plus, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadPortfolioFile, isFirebaseConfigured } from '@/lib/firebase';
import confetti from 'canvas-confetti';

export default function AdminDrawer() {
  const { isAdminDrawerOpen, setAdminDrawerOpen, addProject } = usePortfolioStore();

  const [form, setForm] = useState({
    title: '',
    category: 'Full Stack',
    description: '',
    longDescription: '',
    tags: 'Next.js, TypeScript, PostgreSQL, Firebase',
    demoUrl: '',
    githubUrl: '',
    metrics: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAdminDrawerOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setImageFile(selected);
      const url = URL.createObjectURL(selected);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError('Please fill in title and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop';
      
      if (imageFile) {
        finalImageUrl = await uploadPortfolioFile(imageFile, 'project-photos', (progress) => {
          setUploadPercent(progress);
        });
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          longDescription: form.longDescription,
          tags: form.tags.split(',').map((t) => t.trim()),
          imageUrl: finalImageUrl,
          demoUrl: form.demoUrl,
          githubUrl: form.githubUrl,
          metrics: form.metrics,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save project');
      }

      addProject(data.project);

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });

      setAdminDrawerOpen(false);
      // Reset form
      setForm({
        title: '',
        category: 'Full Stack',
        description: '',
        longDescription: '',
        tags: 'Next.js, TypeScript, PostgreSQL, Firebase',
        demoUrl: '',
        githubUrl: '',
        metrics: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setUploadPercent(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-xl h-full bg-white/95 liquid-glass-card shadow-2xl p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Add New Project</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved to PostgreSQL & photos stored via Firebase
              </p>
            </div>
            <button
              onClick={() => setAdminDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Nexus Protocol — Distributed Mesh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                  <option value="AI / Creative">AI / Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Key Metric / Badge
                </label>
                <input
                  type="text"
                  value={form.metrics}
                  onChange={(e) => setForm({ ...form, metrics: e.target.value })}
                  placeholder="e.g. 100k Req/s"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Short Description *
              </label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="One-line summary for project card..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Deep Dive / Architecture Overview
              </label>
              <textarea
                rows={3}
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                placeholder="Extended breakdown of technical decisions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Next.js, TypeScript, PostgreSQL, Zustand"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
            </div>

            {/* Photo / Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1 flex items-center justify-between">
                <span>Showcase Screenshot</span>
                <span className="text-[10px] text-indigo-600 font-normal">
                  {isFirebaseConfigured ? 'Firebase Cloud Storage' : 'Firebase Ready & Preview'}
                </span>
              </label>
              
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {imageFile && (
                  <span className="text-xs text-slate-500 truncate max-w-[180px]">
                    {imageFile.name}
                  </span>
                )}
              </div>

              {imagePreview && (
                <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {uploadPercent !== null && (
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing to Postgres & Firebase...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create & Publish Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

