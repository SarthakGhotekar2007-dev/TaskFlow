import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiBriefcase, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import organizationService from '../../services/organizationService';
import './Organizations.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!orgName) return;
    try {
      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, { name: orgName });
        toast.success('Organization updated');
      } else {
        await organizationService.createOrganization({ name: orgName });
        toast.success('Organization created');
      }
      setShowModal(false);
      setOrgName('');
      setEditingOrg(null);
      fetchOrgs();
    } catch (error) {
      toast.error(editingOrg ? 'Failed to update organization' : 'Failed to create organization');
    }
  };

  const handleEditClick = (org) => {
    setEditingOrg(org);
    setOrgName(org.name);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        await organizationService.deleteOrganization(id);
        toast.success("Organization deleted");
        fetchOrgs();
      } catch (error) {
        toast.error("Failed to delete organization");
      }
    }
  };

  return (
    <div className="organizations-page page-content">
      <header className="page-header animate-slide-up">
        <div>
          <h2>Organizations</h2>
          <p>Manage your companies and workspaces.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingOrg(null); setOrgName(''); setShowModal(true); }}>
          <FiPlus />
          New Organization
        </button>
      </header>

      <section className="org-list animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : organizations.length === 0 ? (
          <div className="empty-state">No organizations found.</div>
        ) : (
          <div className="card-grid">
            {organizations.map(org => (
              <div key={org.id} className="org-card glass" style={{ position: 'relative' }}>
                <div className="org-icon"><FiBriefcase /></div>
                <h3>{org.name}</h3>
                <p>Created: {new Date(org.created_at).toLocaleDateString()}</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button className="btn-action-3d edit" onClick={() => handleEditClick(org)} title="Edit"><FiEdit2 /></button>
                  <button className="btn-action-3d delete" onClick={() => handleDeleteClick(org.id)} title="Delete"><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>{editingOrg ? 'Edit Organization' : 'Create Organization'}</h2>
            </div>
            <form className="task-form" onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label>Organization Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g., Acme Corp" 
                  value={orgName} 
                  onChange={e => setOrgName(e.target.value)} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingOrg(null); setOrgName(''); }}>Cancel</button>
                <button type="submit" className="btn-primary">{editingOrg ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
