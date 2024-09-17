import React, { useState, useRef } from 'react';
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

const BlueprintForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('select');
  const inputRef = useRef();

  const [formData, setFormData] = useState({
    height: '',
    breadth: '',
    length: '',
    floors: ''
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus('select');
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setUploadStatus('select');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axiosInstance.post(`${backendUrl}/blueprint/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200) {
        setUploadStatus('done');
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`${backendUrl}/blueprint/submit`, {
        ...formData,
        // fileId: selectedFile ? selectedFile.name : null
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
    <div className="relative flex flex-col min-h-[100vh] items-center justify-center  bg-gray-900 text-white p-6">
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Blueprint Upload Form</h2>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <GradientButton onClick={onChooseFile} className="w-full h-36">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 mb-2" />
                <span className="text-lg">Choose Blueprint</span>
              </div>
            </GradientButton>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <h6 className="text-sm font-medium truncate">{selectedFile.name}</h6>
                {uploadStatus === 'select' && (
                  <button type="button" onClick={clearFileInput} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {uploadStatus === 'done' && (
                  <div className="text-green-500">
                    <Check className="h-6 w-6" />
                  </div>
                )}
              </div>
              {uploadStatus !== 'done' && (
                <GradientButton onClick={handleUpload} className="w-full" disabled={uploadStatus === 'uploading'}>
                  {uploadStatus === 'select' ? "Upload Blueprint" : "Uploading..."}
                </GradientButton>
              )}
              {uploadStatus === 'done' && (
                <GradientButton className="w-full" disabled>
                  <Check className="w-6 h-6 text-green-500" /> Uploaded
                </GradientButton>
              )}
            </div>
          )}
        </div>

        <InputField name="height" label="Height (m)" type="number" value={formData.height} onChange={handleInputChange} />
        <InputField name="breadth" label="Breadth (m)" type="number" value={formData.breadth} onChange={handleInputChange} />
        <InputField name="length" label="Length (m)" type="number" value={formData.length} onChange={handleInputChange} />
        <InputField name="floors" label="Number of Floors" type="number" value={formData.floors} onChange={handleInputChange} />

        <GradientButton onClick={handleSubmit} className="w-full">
          Submit Form
        </GradientButton>
      </form>
    </div>
  );
};

export default BlueprintForm;