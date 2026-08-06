import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';

function NoProjectState() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="no-project-state">
      <FolderPlus size={40} color="#9ca3af" />
      <h3>No project selected</h3>
      <p className="muted-text">Create your first project to start adding tasks.</p>
      <button className="add-task-btn" onClick={() => setShowModal(true)}>
        + Create Project
      </button>
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default NoProjectState;
