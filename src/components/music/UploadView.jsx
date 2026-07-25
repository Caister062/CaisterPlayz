import React, { useState } from 'react';
import { CheckCircle, Upload as UploadIcon, Music, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';

export default function UploadView({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the copyright terms before uploading.");
      return;
    }
    if (!audioFile) {
      setError("Please select an audio file.");
      return;
    }
    if (!title) {
      setError("Please enter a track title.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload audio
      const audioPath = `${user?.id || 'guest'}/${Date.now()}_${audioFile.name}`;
      const { error: audioUploadError } = await supabase.storage
        .from('music-assets')
        .upload(audioPath, audioFile);
      
      if (audioUploadError) throw audioUploadError;

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('music-assets')
        .getPublicUrl(audioPath);

      // Upload cover if exists
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${user?.id || 'guest'}/${Date.now()}_${coverFile.name}`;
        const { error: coverUploadError } = await supabase.storage
          .from('music-assets')
          .upload(coverPath, coverFile);
          
        if (coverUploadError) throw coverUploadError;
        
        const { data: { publicUrl: cUrl } } = supabase.storage
          .from('music-assets')
          .getPublicUrl(coverPath);
        coverUrl = cUrl;
      }

      // Insert into database
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title,
          description,
          artist_id: user?.id,
          artist_name: user?.displayName || user.name || 'Unknown Artist',
          audio_url: audioUrl,
          cover_url: coverUrl,
          play_count: 0,
          liked_by: []
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setTitle('');
      setDescription('');
      setAudioFile(null);
      setCoverFile(null);
      setAgreed(false);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="upload-view centered">
        <CheckCircle size={64} color="#10b981" />
        <h2>Track Uploaded!</h2>
        <p>Your track is now live on CaisterPlayz Music.</p>
        <button className="btn primary" onClick={() => setSuccess(false)}>Upload Another</button>
      </div>
    );
  }

  return (
    <div className="upload-view">
      <div className="upload-header">
        <h1>Upload Track</h1>
        <p>Share your original music with the world.</p>
      </div>

      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label>Track Title *</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Midnight Cruising"
            required
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Tell us about this track..."
            className="text-input textarea"
          />
        </div>

        <div className="file-inputs">
          <div className="file-upload-box">
            <label className="file-label">
              <Music size={24} />
              <span>{audioFile ? audioFile.name : 'Select Audio File (MP3/WAV) *'}</span>
              <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} hidden required />
            </label>
          </div>

          <div className="file-upload-box">
            <label className="file-label">
              <ImageIcon size={24} />
              <span>{coverFile ? coverFile.name : 'Select Cover Art (JPG/PNG)'}</span>
              <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} hidden />
            </label>
          </div>
        </div>

        <div className="copyright-agreement">
          <AlertTriangle size={24} color="#f59e0b" className="warning-icon" />
          <div className="agreement-text">
            <h4>Copyright & Content Policy</h4>
            <p>
              By checking the box below, you legally agree that you own 100% of the rights to the audio file you are uploading, 
              including the instrumental and vocals. Uploading copyrighted material without permission will result in an immediate 
              ban and removal of your content.
            </p>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={e => setAgreed(e.target.checked)} 
              />
              <span>I agree to the Terms of Service and confirm this is my original music.</span>
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn primary upload-submit-btn" disabled={isUploading || !agreed}>
          {isUploading ? 'Uploading...' : <><Upload size={20} /> Publish Track</>}
        </button>
      </form>
    </div>
  );
}
