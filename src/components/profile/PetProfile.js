import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PawPrint, Save, X, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';  

const EditPetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [readOnly, setReadOnly] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    color: '',
    birthDate: '',
    microchipNumber: '',
    allergies: '',
    medicalConditions: '',
    dietaryRequirements: '',
    vetName: '',
    vetPhone: '',
    ownerName: '',
    image: null
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/pets/${id}`, {
          withCredentials: true
        });
        
        const pet = response.data;
        
         
        if (user && user.username === pet.ownerName) {
          setReadOnly(false);
        } else {
          setReadOnly(true);
        }
        
        setFormData({
          name: pet.name || '',
          species: pet.species || '',
          breed: pet.breed || '',
          age: pet.age || '',
          weight: pet.weight || '',
          gender: pet.gender || '',
          color: pet.color || '',
          birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : '',
          microchipNumber: pet.microchipNumber || '',
          allergies: pet.allergies || '',
          medicalConditions: pet.medicalConditions || '',
          dietaryRequirements: pet.dietaryRequirements || '',
          vetName: pet.vetName || '',
          vetPhone: pet.vetPhone || '',
          ownerName: pet.ownerName || '',
          image: null
        });
        
        if (pet.image) {
          setImagePreview(`http://localhost:5000/${pet.image}`);
        }
      } catch (err) {
        console.error('Error fetching pet:', err);
        setError('Failed to load pet information');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id, user]);

  const handleInputChange = (e) => {
    if (readOnly) return;  
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (readOnly) return; 
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
       
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackClick = () => {
    navigate(-1); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return; 
    setSaving(true);
    setError(null);

    try {
      const submitData = new FormData();
      
       
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          submitData.append('image', formData[key]);
        } else if (key !== 'image' && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:5000/api/pets/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

       
      setShowAlert(true);
      
       
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err.response?.data?.error || 'Failed to update pet information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/pets" className="text-purple-600 hover:underline">Back to Pets</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg flex items-center">
            <span className="flex-grow">Pet profile updated successfully! 🎉</span>
            <button
              onClick={() => setShowAlert(false)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {readOnly ? 'View Pet Profile' : 'Edit Pet Profile'}
            </h1>
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5 mr-1" />
              Back
            </button>
          </div>
        </div>

        <div className="p-6">
          {readOnly && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center text-blue-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>You are viewing this profile in read-only mode. Only the owner can edit this pet's information.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Image Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Pet preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PawPrint className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {!readOnly && (
                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.name || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.species || 'N/A'}
                </div>
              ) : (
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="fish">Fish</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.breed || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.birthDate || 'N/A'}
                </div>
              ) : (
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.weight || 'N/A'}
                </div>
              ) : (
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.gender || 'N/A'}
                </div>
              ) : (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.color || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microchip Number
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.microchipNumber || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          </div>

          {/* Health Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {formData.allergies || 'N/A'}
                  </div>
                ) : (
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any known allergies..."
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {formData.medicalConditions || 'N/A'}
                  </div>
                ) : (
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any medical conditions..."
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Requirements
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {formData.dietaryRequirements || 'N/A'}
                  </div>
                ) : (
                  <textarea
                    name="dietaryRequirements"
                    value={formData.dietaryRequirements}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="List any dietary requirements..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* Veterinary Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Veterinary Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinarian Name
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {formData.vetName || 'N/A'}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="vetName"
                    value={formData.vetName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinarian Phone
                </label>
                {readOnly ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                    {formData.vetPhone || 'N/A'}
                  </div>
                ) : (
                  <input
                    type="tel"
                    name="vetPhone"
                    value={formData.vetPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Owner Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              {readOnly ? (
                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  {formData.ownerName || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          {!readOnly && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBackClick}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPetProfile;