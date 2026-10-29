'use client';

import React, { useState } from 'react';
import { Mail, Send, Paperclip, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadPortfolioFile } from '@/lib/upload';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      let attachmentUrl = '';
      if (file) {
        attachmentUrl = await uploadPortfolioFile(file, 'contact-attachments', (progress) => {
          setUploadProgress(progress);
        });
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attachmentUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit message');
      }

      setStatus('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'],
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFile(null);
      setUploadProgress(null);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="text-xs font-mono font-semibold tracking-widest uppercase text-indigo-600 mb-3 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>START A CONVERSATION</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Let&apos;s build something <br className="hidden sm:inline" />
          <span className="text-gradient-purple">effortless together.</span>
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Have an interesting project, a technical challenge, or a position you&apos;d like to discuss? Drop me a message below.
        </p>
      </div>

      <div className="max-w-2xl mx-auto liquid-glass-card rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {status === 'success' ? (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600 max-w-md text-sm mb-6">
              Thank you for reaching out. I&apos;ll get back to you shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Rivers"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Senior Engineering Role / Project Inquiry"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about your team, tech stack, or product vision..."
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm placeholder:text-slate-400 transition-all resize-none"
              />
            </div>

            {/* File Upload powered by Neon Object Storage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Attachment / Spec (Optional)</span>
                
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/70 text-xs font-medium text-slate-700 transition-all">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span>{file ? file.name : 'Choose File (PDF, PNG, Specs)'}</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {uploadProgress !== null && (
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
