import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

const axiosInstance = axios.create({
  adapter: axiosTauriApiAdapter,
});

const GradientButton = ({ children, onClick, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600"></span>
    <span className="absolute inset-0 opacity-0 hover:opacity-100 bg-gradient-to-r from-indigo-600 to-blue-500 transition-opacity duration-300"></span>
    <span className="relative z-10 flex items-center justify-center">{children}</span>
  </button>
);

const backendUrl = import.meta.env.VITE_BACKEND_URI;
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTZlNGFlZGY2Mzg1MWM2NGQwZDlmZCIsImlhdCI6MTcyNjc0NDcwMiwiZXhwIjoxNzI5MzM2NzAyfQ.Q_JFrLX1HxBHSKkIMPVvNnpAM9RYs8J_dQp9vtE8DCY';

const BlueprintForm = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('select');

  const [formData, setFormData] = useState({
    height: '',
    breadth: '',
    length: '',
    floors: ''
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('select');
  };

  const handleImageUpload = async () => {
    if (!file) return alert('Please choose a blueprint file.');

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);

    try {
      const response = await axios.post(`${backendUrl}/upload/blueprint`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      setImageUrl(response.data.image_url);
      setIsUploading(false);
      setUploadStatus('done');
    } catch (error) {
      console.error('Failed to upload image:', error);
      setIsUploading(false);
      setUploadStatus('error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert('Please upload the blueprint first.');

    try {
      const response = await axiosInstance.post(`${backendUrl}/blueprint/submit`, {
        ...formData,
        imageUrl
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        console.log('Form submitted successfully');
       
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      
    }
  };

  const InputField = ({ name, label, type = "text", value, onChange }) => (
    <div className="mb-4 relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col min-h-[100vh] items-center justify-center bg-gray-900 text-white p-6">
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Blueprint Upload Form</h2>

        <div className="space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          <GradientButton onClick={handleImageUpload} className="w-full" disabled={isUploading || !file}>
            {isUploading ? 'Uploading...' : 'Upload Blueprint'}
          </GradientButton>

          {imageUrl && (
            <div className="mt-4">
              <p>Blueprint uploaded successfully. <a href={imageUrl} target='_blank' className='underline text-blue-400'>View Blueprint Online</a></p>
              <img
                src={imageUrl}
                alt="Uploaded Blueprint Preview"
                className="mt-2 w-full h-auto border-2 border-gray-300"
              />
            </div>
          )}
        </div>

        <InputField name="height" label="Height (m)" type="number" value={formData.height} onChange={handleInputChange} />
        <InputField name="breadth" label="Breadth (m)" type="number" value={formData.breadth} onChange={handleInputChange} />
        <InputField name="length" label="Length (m)" type="number" value={formData.length} onChange={handleInputChange} />
        <InputField name="floors" label="Number of Floors" type="number" value={formData.floors} onChange={handleInputChange} />

        <GradientButton onClick={handleSubmit} className="w-full" disabled={!imageUrl}>
          Submit Form
        </GradientButton>
      </form>
    </div>
  );
};

export default BlueprintForm;