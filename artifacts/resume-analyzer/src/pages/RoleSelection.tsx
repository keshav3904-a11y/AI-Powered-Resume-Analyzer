import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Target, Search, ChevronDown, Plus, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobRoles } from '@/hooks/use-resume';
import { useAppStore } from '@/store/use-app-store';

const CATEGORY_ICONS: Record<string, string> = {
  Technology: '💻',
  Business: '📊',
  Finance: '💰',
  Healthcare: '🏥',
  Engineering: '⚙️',
  Creative: '🎨',
  Education: '🎓',
  Custom: '✏️',
};

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const {
    uploadedFile,
    selectedJobRole,
    customSkills,
    customRoleTitle,
    setSelectedJobRole,
    setCustomSkills,
    setCustomRoleTitle,
  } = useAppStore();

  const { data, isLoading, error } = useJobRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customSkillInput, setCustomSkillInput] = useState('');

  const isCustom = selectedJobRole === '__custom__';

  if (!uploadedFile) {
    return (
      <div className="p-12 text-center h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">No Resume Found</h2>
        <p className="text-slate-500 mb-8">Please upload a resume first before selecting a role.</p>
        <Button onClick={() => setLocation('/upload')}>Go to Upload</Button>
      </div>
    );
  }

  const categories = data?.categories ?? [];
  const allCategories = ['All', ...categories];

  // Filtered roles based on search + category
  const filteredRoles = useMemo(() => {
    const roles = data?.roles ?? [];
    return roles.filter((role) => {
      const matchesCategory =
        activeCategory === 'All' || role.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.requiredSkills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [data, searchQuery, activeCategory]);

  // Group filtered roles by category for display
  const groupedRoles = useMemo(() => {
    const groups: Record<string, typeof filteredRoles> = {};
    for (const role of filteredRoles) {
      if (!groups[role.category]) groups[role.category] = [];
      groups[role.category].push(role);
    }
    return groups;
  }, [filteredRoles]);

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const skills = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setCustomSkills([...new Set([...customSkills, ...skills])]);
    setCustomSkillInput('');
  };

  const handleRemoveCustomSkill = (skill: string) => {
    setCustomSkills(customSkills.filter((s) => s !== skill));
  };

  const handleContinue = () => {
    if (selectedJobRole) setLocation('/analyze');
  };

  const canContinue =
    selectedJobRole &&
    (selectedJobRole !== '__custom__' || customSkills.length > 0);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Select Target Role</h2>
        <p className="text-slate-500">
          Search from {data?.roles.length ?? '80+'} roles across {categories.length} industries.
        </p>
      </motion.div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search roles or skills…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat !== 'All' && CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}
            {cat}
          </button>
        ))}
        {/* Custom role tab */}
        <button
          onClick={() => {
            setSelectedJobRole('__custom__');
            setActiveCategory('All');
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-all ${
            isCustom
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Custom Role
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          Failed to load job roles. Please refresh and try again.
        </div>
      )}

      {/* Custom Role Panel */}
      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-6 border-2 border-amber-400 bg-amber-50/40">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-lg text-slate-900">Custom Job Role</h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Space Engineer, Quantum Researcher…"
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Required Skills
                  <span className="ml-1 text-xs text-slate-400">(comma-separated)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Python, Machine Learning, Docker…"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddCustomSkill}
                    className="border-amber-400 text-amber-700 hover:bg-amber-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {customSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveCustomSkill(skill)}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {customSkills.length === 0 && (
                <p className="text-sm text-amber-700 mt-2">
                  Add at least one required skill to proceed.
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles grouped by category */}
      {!isLoading && !error && !isCustom && (
        <div className="flex-1 overflow-y-auto space-y-8 mb-6">
          {Object.keys(groupedRoles).length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No roles match your search</p>
              <p className="text-sm mt-1">Try a different keyword or clear the filter</p>
            </div>
          ) : (
            Object.entries(groupedRoles).map(([category, roles]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_ICONS[category] ?? '📁'}</span>
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                    {category}
                  </h3>
                  <span className="text-xs text-slate-400">({roles.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const isSelected = selectedJobRole === role.id;
                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ y: -1 }}
                      >
                        <Card
                          className={`relative p-4 cursor-pointer border-2 transition-all duration-200 h-full flex flex-col ${
                            isSelected
                              ? 'border-primary shadow-md shadow-primary/10 bg-primary/[0.02]'
                              : 'border-transparent hover:border-slate-200 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedJobRole(role.id)}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isSelected
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Target size={15} />
                            </div>
                            <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                              {role.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-auto">
                            {role.requiredSkills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant={isSelected ? 'default' : 'secondary'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {role.requiredSkills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-400"
                              >
                                +{role.requiredSkills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-auto">
        <Button variant="ghost" onClick={() => setLocation('/upload')}>
          ← Back to Upload
        </Button>
        <div className="flex items-center gap-3">
          {selectedJobRole && selectedJobRole !== '__custom__' && (
            <span className="text-sm text-slate-500 hidden sm:block">
              Selected:{' '}
              <strong className="text-slate-700">
                {data?.roles.find((r) => r.id === selectedJobRole)?.title}
              </strong>
            </span>
          )}
          <Button disabled={!canContinue} onClick={handleContinue} className="w-44">
            Proceed to Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
