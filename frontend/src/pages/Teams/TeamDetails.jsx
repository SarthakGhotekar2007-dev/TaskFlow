import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getDisplayName } from '../../utils/userUtils';
import teamService from '../../services/teamService';
import './Teams.css'; // Uses general Team styles

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [inviteData, setInviteData] = useState({ user_id: '', role: 'Member' });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamMembers(id);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteData.user_id) return;
    try {
      await teamService.addTeamMember(id, inviteData.user_id, inviteData.role);
      toast.success('Member added');
      setShowModal(false);
      setInviteData({ user_id: '', role: 'Member' });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await teamService.removeTeamMember(id, userId);
      toast.success('Member removed');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="teams-page page-content">
      <header className="page-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="icon-btn-small" onClick={() => navigate('/teams')}><FiArrowLeft /></button>
          <div>
            <h2>Team Details</h2>
            <p>Manage team members and roles.</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiUserPlus />
          Add Member
        </button>
      </header>

      <section className="members-list animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '15px' }}>Members</h3>
          {loading ? (
            <div>Loading...</div>
          ) : members.length === 0 ? (
            <div>No members found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {members.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {getDisplayName(member.user).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{getDisplayName(member.user)}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{member.role}</div>
                    </div>
                  </div>
                  <button className="icon-btn-small delete" onClick={() => handleRemove(member.user_id)}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Add Team Member</h2>
            </div>
            <form className="task-form" onSubmit={handleInvite}>
              <div className="form-group">
                <label>User ID</label>
                <input 
                  required 
                  type="number" 
                  placeholder="Enter user ID to add..." 
                  value={inviteData.user_id} 
                  onChange={e => setInviteData({...inviteData, user_id: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={inviteData.role} 
                  onChange={e => setInviteData({...inviteData, role: e.target.value})}
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;
