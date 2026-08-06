import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useProjects } from '../context/ProjectContext';
import NoProjectState from '../components/NoProjectState';

function Files() {
  const { currentProject, currentProjectId, loading: projectsLoading } = useProjects();
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchFiles = () => {
    if (!currentProjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/files', { ...authHeader, params: { projectId: currentProjectId } })
      .then((res) => setFiles(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/dashboard', authHeader).then((res) => setProfile(res.data.profile)).catch(() => navigate('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];

    setError('');
    if (!file) {
      setError('Please choose a file first.');
      return;
    }
    if (!note.trim()) {
      setError('Please explain why this file is needed before uploading.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', currentProjectId);
    formData.append('note', note.trim());

    try {
      await api.post('/files/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const previous = files;
    setFiles((prev) => prev.filter((f) => f._id !== id));
    try {
      await api.delete(`/files/${id}`, authHeader);
    } catch (err) {
      setFiles(previous);
      setError('Failed to delete file.');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  if (!projectsLoading && !currentProjectId) {
    return (
      <AppLayout profile={profile}>
        <NoProjectState />
      </AppLayout>
    );
  }

  return (
    <AppLayout profile={profile}>
      <div className="page-container">
        <h2>Files — {currentProject?.name}</h2>
        <p className="muted-text">
          Every file must include a short note explaining why it's needed — this keeps the
          project's files relevant and searchable.
        </p>

        <form className="files-upload-box" onSubmit={handleUpload}>
          <input type="file" ref={fileInputRef} disabled={uploading} />
          <input
            type="text"
            placeholder="Why is this file needed? (required)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="files-note-input"
          />
          <button type="submit" className="add-task-btn" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="muted-text">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="muted-text">No files uploaded to this project yet.</p>
        ) : (
          <div className="files-list">
            {files.map((f) => (
              <div className="file-row" key={f._id}>
                <div className="file-info">
                  <div>{f.originalName}</div>
                  <div className="muted-text">
                    {formatSize(f.size)} · {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                  <div className="file-note">"{f.note}"</div>
                </div>
                <button className="btn-link btn-danger" onClick={() => handleDelete(f._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Files;
