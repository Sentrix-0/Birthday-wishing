
import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import { ParticleTemplate, GestureState, BirthdayStage } from './types';
import { GESTURE_MAP, COLORS } from './constants';
import { detectGesture } from './services/gestureService';
import { Heart, Sparkles, Flower2, Zap, Palette, PartyPopper, Cake, Play } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<GestureState>({
    gesture: 'none',
    template: ParticleTemplate.HEART,
    color: COLORS[0],
    expansion: 1.0
  });

  const [birthdayStage, setBirthdayStage] = useState<BirthdayStage>(BirthdayStage.IDLE);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDetectionTime = useRef<number>(0);

  // Initialize Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCapturing(true);
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }
    setupCamera();
  }, []);

  // Periodic Gesture Detection (only active if not in birthday sequence)
  useEffect(() => {
    if (!isCapturing || birthdayStage !== BirthdayStage.IDLE) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastDetectionTime.current < 2000) return;

      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        const result = await detectGesture(base64Image);
        
        if (result.confidence > 0.6 && result.gesture !== 'none') {
          const mappedTemplate = GESTURE_MAP[result.gesture];
          if (mappedTemplate) {
            setState(prev => ({
              ...prev,
              gesture: result.gesture,
              template: mappedTemplate,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              expansion: mappedTemplate === ParticleTemplate.BLAST ? 2.5 : 1.0
            }));
          }
        }
        lastDetectionTime.current = now;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCapturing, birthdayStage]);

  // Birthday Sequence Controller
  useEffect(() => {
    if (birthdayStage === BirthdayStage.IDLE) return;

    let timeout: ReturnType<typeof setTimeout>;

    switch (birthdayStage) {
      case BirthdayStage.DYNAMIC_FLOW:
        // Automatically cycle designs for a bit
        let count = 0;
        const cycleInterval = setInterval(() => {
          const templates = [ParticleTemplate.HEART, ParticleTemplate.FLOWER, ParticleTemplate.SPIRAL, ParticleTemplate.DESIGN];
          const next = templates[count % templates.length];
          setState(prev => ({ ...prev, template: next, color: COLORS[Math.floor(Math.random() * COLORS.length)] }));
          count++;
          if (count > 4) {
            clearInterval(cycleInterval);
            setBirthdayStage(BirthdayStage.CAKE_TIME);
          }
        }, 1200);
        break;

      case BirthdayStage.CAKE_TIME:
        setState(prev => ({ ...prev, template: ParticleTemplate.CAKE, color: '#fbcfe8', expansion: 1.2 }));
        timeout = setTimeout(() => setBirthdayStage(BirthdayStage.BLOW_MESSAGE), 2500);
        break;

      case BirthdayStage.BLOW_MESSAGE:
        // The "Blow" message is rendered in the UI
        timeout = setTimeout(() => setBirthdayStage(BirthdayStage.BIRTHDAY_BLAST), 3500);
        break;

      case BirthdayStage.BIRTHDAY_BLAST:
        setState(prev => ({ 
          ...prev, 
          template: ParticleTemplate.BLAST, 
          color: COLORS[Math.floor(Math.random() * COLORS.length)], 
          expansion: 4.0 
        }));
        timeout = setTimeout(() => setBirthdayStage(BirthdayStage.FINAL_WISH), 2000);
        break;

      case BirthdayStage.FINAL_WISH:
        // Final screen state
        setState(prev => ({ ...prev, template: ParticleTemplate.HEART, color: '#ff1493', expansion: 1.5 }));
        break;
    }

    return () => clearTimeout(timeout);
  }, [birthdayStage]);

  const startBirthdayWish = () => {
    setBirthdayStage(BirthdayStage.DYNAMIC_FLOW);
  };

  const changeTemplate = (t: ParticleTemplate) => {
    if (birthdayStage !== BirthdayStage.IDLE) return;
    setState(prev => ({
      ...prev,
      template: t,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      expansion: t === ParticleTemplate.BLAST ? 2.5 : 1.0
    }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
      <Scene 
        template={state.template} 
        color={state.color} 
        expansion={state.expansion} 
      />

      {/* Camera Feed Overlay */}
      <div className="absolute top-4 right-4 w-40 h-30 border-2 border-pink-500/20 rounded-xl overflow-hidden bg-black/50 shadow-2xl backdrop-blur-sm z-20">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover grayscale opacity-40 hover:opacity-100 transition-opacity"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-pink-500/60 text-[8px] rounded text-white font-bold uppercase">
          {birthdayStage !== BirthdayStage.IDLE ? 'Auto Sequence Active' : (state.gesture === 'none' ? 'Watching...' : `Found: ${state.gesture}`)}
        </div>
      </div>

      {/* Main Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-6 pointer-events-none z-10">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 drop-shadow-2xl mb-2 animate-pulse">
            {birthdayStage === BirthdayStage.FINAL_WISH ? 'Celebration!' : 'Celestial Wishes'}
          </h1>
          <p className="text-pink-200/50 text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
            A Magical Experience For You
          </p>
        </div>

        {/* Dynamic Message Container */}
        <div className="flex flex-col items-center gap-8 min-h-[300px] justify-center text-center">
          {birthdayStage === BirthdayStage.BLOW_MESSAGE && (
            <div className="animate-bounce flex flex-col items-center gap-4">
              <div className="text-8xl">🌬️</div>
              <h2 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-pink-200 drop-shadow-[0_0_30px_rgba(255,105,180,0.8)]">
                BLOW!
              </h2>
            </div>
          )}

          {birthdayStage === BirthdayStage.FINAL_WISH && (
            <div className="animate-[scale-up_1s_ease-out] flex flex-col items-center gap-6">
              <div className="flex gap-2 text-6xl">✨💖✨</div>
              <h2 className="text-5xl md:text-7xl font-extrabold text-white text-center leading-tight drop-shadow-xl">
                Happy Birthday <br/> <span className="text-pink-400">Dear Sister</span>
              </h2>
              <p className="text-xl md:text-2xl text-pink-100/80 italic font-light">May your life be as bright as these stars...</p>
            </div>
          )}

          {birthdayStage === BirthdayStage.IDLE && (
            <div className="flex flex-col items-center gap-4 opacity-80">
               {state.template === ParticleTemplate.HEART && <Heart className="w-20 h-20 text-pink-500 fill-pink-500 animate-pulse" />}
               <p className="text-pink-100/40 uppercase tracking-widest text-xs">Waiting for your magic</p>
            </div>
          )}
        </div>

        {/* Interaction Controls */}
        <div className="w-full max-w-2xl pointer-events-auto flex flex-col items-center gap-6">
          {birthdayStage === BirthdayStage.IDLE ? (
            <>
              <button 
                onClick={startBirthdayWish}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full font-bold text-xl flex items-center gap-3 shadow-[0_0_20px_rgba(219,39,119,0.5)] hover:shadow-[0_0_40px_rgba(219,39,119,0.8)] transition-all transform hover:scale-110 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
                <Play className="fill-white" /> Start Birthday Wish
              </button>
              
              <div className="flex flex-wrap justify-center gap-3 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl">
                <button onClick={() => changeTemplate(ParticleTemplate.HEART)} className={`p-3 rounded-xl transition-all ${state.template === ParticleTemplate.HEART ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}><Heart size={20}/></button>
                <button onClick={() => changeTemplate(ParticleTemplate.FLOWER)} className={`p-3 rounded-xl transition-all ${state.template === ParticleTemplate.FLOWER ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}><Flower2 size={20}/></button>
                <button onClick={() => changeTemplate(ParticleTemplate.FIREWORKS)} className={`p-3 rounded-xl transition-all ${state.template === ParticleTemplate.FIREWORKS ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}><PartyPopper size={20}/></button>
                <button onClick={() => changeTemplate(ParticleTemplate.BLAST)} className={`p-3 rounded-xl transition-all ${state.template === ParticleTemplate.BLAST ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}><Zap size={20}/></button>
                <button onClick={() => changeTemplate(ParticleTemplate.DESIGN)} className={`p-3 rounded-xl transition-all ${state.template === ParticleTemplate.DESIGN ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}><Sparkles size={20}/></button>
                <button onClick={() => setState(s => ({...s, color: COLORS[Math.floor(Math.random()*COLORS.length)]}))} className="p-3 rounded-xl bg-white/5 hover:bg-white/10"><Palette size={20}/></button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setBirthdayStage(BirthdayStage.IDLE)} 
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium tracking-widest uppercase transition-colors"
            >
              Reset to Sandbox
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
