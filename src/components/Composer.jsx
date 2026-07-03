import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Image as ImageIcon, Loader, Zap, ChevronDown, Plus, Trophy, Brain, Lock } from 'lucide-react';
import { logWorkout } from '../hooks';
import GifPicker from './GifPicker';

const MAX_CAPTION = 280;

const WORKOUT_TYPES = [
  { id: 'strength', label: '🏋️ Strength', baseCaloriesPerMin: 6 },
  { id: 'cardio', label: '🏃 Cardio', baseCaloriesPerMin: 10 },
  { id: 'running', label: '👟 Running', baseCaloriesPerMin: 12 },
  { id: 'walking', label: '🚶 Walking', baseCaloriesPerMin: 4 },
  { id: 'cycling', label: '🚴 Cycling', baseCaloriesPerMin: 9 },
  { id: 'swimming', label: '🏊 Swimming', baseCaloriesPerMin: 11 },
  { id: 'hiit', label: '🔥 HIIT', baseCaloriesPerMin: 14 },
  { id: 'yoga', label: '🧘 Yoga', baseCaloriesPerMin: 3 },
  { id: 'custom', label: '⚙️ Custom', baseCaloriesPerMin: 5 }
];

const DIFFICULTIES = [
  { id: 'Easy', multiplier: 0.8, color: '#34d399' },
  { id: 'Normal', multiplier: 1.0, color: '#3b82f6' },
  { id: 'Hard', multiplier: 1.5, color: '#f59e0b' },
  { id: 'Legendary', multiplier: 2.5, color: '#f43f5e' }
];

const PRIVACY_OPTS = ['Public', 'Friends', 'Guild Only', 'Private'];

