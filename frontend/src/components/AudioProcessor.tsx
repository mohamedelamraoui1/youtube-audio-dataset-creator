import { useState, useEffect } from 'react';
import { api, AudioRequest, AudioResponse } from '../services/api';
import { Youtube, FileAudio, Languages, Users, Scissors, Clock, CheckCircle2, XCircle, AlertCircle, Info, Sparkles, TrendingUp } from 'lucide-react';

const AudioProcessor = () => {
  const [formData, setFormData] = useState<AudioRequest>({
    url: '',
    language: 'french',
    title: '',
    gender: 'men',
    quality_checked: false,
    trim_start: 20,
    trim_end: 20,
    segment_duration: 7,
  });

  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [segmentUnit, setSegmentUnit] = useState<'minutes' | 'seconds'>('minutes');
  const [analyzeQuality, setAnalyzeQuality] = useState(true);

  // Quality checklist state
  const [qualityChecks, setQualityChecks] = useState({
    noBackgroundSound: false,
    onlyOnePerson: false,
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await api.getLanguages();
      setLanguages(data.languages);
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let finalValue: any = value;
    
    // Convert segment_duration to minutes if in seconds
    if (name === 'segment_duration') {
      const numValue = parseFloat(value);
      finalValue = segmentUnit === 'seconds' ? numValue / 60 : numValue;
    }
    
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleCheckboxChange = (name: 'noBackgroundSound' | 'onlyOnePerson') => {
    setQualityChecks((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setProgress('');

    // Validation
    if (!formData.url) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!formData.title) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setProgress('Downloading audio from YouTube... (0%)');

    try {
      setTimeout(() => setProgress('Downloading audio... (25%)'), 1000);
      if (analyzeQuality) {
        setTimeout(() => setProgress('Analyzing audio quality... (50%)'), 2000);
        setTimeout(() => setProgress('Trimming and splitting audio... (75%)'), 3000);
      } else {
        setTimeout(() => setProgress('Trimming and splitting audio... (50%)'), 2000);
        setTimeout(() => setProgress('Almost done... (75%)'), 3000);
      }
      
      const response = await api.processAudio({
        ...formData,
        quality_checked: qualityChecks.noBackgroundSound && qualityChecks.onlyOnePerson,
        analyze_quality: analyzeQuality,
      });
      setProgress('Processing complete! (100%)');
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process audio');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const getQualityIndicator = (value: boolean | null) => {
    if (value === null) return <AlertCircle className="w-5 h-5 text-yellow-400 inline" />;
    return value ? <CheckCircle2 className="w-5 h-5 text-green-400 inline" /> : <XCircle className="w-5 h-5 text-orange-400 inline" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* App Description */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Audio Dataset Creator</h2>
        </div>
        <p className="text-gray-300 mb-3">
          This tool helps you create high-quality audio datasets for speech recognition projects, 
          model training, Kaggle competitions, and speech processing research.
        </p>
        <div className="bg-blue-900/30 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <p className="text-blue-200 font-semibold">Recommended Source: TED Talks</p>
          </div>
          <p className="text-sm text-blue-300">
            Search YouTube for "TED [language]" to find excellent single-speaker, 
            high-quality audio content perfect for training datasets. TED videos have clear speech, 
            minimal background noise, and professional audio quality.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* YouTube URL Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Youtube className="w-4 h-4" />
              YouTube URL *
            </label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FileAudio className="w-4 h-4" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., french_lesson_1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Language and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Languages className="w-4 h-4" />
                Language *
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.entries(languages).map(([key, label]) => {
                  let displayLabel = label;
                  if (key === 'japanese') displayLabel = '日本語 (Japanese)';
                  if (key === 'chinese') displayLabel = '中文 (Chinese)';
                  return (
                    <option key={key} value={key}>
                      {displayLabel}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4" />
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>
          </div>

          {/* Trim Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Scissors className="w-4 h-4" />
                Trim Start (seconds) *
              </label>
              <input
                type="number"
                name="trim_start"
                value={formData.trim_start}
                onChange={handleInputChange}
                min="0"
                max="400"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">Seconds to remove from start</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Scissors className="w-4 h-4" />
                Trim End (seconds) *
              </label>
              <input
                type="number"
                name="trim_end"
                value={formData.trim_end}
                onChange={handleInputChange}
                min="0"
                max="400"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">Seconds to remove from end</p>
            </div>
          </div>

          {/* Audio Quality Analysis Toggle */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={analyzeQuality}
                onChange={(e) => setAnalyzeQuality(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                disabled={loading}
              />
              <div className="flex-1">
                <span className="text-white font-medium">Analyze Audio Quality</span>
                <p className="text-xs text-gray-400 mt-1">
                  Check for background noise and speech patterns (adds ~30-60 seconds to processing)
                </p>
              </div>
            </label>
          </div>

          {/* Segment Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Segment Duration *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="segment_duration"
                value={segmentUnit === 'minutes' ? formData.segment_duration : (formData.segment_duration || 0) * 60}
                onChange={handleInputChange}
                min={segmentUnit === 'minutes' ? "0.5" : "30"}
                max={segmentUnit === 'minutes' ? "60" : "3600"}
                step={segmentUnit === 'minutes' ? "0.5" : "1"}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <select
                value={segmentUnit}
                onChange={(e) => setSegmentUnit(e.target.value as 'minutes' | 'seconds')}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="minutes">Minutes</option>
                <option value="seconds">Seconds</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {segmentUnit === 'minutes' 
                ? 'Duration of each audio segment in minutes (e.g., 7 or 5.5)' 
                : 'Duration of each audio segment in seconds (e.g., 420 for 7 min)'}
            </p>
          </div>

          {/* Quality Checklist */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quality Checklist
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Please verify these conditions before processing:
            </p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qualityChecks.noBackgroundSound}
                  onChange={() => handleCheckboxChange('noBackgroundSound')}
                  className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={loading}
                />
                <span className="text-gray-300">
                  ✓ No background music or sound
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qualityChecks.onlyOnePerson}
                  onChange={() => handleCheckboxChange('onlyOnePerson')}
                  className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={loading}
                />
                <span className="text-gray-300">
                  ✓ Only one person speaking
                </span>
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {loading && progress && (
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">{progress}</p>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: progress.includes('0%') ? '0%' : 
                           progress.includes('25%') ? '25%' : 
                           progress.includes('50%') ? '50%' : 
                           progress.includes('75%') ? '75%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Process Audio'
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Success Message */}
            <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg">
              <p className="text-green-200 font-semibold">{result.message}</p>
            </div>

            {/* Audio Quality Analysis */}
            {result.audio_checks && !result.audio_checks.error && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Audio Quality Analysis
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    {getQualityIndicator(result.audio_checks.has_low_bg_noise)}{' '}
                    Low Background Noise:{' '}
                    {result.audio_checks.has_low_bg_noise ? 'Yes' : 'No'}
                  </p>
                  <p>
                    {getQualityIndicator(result.audio_checks.likely_single_speaker)}{' '}
                    Likely Single Speaker:{' '}
                    {result.audio_checks.likely_single_speaker ? 'Yes' : 'No'}
                  </p>
                  {result.audio_checks.speech_ratio !== null && (
                    <p>
                      Speech Activity: {(result.audio_checks.speech_ratio * 100).toFixed(1)}%
                    </p>
                  )}
                  {result.audio_checks.quality_score !== undefined && result.audio_checks.quality_score !== null && (
                    <p>
                      Overall Quality Score: {(result.audio_checks.quality_score * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Skipped Quality Analysis Message */}
            {!analyzeQuality && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <p className="text-blue-200">
                  <Info className="w-4 h-4 inline mr-2" />
                  Audio quality analysis was skipped for faster processing
                </p>
              </div>
            )}

            {/* Generated Files */}
            {result.files.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Generated Files ({result.files.length})
                </h3>
                <ul className="space-y-2">
                  {result.files.map((file, index) => (
                    <li
                      key={index}
                      className="text-gray-300 bg-gray-800 px-4 py-2 rounded"
                    >
                      📄 {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-300">Processing Info</h3>
        </div>
        <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
          <li>First and last segments will be trimmed based on your settings</li>
          <li>Audio will be split into segments of your specified duration</li>
          <li>Audio files: data/[language]/[title]_[language]_[gender]_part[N].wav</li>
          <li>Captions/Scripts: data/[language]/script/[title]_[language]_[gender]_part[N].txt</li>
          <li>Audio quality analysis helps verify single speaker and low background noise</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioProcessor;
