import React, { useState, useEffect } from 'react';
import { FiPlus, FiUsers, FiSettings, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import teamService from '../../services/teamService';
import organizationService from '../../services/organizationService';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', organization_id: '' });
  const [editingTeam, setEditingTeam] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, orgsData] = await Promise.all([
        teamService.getTeams(),
        organizationService.getOrganizations()
      ]);
      setTeams(teamsData);
      setOrganizations(orgsData);
      if (orgsData.length > 0) {
        setFormData(prev => ({ ...prev, organization_id: orgsData[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.organization_id) return;
    
    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam.id, {
          name: formData.name,
          description: formData.description
        });
        toast.success('Team updated');
      } else {
        await teamService.createTeam(formData.organization_id, {
          name: formData.name,
          description: formData.description
        });
        toast.success('Team created');
      }
      setShowModal(false);
      setFormData({ name: '', description: '', organization_id: organizations.length > 0 ? organizations[0].id : '' });
      setEditingTeam(null);
      fetchData();
    } catch (error) {
      toast.error(editingTeam ? 'Failed to update team' : 'Failed to create team');
    }
  };

  const handleEditClick = (e, team) => {
    e.stopPropagation();
    setEditingTeam(team);
    setFormData({ name: team.name, description: team.description || '', organization_id: team.organization_id });
    setShowModal(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await teamService.deleteTeam(id);
        toast.success("Team deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete team");
      }
    }
  };

  return (
    <div className="teams-page page-content">
      <header className="page-header animate-slide-up">
        <div>
          <h2>Teams</h2>
          <p>Manage your teams and collaborate efficiently.</p>
        </div>
        <button className="btn-primary" onClick={() => { 
          setEditingTeam(null); 
          setFormData({ name: '', description: '', organization_id: organizations.length > 0 ? organizations[0].id : '' }); 
          setShowModal(true); 
        }}>
          <FiPlus />
          New Team
        </button>
      </header>

      <section className="org-list animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : teams.length === 0 ? (
          <div className="empty-state">No teams found.</div>
        ) : (
          <div className="card-grid">
            {teams.map(team => (
              <div key={team.id} className="org-card glass" onClick={() => navigate(`/teams/${team.id}`)} style={{ position: 'relative' }}>
                <div className="org-icon"><FiUsers /></div>
                <h3>{team.name}</h3>
                <p>{team.description}</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button className="btn-action-3d edit" onClick={(e) => handleEditClick(e, team)} title="Edit"><FiEdit2 /></button>
                  <button className="btn-action-3d delete" onClick={(e) => handleDeleteClick(e, team.id)} title="Delete"><FiTrash2 /></button>
                </div>
                <button className="btn-text-small" style={{marginTop: '10px'}}><FiSettings /> Manage</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>{editingTeam ? 'Edit Team' : 'Create Team'}</h2>
            </div>
            <form className="task-form" onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label>Organization</label>
                <select 
                  value={formData.organization_id} 
                  onChange={e => setFormData({...formData, organization_id: e.target.value})}
                  required
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Team Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g., Engineering Team" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="2"
                  placeholder="Short description..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { 
                  setShowModal(false); 
                  setEditingTeam(null); 
                  setFormData({ name: '', description: '', organization_id: organizations.length > 0 ? organizations[0].id : '' }); 
                }}>Cancel</button>
                <button type="submit" className="btn-primary">{editingTeam ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
