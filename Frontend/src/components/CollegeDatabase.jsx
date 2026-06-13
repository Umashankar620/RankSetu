'use client';
import React, { useState, useEffect } from 'react';
import FilterBar from './FilterBar';
import CutoffTable from './CutoffTable';
import { fetchFilters, fetchCutoffs } from '@/utils/api';

export default function CollegeDatabase({ darkMode }) {
  const [filters, setFilters] = useState({ years: [], rounds: [], categories: [], quotas: [], programs: [], institutes: [], genders: [], types: [] });
  const [formState, setFormState] = useState({ year: '', round: '', category: '', quota: '', program: '', institute: '', gender: '', type: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchFilters().then(res => {
      if (res?.data?.success) setFilters(res.data.filters);
    }).catch(console.error);
  }, []);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchCutoffs({ ...formState, page });
      if (res?.data?.success) {
        setResults(res.data.data);
        setTotalItems(res.data.totalItems);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
        setHasSearched(true);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-4">College Database – 600+ Medical Colleges</h1>
      <FilterBar filters={filters} formState={formState} onChange={(f, v) => setFormState(prev => ({ ...prev, [f]: v }))}
        onSearch={() => handleSearch(1)} onReset={() => setFormState({ year: '', round: '', category: '', quota: '', program: '', institute: '', gender: '', type: '' })}
        loading={loading} darkMode={darkMode} />
      <CutoffTable data={results} totalItems={totalItems} totalPages={totalPages} currentPage={currentPage}
        onPageChange={handleSearch} loading={loading} hasSearched={hasSearched} darkMode={darkMode} />
    </div>
  );
}