import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Crop,
  Sparkles,
  Sliders,
  Tv,
  EyeOff,
  Radio,
  RotateCcw,
  Film,
  Activity,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { ScoreboardRecognition } from '../../types/cricket';
import { FrameType } from '../../types/scoreboard';
import {
  extractGrayscaleThumbnail,
  computeGrayscaleHash,
  compareThumbnails,
  validateCricketPosition,
  PositionValidationResult,
} from '../../utils/scoreboardMonitor';

interface CropRegion {
  topPercent: number; // 0 to 100
  leftPercent: number; // 0 to 100
  widthPercent: number; // 0 to 100
  heightPercent: number; // 0 to 100
}

const DEFAULT_BOTTOM_CROP: CropRegion = {
  topPercent: 72,
  leftPercent: 3,
  widthPercent: 94,
  heightPercent: 24,
};

const DEFAULT_TOP_CROP: CropRegion = {
  topPercent: 4,
  leftPercent: 3,
  widthPercent: 94,
  heightPercent: 22,
};

const DEFAULT_FULL_CROP: CropRegion = {
  topPercent: 0,
  leftPercent: 0,
  widthPercent: 100,
  heightPercent: 100,
};

// Generates an authentic mock canvas image for test presets
function createBroadcastImage(text: string, subtext: string, isScoreboard: boolean): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (isScoreboard) {
    const bgGradient = ctx.createLinearGradient(0, 0, 640, 360);
    bgGradient.addColorStop(0, '#0a1d37');
    bgGradient.addColorStop(0.6, '#0f315a');
    bgGradient.addColorStop(1, '#061325');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 640, 360);

    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.ellipse(320, 240, 280, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 268, 600, 78);
    ctx.strokeStyle = '#1769AA';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 268, 600, 78);

    ctx.fillStyle = '#1769AA';
    ctx.fillRect(32, 280, 54, 52);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('IND', 42, 312);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(text, 100, 318);

    ctx.fillStyle = '#1769AA';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(subtext, 340, 316);

    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText('ICC T20 WORLD CUP • LIVE', 100, 288);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 640, 360);
    grad.addColorStop(0, '#e2e8f0');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Live Broadcast — Stadium & Crowd View', 320, 180);
    ctx.font = '13px sans-serif';
    ctx.fillText('(No scoreboard overlay present on this camera angle)', 320, 210);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const ScoreboardCameraModal: React.FC = () => {
  const {
    isScoreboardModalOpen,
    setIsScoreboardModalOpen,
    applyScoreboardDetection,
    setIsRecalibrationModalOpen,
    viewerBall,
  } = useWatch();

  const [activeTab, setActiveTab] = useState<'camera' | 'presets' | 'upload'>('camera');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Active full frame image
  const [activeImage, setActiveImage] = useState<string | null>(null);
  // Cropped scoreboard region preview
  const [croppedImagePreview, setCroppedImagePreview] = useState<string | null>(null);

  // Relative crop region (stored relative to video dimensions, 0-100%)
  const [cropRegion, setCropRegion] = useState<CropRegion>(DEFAULT_BOTTOM_CROP);
  const [cropPresetType, setCropPresetType] = useState<'bottom' | 'top' | 'full' | 'custom'>('bottom');
  const [showSliders, setShowSliders] = useState<boolean>(false);

  // Interactive mouse/pointer drawing state
  const [isDrawingCrop, setIsDrawingCrop] = useState<boolean>(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Automated monitoring states
  const [isAutoMonitoring, setIsAutoMonitoring] = useState<boolean>(false);
  const [isMonitoringPaused, setIsMonitoringPaused] = useState<boolean>(false);
  const [monitoringStatus, setMonitoringStatus] = useState<string>('Idle');
  const [lastDiffPercentage, setLastDiffPercentage] = useState<number>(0);
  const [apiCallsSavedCount, setApiCallsSavedCount] = useState<number>(0);

  // Recognition and validation results
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<ScoreboardRecognition | null>(null);
  const [validationResult, setValidationResult] = useState<PositionValidationResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Motion detection & caching refs
  const prevThumbnailRef = useRef<Uint8ClampedArray | null>(null);
  const lastAnalyzedHashRef = useRef<string | null>(null);
  const stabilityCounterRef = useRef<number>(0);
  const isAwaitingStabilityRef = useRef<boolean>(false);
  const monitorIntervalRef = useRef<any>(null);

  // Initialize with initial frame if empty
  useEffect(() => {
    if (isScoreboardModalOpen && !activeImage && !isCameraActive) {
      const initialFrame = createBroadcastImage('128/4', '17.4 ov', true);
      setActiveImage(initialFrame);
    }
  }, [isScoreboardModalOpen, activeImage, isCameraActive]);

  // Clean up camera stream and monitoring timer on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera();
      stopAutoMonitoring();
    };
  }, []);

  // Update crop preview slice whenever activeImage or cropRegion changes
  const updateCroppedPreview = useCallback(
    (srcUrl: string, region: CropRegion) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const naturalWidth = img.naturalWidth || 640;
        const naturalHeight = img.naturalHeight || 360;

        const cropX = Math.round((region.leftPercent / 100) * naturalWidth);
        const cropY = Math.round((region.topPercent / 100) * naturalHeight);
        const cropW = Math.max(10, Math.round((region.widthPercent / 100) * naturalWidth));
        const cropH = Math.max(10, Math.round((region.heightPercent / 100) * naturalHeight));

        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCroppedImagePreview(croppedDataUrl);
        }
      };
      img.src = srcUrl;
    },
    []
  );

  useEffect(() => {
    if (activeImage) {
      updateCroppedPreview(activeImage, cropRegion);
    }
  }, [activeImage, cropRegion, updateCroppedPreview]);

  // Handle Preset Crop Selection
  const handleSetCropPreset = (type: 'bottom' | 'top' | 'full' | 'custom') => {
    setCropPresetType(type);
    if (type === 'bottom') setCropRegion(DEFAULT_BOTTOM_CROP);
    else if (type === 'top') setCropRegion(DEFAULT_TOP_CROP);
    else if (type === 'full') setCropRegion(DEFAULT_FULL_CROP);
  };

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setMonitoringStatus('Camera active. Ready to monitor.');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please allow webcam permission in Chrome or use the photo upload fallback.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    stopAutoMonitoring();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture single snapshot frame from active video
  const captureFrameFromVideo = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setActiveImage(dataUrl);
    return dataUrl;
  };

  // Manual Trigger: Analyze single region
  const analyzeRegion = async (imageToCrop?: string, regionToUse?: CropRegion) => {
    let baseSource = imageToCrop || activeImage;

    // If camera is running and no active snapshot image, capture directly from video
    if (isCameraActive && videoRef.current && !imageToCrop) {
      baseSource = captureFrameFromVideo();
    }

    const activeRegion = regionToUse || cropRegion;

    if (!baseSource) {
      setScanError('Please select or capture a video frame first.');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
        img.src = baseSource!;
      });

      const canvas = document.createElement('canvas');
      const naturalWidth = img.naturalWidth || 640;
      const naturalHeight = img.naturalHeight || 360;

      const cropX = Math.round((activeRegion.leftPercent / 100) * naturalWidth);
      const cropY = Math.round((activeRegion.topPercent / 100) * naturalHeight);
      const cropW = Math.max(10, Math.round((activeRegion.widthPercent / 100) * naturalWidth));
      const cropH = Math.max(10, Math.round((activeRegion.heightPercent / 100) * naturalHeight));

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.88);

      // Call server endpoint with cropped region only
      const response = await fetch('/api/analyze-scoreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: croppedBase64 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.reason || errorData.error || `Server responded with ${response.status}`
        );
      }

      const data: ScoreboardRecognition = await response.json();
      setRecognitionResult({
        ...data,
        timestamp: Date.now(),
      });

      // Pass through Position Validation Engine
      const validation = validateCricketPosition(
        viewerBall,
        data.over,
        data.ball,
        data.confidence,
        data.frame_type || data.status,
        data.ambiguity_flags || []
      );
      setValidationResult(validation);

      // If validation confirms live continuous progression, apply sync safely
      if (validation.isValid && validation.action === 'SYNC') {
        applyScoreboardDetection(data);
      } else if (validation.action === 'HOLD') {
        applyScoreboardDetection({
          ...data,
          status: 'HOLD',
          reason: validation.reason,
        });
      } else if (validation.action === 'REJECT') {
        applyScoreboardDetection({
          ...data,
          status: 'REJECTED' as any,
          reason: validation.reason,
        });
      }
    } catch (err: any) {
      console.error('Scoreboard analysis failed:', err);
      setScanError(err.message || 'Vision recognition failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // EFFICIENT AUTOMATED MONITORING PIPELINE
  const startAutoMonitoring = () => {
    if (!isCameraActive) {
      startCamera();
    }
    setIsAutoMonitoring(true);
    setIsMonitoringPaused(false);
    setMonitoringStatus('Monitoring active • Sampling at 1.4 Hz');
    prevThumbnailRef.current = null;
    stabilityCounterRef.current = 0;
    isAwaitingStabilityRef.current = false;

    // Clear any existing timer
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);

    // Loop interval: ~700ms (1.4 Hz)
    monitorIntervalRef.current = setInterval(async () => {
      if (isMonitoringPaused || isScanning) return;
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;

      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = vWidth;
      frameCanvas.height = vHeight;
      const fCtx = frameCanvas.getContext('2d');
      if (!fCtx) return;
      fCtx.drawImage(video, 0, 0, vWidth, vHeight);

      const cropX = Math.round((cropRegion.leftPercent / 100) * vWidth);
      const cropY = Math.round((cropRegion.topPercent / 100) * vHeight);
      const cropW = Math.max(10, Math.round((cropRegion.widthPercent / 100) * vWidth));
      const cropH = Math.max(10, Math.round((cropRegion.heightPercent / 100) * vHeight));

      const currentThumbnail = extractGrayscaleThumbnail(frameCanvas, cropX, cropY, cropW, cropH, 32);

      if (!prevThumbnailRef.current) {
        prevThumbnailRef.current = currentThumbnail;
        setMonitoringStatus('Baseline thumbnail captured. Watching for delivery updates...');
        return;
      }

      const diff = compareThumbnails(currentThumbnail, prevThumbnailRef.current);
      setLastDiffPercentage(Math.round(diff * 100));
      prevThumbnailRef.current = currentThumbnail;

      const hasMeaningfulChange = diff > 0.05;

      if (hasMeaningfulChange) {
        isAwaitingStabilityRef.current = true;
        stabilityCounterRef.current = 0;
        setMonitoringStatus(`Scoreboard change detected (${Math.round(diff * 100)}% shift). Waiting for broadcast stability...`);
        return;
      }

      if (isAwaitingStabilityRef.current) {
        if (diff < 0.02) {
          stabilityCounterRef.current += 1;
        } else {
          stabilityCounterRef.current = 0;
        }

        if (stabilityCounterRef.current >= 2) {
          isAwaitingStabilityRef.current = false;
          stabilityCounterRef.current = 0;

          const imageHash = computeGrayscaleHash(currentThumbnail, 32);

          if (lastAnalyzedHashRef.current === imageHash) {
            setApiCallsSavedCount((prev) => prev + 1);
            setMonitoringStatus('Scoreboard stable. Hash matches cached state (no duplicate AI call needed).');
            return;
          }

          lastAnalyzedHashRef.current = imageHash;
          setMonitoringStatus('Scoreboard stabilized. Scanning broadcast delivery...');

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cCtx = cropCanvas.getContext('2d');
          if (cCtx) {
            cCtx.drawImage(frameCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const cropBase64 = cropCanvas.toDataURL('image/jpeg', 0.88);
            analyzeRegion(cropBase64, cropRegion);
          }
        }
      }
    }, 700);
  };

  const stopAutoMonitoring = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    setIsAutoMonitoring(false);
    setIsMonitoringPaused(false);
    setMonitoringStatus('Monitoring stopped.');
  };

  const togglePauseMonitoring = () => {
    setIsMonitoringPaused((prev) => {
      const next = !prev;
      setMonitoringStatus(next ? 'Monitoring paused by user.' : 'Monitoring resumed.');
      return next;
    });
  };

  // Interactive Drag-to-Draw Crop Box on Preview Container
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setIsDrawingCrop(true);
    setDragStartPoint({ x: xPct, y: yPct });
    setCropPresetType('custom');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingCrop || !dragStartPoint || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const currentXPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currentYPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const left = Math.min(dragStartPoint.x, currentXPct);
    const top = Math.min(dragStartPoint.y, currentYPct);
    const width = Math.max(5, Math.abs(currentXPct - dragStartPoint.x));
    const height = Math.max(5, Math.abs(currentYPct - dragStartPoint.y));

    setCropRegion({
      leftPercent: Math.round(left),
      topPercent: Math.round(top),
      widthPercent: Math.round(width),
      heightPercent: Math.round(height),
    });
  };

  const handlePointerUp = () => {
    setIsDrawingCrop(false);
    setDragStartPoint(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setScanError('Image file is larger than 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setActiveImage(dataUrl);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  // Test with preset frames
  const handleTestClearScoreboard = () => {
    const clearImg = createBroadcastImage('128/4', '17.4 ov', true);
    setActiveImage(clearImg);
    setCropRegion(DEFAULT_BOTTOM_CROP);
    setCropPresetType('bottom');
    setTimeout(() => {
      analyzeRegion(clearImg, DEFAULT_BOTTOM_CROP);
    }, 150);
  };

  const handleTestNoScoreboard = () => {
    const noScoreImg = createBroadcastImage('', '', false);
    setActiveImage(noScoreImg);
    setCropRegion(DEFAULT_FULL_CROP);
    setCropPresetType('full');
    setTimeout(() => {
      analyzeRegion(noScoreImg, DEFAULT_FULL_CROP);
    }, 150);
  };

  const renderFrameTypeBadge = (type?: FrameType) => {
    switch (type) {
      case 'LIVE_SCORE':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EAF3FB] border border-[#1769AA]/30 px-3 py-1 text-xs font-bold text-[#0B4F83]">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#1769AA]" />
            <span>LIVE_SCORE</span>
          </span>
        );
      case 'REPLAY':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
            <Film className="h-3.5 w-3.5 text-amber-600" />
            <span>REPLAY (HOLD)</span>
          </span>
        );
      case 'AD':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
            <Tv className="h-3.5 w-3.5 text-amber-600" />
            <span>ADVERTISEMENT (HOLD)</span>
          </span>
        );
      case 'GRAPHIC':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
            <Sliders className="h-3.5 w-3.5 text-sky-600" />
            <span>GRAPHIC / STATS</span>
          </span>
        );
      case 'NO_SCOREBOARD':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700">
            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
            <span>NO_SCOREBOARD</span>
          </span>
        );
      case 'UNREADABLE':
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-300 px-3 py-1 text-xs font-bold text-rose-800">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>UNREADABLE</span>
          </span>
        );
    }
  };

  if (!isScoreboardModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#DCE5EF] bg-white p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5EF] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF3FB] text-[#1769AA] ring-1 ring-[#1769AA]/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#111111]">
                  Scoreboard Webcam Monitor
                </h2>
                {isAutoMonitoring && (
                  <span className="flex items-center gap-1 rounded-full bg-[#EAF3FB] border border-[#1769AA]/30 px-2 py-0.5 text-[10px] font-bold text-[#0B4F83]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA] animate-ping" />
                    <span>AUTO MONITORING</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#475569]">
                Smart change detection & optical scoreboard recognition
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              setIsScoreboardModalOpen(false);
            }}
            className="rounded-lg p-1.5 text-[#475569] hover:bg-[#F5F8FC] hover:text-[#111111] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Methods Tab Switcher */}
        <div className="mt-3 flex rounded-xl bg-[#F5F8FC] p-1 border border-[#DCE5EF]">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              activeTab === 'camera'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111111]'
            }`}
          >
            Webcam Monitor
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('presets');
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              activeTab === 'presets'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111111]'
            }`}
          >
            Verification Tests
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              activeTab === 'upload'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111111]'
            }`}
          >
            Upload Photo
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto mt-3.5 space-y-4 pr-1">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F5F8FC] p-2.5 border border-[#DCE5EF]">
                <div className="flex items-center gap-2">
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1.5 rounded-lg bg-[#1769AA] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0B4F83] transition shadow-xs"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={stopCamera}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-2xs"
                      >
                        <X className="h-3.5 w-3.5 text-rose-600" />
                        <span>Stop Camera</span>
                      </button>

                      <button
                        onClick={() => captureFrameFromVideo()}
                        className="flex items-center gap-1.5 rounded-lg bg-white border border-[#DCE5EF] px-3 py-1.5 text-xs font-bold text-[#111111] hover:bg-[#F5F8FC] transition shadow-2xs"
                      >
                        <Camera className="h-3.5 w-3.5 text-[#1769AA]" />
                        <span>Capture Frame</span>
                      </button>

                      {/* Auto Monitoring Controls */}
                      {!isAutoMonitoring ? (
                        <button
                          onClick={startAutoMonitoring}
                          className="flex items-center gap-1.5 rounded-lg bg-[#1769AA] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0B4F83] transition shadow-xs"
                          title="Monitor webcam locally and scan scoreboard only when delivery updates"
                        >
                          <Activity className="h-3.5 w-3.5" />
                          <span>Start Auto-Monitor</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={togglePauseMonitoring}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                              isMonitoringPaused
                                ? 'bg-amber-500 text-white'
                                : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                            }`}
                          >
                            {isMonitoringPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
                            <span>{isMonitoringPaused ? 'Resume' : 'Pause'}</span>
                          </button>
                          <button
                            onClick={stopAutoMonitoring}
                            className="rounded-lg bg-white border border-[#DCE5EF] px-2 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#111111]"
                          >
                            Stop Monitor
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Recalibrate & Fallback */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsScoreboardModalOpen(false);
                      setIsRecalibrationModalOpen(true);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-[#DCE5EF] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:text-[#111111] hover:bg-[#F5F8FC] transition shadow-2xs"
                    title="Manually adjust over & ball"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Manual Recalibrate</span>
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{cameraError}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="rounded bg-white border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 underline"
                  >
                    Upload Image Fallback
                  </button>
                </div>
              )}

              {/* Monitoring Status Strip */}
              {isCameraActive && (
                <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Activity className={`h-4 w-4 ${isAutoMonitoring && !isMonitoringPaused ? 'text-[#1769AA] animate-spin' : 'text-slate-400'}`} />
                    <span className="font-semibold">{monitoringStatus}</span>
                  </div>
                  {isAutoMonitoring && (
                    <div className="flex items-center gap-3 text-[11px] font-mono-numbers text-[#475569]">
                      <span>Shift: <strong className={lastDiffPercentage > 5 ? 'text-[#0B4F83]' : 'text-[#111111]'}>{lastDiffPercentage}%</strong></span>
                      <span>Calls Saved: <strong className="text-[#0B4F83]">{apiCallsSavedCount}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sample Broadcast Feeds:
                </span>
                <span className="text-[11px] text-[#475569] font-medium">Try a sample frame</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleTestClearScoreboard}
                  className="flex items-center justify-between rounded-xl border border-[#1769AA]/30 bg-[#EAF3FB] p-3 text-left transition hover:border-[#1769AA] hover:bg-[#d8eaf7] shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-[#0B4F83]">
                      1. Live Broadcast Scoreboard
                    </span>
                    <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
                      IND 128/4 at Over 17.4 (Live broadcast scoreboard)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#1769AA]">Load frame &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestNoScoreboard}
                  className="flex items-center justify-between rounded-xl border border-[#DCE5EF] bg-white p-3 text-left transition hover:border-slate-400 hover:bg-[#F5F8FC] shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      2. Stadium & Crowd Angle
                    </span>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      Stadium view with no score overlay
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#475569]">Load frame &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DCE5EF] bg-[#F5F8FC] p-6 text-center">
              <Upload className="h-8 w-8 text-[#1769AA] mb-2" />
              <h3 className="text-xs font-bold text-[#111111]">Upload TV Screen Photo</h3>
              <p className="text-[11px] text-[#475569] max-w-xs mt-1">
                Upload a JPEG or PNG photo of your television broadcast ticker (up to 5MB).
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex items-center gap-1.5 rounded-xl border border-[#DCE5EF] bg-white px-4 py-2 text-xs font-bold text-[#111111] hover:bg-[#EAF3FB] hover:border-[#1769AA] hover:text-[#0B4F83] shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Choose Image File</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {scanError && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{scanError}</span>
            </div>
          )}

          {/* INTERACTIVE VIDEO / IMAGE PREVIEW WITH DRAGGABLE RECTANGULAR CROP */}
          {(isCameraActive || activeImage) && (
            <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE5EF] pb-3">
                <div className="flex items-center gap-2">
                  <Crop className="h-4 w-4 text-[#1769AA]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Scoreboard Crop Area (Draw or Select)
                  </span>
                </div>

                {/* Region Presets & Adjustment Toggle */}
                <div className="flex rounded-lg bg-[#F5F8FC] p-1 border border-[#DCE5EF] text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetCropPreset('bottom')}
                    className={`rounded px-2.5 py-1 font-semibold transition ${
                      cropPresetType === 'bottom'
                        ? 'bg-[#1769AA] text-white shadow-2xs font-bold'
                        : 'text-[#475569] hover:text-[#111111]'
                    }`}
                  >
                    Bottom Strip (TV)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCropPreset('top')}
                    className={`rounded px-2.5 py-1 font-semibold transition ${
                      cropPresetType === 'top'
                        ? 'bg-[#1769AA] text-white shadow-2xs font-bold'
                        : 'text-[#475569] hover:text-[#111111]'
                    }`}
                  >
                    Top Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCropPreset('full')}
                    className={`rounded px-2.5 py-1 font-semibold transition ${
                      cropPresetType === 'full'
                        ? 'bg-[#1769AA] text-white shadow-2xs font-bold'
                        : 'text-[#475569] hover:text-[#111111]'
                    }`}
                  >
                    Full Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSliders(!showSliders)}
                    className={`rounded px-2.5 py-1 font-semibold flex items-center gap-1 transition ${
                      showSliders
                        ? 'bg-[#1769AA] text-white shadow-2xs font-bold'
                        : 'text-[#475569] hover:text-[#111111]'
                    }`}
                    title="Fine-tune crop box sliders"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Adjust Sliders</span>
                  </button>
                </div>
              </div>

              {/* Sliders for precise adjustment */}
              {showSliders && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] mb-1">
                      Vertical Top: {cropRegion.topPercent}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={cropRegion.topPercent}
                      onChange={(e) => {
                        setCropRegion((prev) => ({ ...prev, topPercent: Number(e.target.value) }));
                        setCropPresetType('custom');
                      }}
                      className="w-full accent-[#1769AA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] mb-1">
                      Height: {cropRegion.heightPercent}%
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={60}
                      value={cropRegion.heightPercent}
                      onChange={(e) => {
                        setCropRegion((prev) => ({ ...prev, heightPercent: Number(e.target.value) }));
                        setCropPresetType('custom');
                      }}
                      className="w-full accent-[#1769AA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] mb-1">
                      Horizontal Left: {cropRegion.leftPercent}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={cropRegion.leftPercent}
                      onChange={(e) => {
                        setCropRegion((prev) => ({ ...prev, leftPercent: Number(e.target.value) }));
                        setCropPresetType('custom');
                      }}
                      className="w-full accent-[#1769AA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] mb-1">
                      Width: {cropRegion.widthPercent}%
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={cropRegion.widthPercent}
                      onChange={(e) => {
                        setCropRegion((prev) => ({ ...prev, widthPercent: Number(e.target.value) }));
                        setCropPresetType('custom');
                      }}
                      className="w-full accent-[#1769AA]"
                    />
                  </div>
                </div>
              )}

              {/* Live Preview Container with Interactive Drag-to-Draw */}
              <div
                ref={previewContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="mt-3 relative rounded-xl overflow-hidden border border-[#DCE5EF] bg-black aspect-[16/9] max-h-64 flex items-center justify-center cursor-crosshair select-none"
                title="Click and drag to draw a custom scoreboard crop box"
              >
                {/* Live video feed if camera is active */}
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <img
                    src={activeImage || ''}
                    alt="Broadcast frame preview"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                )}

                {/* Scoreboard Crop Bounding Box (Relative Percentages) */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${cropRegion.topPercent}%`,
                    left: `${cropRegion.leftPercent}%`,
                    width: `${cropRegion.widthPercent}%`,
                    height: `${cropRegion.heightPercent}%`,
                  }}
                  className="border-2 border-dashed border-[#1769AA] bg-[#1769AA]/25 pointer-events-none rounded transition-all shadow-[0_0_12px_rgba(23,105,170,0.35)]"
                >
                  <span className="absolute -top-5 left-1 text-[9px] font-bold text-white bg-[#0B4F83] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                    Scoreboard ROI ({cropRegion.widthPercent}% × {cropRegion.heightPercent}%)
                  </span>
                </div>

                <div className="absolute top-2 right-2 bg-white/90 border border-[#DCE5EF] px-2 py-1 rounded text-[10px] text-slate-800 font-mono pointer-events-none backdrop-blur shadow-2xs">
                  Drag on video to draw box
                </div>
              </div>

              {/* Cropped Region Slice Preview (What is actually analyzed) */}
              {croppedImagePreview && (
                <div className="mt-3 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1.5 font-medium">
                    <span>Targeted Scoreboard Crop (Analyzed region only):</span>
                    <span className="text-[#0B4F83] font-mono-numbers font-bold">
                      {Math.round(cropRegion.widthPercent)}% × {Math.round(cropRegion.heightPercent)}% slice
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-[#DCE5EF] bg-black flex items-center justify-center max-h-20">
                    <img
                      src={croppedImagePreview}
                      alt="Cropped scoreboard region"
                      className="max-h-20 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Trigger Single Analysis Button */}
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => analyzeRegion()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1769AA] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0B4F83] disabled:opacity-40 shadow-xs"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Scanning broadcast scoreboard...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Analyze Scoreboard Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* POSITION VALIDATION & RECOGNITION OUTPUT */}
          {recognitionResult && (
            <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 sm:p-5 space-y-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE5EF] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#1769AA]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Extraction Output
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderFrameTypeBadge(recognitionResult.frame_type)}
                  <span className="text-xs font-mono-numbers text-[#475569]">
                    Confidence:{' '}
                    <strong className="text-[#111111]">
                      {(recognitionResult.confidence * 100).toFixed(0)}%
                    </strong>{' '}
                    ({recognitionResult.confidence.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Position Validation Status Banner */}
              {validationResult && (
                <div
                  className={`rounded-xl border p-3 text-xs flex items-center gap-2.5 ${
                    validationResult.isValid
                      ? 'border-[#1769AA]/30 bg-[#EAF3FB] text-[#0B4F83]'
                      : validationResult.action === 'HOLD'
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-rose-300 bg-rose-50 text-rose-800'
                  }`}
                >
                  {validationResult.isValid ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#1769AA]" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] block">
                      Match Delivery Check: {validationResult.action}
                    </span>
                    <span className="text-[11px] font-medium">{validationResult.reason}</span>
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 text-center shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Score</span>
                  <p className="mt-1 font-mono-numbers text-xl font-black text-[#111111]">
                    {recognitionResult.runs !== null && recognitionResult.wickets !== null
                      ? `${recognitionResult.runs}/${recognitionResult.wickets}`
                      : 'null'}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {recognitionResult.runs !== null ? `${recognitionResult.runs} runs` : 'No runs'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#1769AA]/30 bg-[#EAF3FB] p-3 text-center shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#0B4F83]">Over & Ball</span>
                  <p className="mt-1 font-mono-numbers text-xl font-black text-[#0B4F83]">
                    {recognitionResult.over !== null && recognitionResult.ball !== null
                      ? `${recognitionResult.over}.${recognitionResult.ball}`
                      : 'null'}
                  </p>
                  <span className="text-[10px] text-[#1769AA] font-semibold">
                    {recognitionResult.over !== null
                      ? `Over ${recognitionResult.over}, Ball ${recognitionResult.ball}`
                      : 'Unconfirmed'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 text-center shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Innings</span>
                  <p className="mt-1 font-mono-numbers text-xl font-black text-[#111111]">
                    {recognitionResult.innings !== null ? `Inn ${recognitionResult.innings}` : 'null'}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {recognitionResult.innings === 2 ? 'Chasing target' : 'Batting first'}
                  </span>
                </div>

                <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 text-center shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Frame State</span>
                  <p className="mt-1 font-mono-numbers text-xs font-bold text-[#111111] truncate">
                    {recognitionResult.frame_type}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {recognitionResult.frame_type === 'LIVE_SCORE'
                      ? 'Safe to unlock'
                      : 'Held in lock'}
                  </span>
                </div>
              </div>

              {/* Verbatim Visible Score Text */}
              <div className="rounded-xl bg-[#F5F8FC] p-3 border border-[#DCE5EF] text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 shadow-2xs">
                <span className="text-[#475569] font-medium">Verbatim Scoreboard Text:</span>
                <span className="font-mono text-[#111111] font-bold">
                  {recognitionResult.visible_score_text
                    ? `"${recognitionResult.visible_score_text}"`
                    : 'null (None visible)'}
                </span>
              </div>

              {/* Ambiguity Warnings */}
              {recognitionResult.ambiguity_flags && recognitionResult.ambiguity_flags.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Ambiguity Flags Triggered:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {recognitionResult.ambiguity_flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white border border-amber-300 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#DCE5EF] pt-3">
          <button
            type="button"
            disabled={isScanning}
            onClick={() => analyzeRegion()}
            className="flex items-center gap-1.5 rounded-xl border border-[#DCE5EF] bg-white px-4 py-2 text-xs font-bold text-[#111111] hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83] disabled:opacity-40 transition shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Analyze Again</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setIsScoreboardModalOpen(false);
              }}
              className="rounded-xl border border-[#DCE5EF] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F5F8FC]"
            >
              Close
            </button>

            <button
              type="button"
              disabled={!recognitionResult || isScanning}
              onClick={() => {
                if (recognitionResult) {
                  applyScoreboardDetection(recognitionResult);
                }
                setIsScoreboardModalOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#1769AA] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0B4F83] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Apply to Match Stream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
