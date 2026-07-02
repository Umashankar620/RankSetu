'use client';
// =============================================================================
// components/CollegeInfoPageClient.jsx — NEW, ADDITIVE ONLY
// =============================================================================
// Thin client wrapper so the actual Next.js route file (app/college-info/page.jsx)
// can stay a server component (required to export `metadata`), while still
// reading darkMode from the existing AppContext the rest of the site uses.
// =============================================================================
import React from 'react';
import { useApp } from '@/context/AppContext';
import CollegeInfoPage from '@/components/CollegeInfoPage';

export default function CollegeInfoPageClient() {
  const { darkMode } = useApp();
  return <CollegeInfoPage darkMode={darkMode} />;
}
