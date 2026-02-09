import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Plus, Trash2, Trophy, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INITIAL_CONSTRAINTS = [
  "Block touch bonus",
  "Transition kill from dig = bonus point",
  "Bonus point for middle kill",
  "3 hits are required",
  "2 hits only",
  "Setter cannot set same hitter twice in a row",
  "No point without team huddle",
  "Winning team adds constraint for losing team"
];

export default function App() {
  const [constraints, setConstraints] = useState(() => {
    const saved = localStorage.getItem('constraints');
    return saved ? JSON.parse(saved) : INITIAL_CONSTRAINTS;
  });

  const [drawnIndices, setDrawnIndices] = useState(() => {
    const saved = localStorage.getItem('drawnIndices');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentCardIndex, setCurrentCardIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConstraint, setNewConstraint] = useState('');

  useEffect(() => {
    localStorage.setItem('constraints', JSON.stringify(constraints));
  }, [constraints]);

  useEffect(() => {
    localStorage.setItem('drawnIndices', JSON.stringify(drawnIndices));
  }, [drawnIndices]);

  const drawCard = useCallback(() => {
    const availableIndices = constraints
      .map((_, i) => i)
      .filter(i => !drawnIndices.includes(i));

    if (availableIndices.length === 0) {
      alert("All cards have been drawn! Reset the deck to continue.");
      return;
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setIsFlipped(false);
    
    // Small delay to allow flip back animation if needed
    setTimeout(() => {
      setCurrentCardIndex(randomIndex);
      setDrawnIndices(prev => [...prev, randomIndex]);
      setIsFlipped(true);
    }, 150);
  }, [constraints, drawnIndices]);

  const resetDeck = () => {
    setDrawnIndices([]);
    setCurrentCardIndex(null);
    setIsFlipped(false);
  };

  const addConstraint = (e) => {
    e.preventDefault();
    if (!newConstraint.trim()) return;
    setConstraints(prev => [...prev, newConstraint.trim()]);
    setNewConstraint('');
    setShowAddModal(false);
  };

  const removeConstraint = (index) => {
    const newConstraints = constraints.filter((_, i) => i !== index);
    setConstraints(newConstraints);
    // Reset drawn indices since the mapping changed
    setDrawnIndices([]);
    setCurrentCardIndex(null);
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-indigo-900 text-white p-6 font-sans select-none">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold tracking-tight">COACH'S DECK</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-white/10 rounded-full active:bg-white/20 transition-colors"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={resetDeck}
            className="p-2 bg-white/10 rounded-full active:bg-white/20 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="relative w-full max-w-[300px] aspect-[2/3] perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex ?? 'empty'}
              initial={{ opacity: 0, y: 50, rotateY: 0 }}
              animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full preserve-3d relative cursor-pointer"
              onClick={() => currentCardIndex !== null && setIsFlipped(!isFlipped)}
            >
              {/* Card Front (The side shown when drawn) */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white text-indigo-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border-8 border-indigo-100 rotate-y-180">
                <Trophy className="mb-6 text-indigo-400" size={48} />
                <p className="text-2xl font-black uppercase leading-tight">
                  {currentCardIndex !== null ? constraints[currentCardIndex] : "Draw a card"}
                </p>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center border-8 border-white/20">
                <div className="w-full h-full m-4 border-2 border-white/10 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-white/40 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={drawCard}
            className="w-full max-w-[280px] py-4 bg-white text-indigo-900 font-bold rounded-xl shadow-lg active:scale-95 transition-transform text-lg flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} />
            {drawnIndices.length === 0 ? "START SESSION" : "DRAW NEXT"}
          </button>
          <p className="text-white/60 text-sm font-medium">
            {drawnIndices.length} / {constraints.length} cards drawn
          </p>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="bg-white text-indigo-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Constraint</h2>
            <form onSubmit={addConstraint}>
              <textarea
                autoFocus
                className="w-full border-2 border-indigo-100 rounded-xl p-4 mb-4 focus:border-indigo-500 outline-none text-lg min-h-[100px]"
                placeholder="Enter new constraint..."
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 font-bold rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  ADD
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Deck</h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {constraints.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium truncate pr-4">{c}</span>
                    <button 
                      onClick={() => removeConstraint(i)}
                      className="text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