function compress(file) {
  return new Promise((res, rej) => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      const mx = 1200;
      let { width: w, height: h } = img;
      if (w > mx) { h = (h * mx) / w; w = mx; }
      if (h > mx) { w = (w * mx) / h; h = mx; }
      c.width = w;
      c.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = rej;
    const r = new FileReader();
    r.onload = e => img.src = e.target.result;
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function generateCoachSummary(type, duration, diff) {
  let summary = `Great work. You trained ${type} for ${duration} minutes. `;
  if (diff === 'Hard' || diff === 'Legendary') {
    summary += `Estimated intensity was high. `;
  } else {
    summary += `Estimated intensity was moderate. `;
  }
  summary += `\nRecovery recommendation:\n• Sleep 8 hours.\n• Drink 3L water.\n• Train ${type.toLowerCase().includes('strength') ? 'cardio or active recovery' : 'strength'} tomorrow.`;
  return summary;
}

export default function Composer({ currentUserId, currentUser, onClose }) {
  const [step, setStep] = useState('form'); // 'form' or 'celebration'
  
  // Section 1: Details
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [duration, setDuration] = useState('60');
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  
  // Section 2: Tracker
  const [exercises, setExercises] = useState([]);
  
  // Section 4: Media
  const [imgPrev, setImgPrev] = useState('');
  const [imgData, setImgData] = useState('');
  const [compressing, setCompressing] = useState(false);
  
  // Section 5: Caption
  const [caption, setCaption] = useState('');
  
  // Section 6: Privacy
  const [privacy, setPrivacy] = useState('Public');
  
  // Submit state
  const [posting, setPosting] = useState(false);
  const fRef = useRef(null);

  // Derived Stats
  const durationNum = parseInt(duration) || 0;
  const estimatedCalories = Math.floor(durationNum * workoutType.baseCaloriesPerMin * difficulty.multiplier);
  const baseXP = durationNum * 5;
  const exerciseBonus = exercises.length * 20;
  const diffBonus = Math.floor(baseXP * (difficulty.multiplier - 1));
  const totalXP = baseXP + exerciseBonus + diffBonus;
  const bossDamage = totalXP * 5;

  const handleImg = useCallback(async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return alert('Max 10MB');
    setCompressing(true);
    try {
      const d = await compress(f);
      setImgPrev(d);
      setImgData(d);
    } catch {
      alert('Image failed to load.');
    } finally {
      setCompressing(false);
      if (fRef.current) fRef.current.value = '';
    }
  }, []);

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: '', reps: '', weight: '' }]);
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const submitWorkout = async () => {
    if (!durationNum) return alert('Please enter a duration.');
    setPosting(true);

    const coachSummary = generateCoachSummary(workoutType.label, durationNum, difficulty.id);

    const workoutDetails = {
      type: workoutType.label,
      duration: durationNum,
      difficulty: difficulty.id,
      calories: estimatedCalories,
      xp: totalXP,
      bossDamage,
      privacy,
      exercises,
      coachSummary
    };

    try {
      await logWorkout(currentUserId, caption.trim(), imgData, workoutDetails);
      setStep('celebration');
    } catch (err) {
      console.error(err);
      alert('Post failed.');
      setPosting(false);
    }
  };

  if (step === 'celebration') {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-dark/95 backdrop-blur-xl">
        {/* Celebration Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-cyan-500/20 rounded-full blur-[60px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s'}} />
        </div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <Trophy size={80} className="text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]" />
          
          <h1 className="text-5xl font-black text-white uppercase tracking-widest mb-2 font-display">
            Mission Complete
          </h1>
          
          <p className="text-lg text-emerald-400 font-bold tracking-widest mb-12">
            STREAK INCREASED +1
          </p>

          <div className="flex gap-8 mb-12">
            <div className="flex flex-col items-center bg-white/5 rounded-2xl p-6 border border-white/10 w-40">
              <span className="text-cyan-400 font-black text-3xl mb-1">+{totalXP}</span>
              <span className="text-xs text-dark-muted font-bold tracking-widest uppercase">XP Earned</span>
            </div>
            <div className="flex flex-col items-center bg-white/5 rounded-2xl p-6 border border-white/10 w-40">
              <span className="text-rose-400 font-black text-3xl mb-1">+{bossDamage.toLocaleString()}</span>
              <span className="text-xs text-dark-muted font-bold tracking-widest uppercase">Boss DMG</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="px-12 py-4 bg-brand-primary text-black font-black uppercase tracking-widest text-lg rounded-full hover:scale-105 transition-transform"
          >
            Return to HQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div 
        className="bg-brand-dark w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-[2rem] border border-white/10 flex flex-col shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-brand-dark/50 backdrop-blur-md z-10 sticky top-0">
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
            <X size={20} className="text-white" />
          </button>
          <span className="font-black text-lg uppercase tracking-widest text-white">Log Workout</span>
          <button 
            onClick={submitWorkout}
            disabled={posting || compressing || !durationNum}
            className="px-6 py-2 bg-brand-primary text-black font-black uppercase text-sm rounded-full disabled:opacity-50 hover:bg-cyan-400 transition"
          >
            {posting ? <Loader size={16} className="animate-spin" /> : 'Finish'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 no-scrollbar">
          
          {/* Top Level Preview Card */}
          <div className="bg-gradient-to-br from-brand-secondary to-brand-dark p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10 grid grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-dark-muted font-bold">Type</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-primary transition"
                    value={workoutType.id}
                    onChange={e => setWorkoutType(WORKOUT_TYPES.find(t => t.id === e.target.value))}
                  >
                    {WORKOUT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-dark-muted font-bold">Duration (Min)</label>
                <input 
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-primary transition"
                  placeholder="60"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-widest text-dark-muted font-bold">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                        difficulty.id === d.id 
                          ? 'bg-white/10 border-white text-white' 
                          : 'bg-black/20 border-white/5 text-dark-muted hover:bg-white/5'
                      }`}
                      style={{ borderColor: difficulty.id === d.id ? d.color : undefined, color: difficulty.id === d.id ? d.color : undefined }}
                    >
                      {d.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center items-end text-right col-span-2 sm:col-span-1">
                <div className="text-3xl font-black text-brand-primary tracking-tight">+{totalXP} <span className="text-sm text-brand-primary/70">XP</span></div>
                <div className="text-sm font-bold text-rose-400">🔥 {estimatedCalories} Cal</div>
              </div>
            </div>
          </div>

          {/* Exercise Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Exercise Tracker</h3>
              <button 
                onClick={addExercise}
                className="flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full hover:bg-brand-primary/20 transition"
              >
                <Plus size={14} /> Add Lift
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="bg-black/20 border border-dashed border-white/10 rounded-2xl p-8 text-center text-dark-muted text-sm font-bold">
                No exercises logged yet.<br/>Focus on your form.
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, i) => (
                  <div key={ex.id} className="flex flex-wrap sm:flex-nowrap gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl items-center animate-in slide-in-from-top-2">
                    <span className="text-dark-muted font-black w-6 text-center">{i + 1}</span>
                    <input 
                      className="flex-1 min-w-[120px] bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none focus:border-brand-primary"
                      placeholder="e.g. Bench Press"
                      value={ex.name}
                      onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input 
                        className="w-16 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-center text-white font-bold outline-none focus:border-brand-primary"
                        placeholder="Sets"
                        type="number"
                        value={ex.sets}
                        onChange={e => updateExercise(ex.id, 'sets', e.target.value)}
                      />
                      <span className="text-dark-muted self-center text-xs font-bold">×</span>
                      <input 
                        className="w-16 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-center text-white font-bold outline-none focus:border-brand-primary"
                        placeholder="Reps"
                        type="number"
                        value={ex.reps}
                        onChange={e => updateExercise(ex.id, 'reps', e.target.value)}
                      />
                      <input 
                        className="w-20 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-center text-emerald-400 font-bold outline-none focus:border-emerald-500 ml-2"
                        placeholder="Lbs/Kg"
                        type="number"
                        value={ex.weight}
                        onChange={e => updateExercise(ex.id, 'weight', e.target.value)}
                      />
                      <button onClick={() => removeExercise(ex.id)} className="p-2 text-dark-muted hover:text-rose-400 ml-1">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quest Progress Preview */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-dark-muted uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-emerald-400" /> Daily Quest Progress
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Complete a Workout</span>
                <span className="text-emerald-400">100%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
          </div>

          {/* Media & Caption */}
          <div className="space-y-4">
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-dark-muted resize-none outline-none focus:border-brand-primary focus:bg-black/40 transition"
              placeholder="What did you conquer today? (Optional caption...)"
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              rows={3}
            />
            
            {imgPrev && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img src={imgPrev} alt="" className="w-full max-h-64 object-cover opacity-80" />
                <button
                  className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-rose-500 transition backdrop-blur-md"
                  onClick={() => { setImgPrev(''); setImgData(''); }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <input ref={fRef} type="file" accept="image/*,video/*" hidden onChange={handleImg} />
                <button
                  onClick={() => fRef.current?.click()}
                  disabled={compressing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-white transition"
                >
                  {compressing ? <Loader size={16} className="animate-spin text-brand-primary" /> : <ImageIcon size={16} className="text-brand-primary" />}
                  Add Media
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1">
                <Lock size={14} className="text-dark-muted" />
                <select 
                  value={privacy} 
                  onChange={e => setPrivacy(e.target.value)}
                  className="appearance-none bg-transparent text-xs font-bold text-dark-muted outline-none py-1 pr-2 cursor-pointer"
                >
                  {PRIVACY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
