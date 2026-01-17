import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newProfile, setNewProfile] = useState({
        name: '',
        email: '',
        profile: '',
        profilePic: null,
    });
    const [error, setError] = useState('');
    const { apiBase } = useContext(ThemeContext);

    // Fetch user profile data
    useEffect(() => {
        const token = localStorage.getItem('token');
            if (token) {
                    axios.get(`${apiBase}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Send token in Authorization header
                }
            })
            .then(res => {
                setUserData(res.data);  // Set user data to display on profile
                setNewProfile({
                    name: res.data.name,
                    email: res.data.email,
                    profile: res.data.profile || '',
                    profilePic: res.data.profilePic || null,
                });
            })
            .catch(err => {
                setError('Error fetching profile data');
            });
        } else {
            setError('Please log in');
        }
    }, []);

    // Handle profile updates
    const handleProfileUpdate = () => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', newProfile.name);
        formData.append('email', newProfile.email);
        formData.append('profile', newProfile.profile);
        if (newProfile.profilePic) formData.append('profilePic', newProfile.profilePic);

        axios.put(`${apiBase}/api/auth/profile`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(res => {
            setUserData(res.data);
            setIsEditing(false);  // Switch back to view mode
        })
        .catch(err => {
            setError('Error updating profile');
        });
    };

    if (error) return <div className="alert alert-danger">{error}</div>;

    if (!userData) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2>{isEditing ? 'Edit Profile' : `Welcome, ${userData.name}`}</h2>

                    <form>
                        {/* Profile Picture */}
                        <div className="text-center mb-4">
                            <img
                                src={userData.profilePic || 'default-avatar.jpg'}
                                alt="Profile"
                                className="rounded-circle"
                                width="150"
                            />
                            {isEditing && (
                                <div className="mt-3">
                                    <label className="btn btn-primary">
                                        Update Profile Picture
                                        <input
                                            type="file"
                                            className="d-none"
                                            onChange={(e) => setNewProfile({ ...newProfile, profilePic: e.target.files[0] })}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="form-group">
                            <label htmlFor="formName">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formName"
                                value={newProfile.name}
                                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="formEmail">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="formEmail"
                                value={newProfile.email}
                                onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Profile Bio */}
                        <div className="form-group">
                            <label htmlFor="formProfile">Profile</label>
                            <textarea
                                className="form-control"
                                id="formProfile"
                                rows="3"
                                value={newProfile.profile}
                                onChange={(e) => setNewProfile({ ...newProfile, profile: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div className="mt-3">
                            {isEditing ? (
                                <>
                                    <button type="button" className="btn btn-primary" onClick={handleProfileUpdate}>
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ml-2"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
