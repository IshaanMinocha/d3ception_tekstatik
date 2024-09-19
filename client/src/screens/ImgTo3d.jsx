import React, { useState, useRef } from 'react';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { FaSpinner, FaUpload, FaCube, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const axiosInstance = axios.create({
  adapter: axiosTauriApiAdapter,
});

function ImgTo3d() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URI;
  const token = localStorage.getItem('authToken');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);

    if (droppedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleImageUpload = async () => {
    if (!file) return alert('Please upload an image.');

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
    } catch (error) {
      console.error('Failed to upload image:', error);
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl) return alert('Please upload the image first.');

    setIsCreating(true);

    try {
      const response = await axiosInstance.post(`${backendUrl}/model/create-task`, {
        imageUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setTaskId(response.data.model.meshyId);
      pollForModel(response.data.model.meshyId);
    } catch (error) {
      console.error('Failed to create task:', error);
      setIsCreating(false);
    }
  };

  const pollForModel = (id) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${backendUrl}/model/get-model/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const { status, model } = response.data.model;

        setStatus(status);
        setProgress(response.data.progress);

        if (status === 'SUCCEEDED') {
          setDownloadLink(model.glb);
          clearInterval(intervalId);
          setIsCreating(false);
        }
      } catch (error) {
        console.error('Error polling model:', error);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Blueprint to 3D Model</h2>

        <div className="space-y-6">
          <div
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaUpload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleImageUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            disabled={isUploading || !file}
          >
            {isUploading ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {imageUrl && (
            <div className="mt-6 space-y-4">
              <p className="text-center">Image uploaded successfully. <a href={imageUrl} target='_blank' className='underline text-blue-400 hover:text-blue-300'>View Image Online</a></p>
              <img
                src={imageUrl}
                alt="Uploaded Image Preview"
                className="mx-auto max-w-full h-auto border-2 border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                disabled={isCreating}
              >
                {isCreating ? <FaSpinner className="animate-spin mr-2" /> : <FaCube className="mr-2" />}
                {isCreating ? 'Creating 3D Model...' : 'Create 3D Model'}
              </button>
            </div>
          )}

          {taskId && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-lg mb-2">Task ID: <span className='font-mono text-xl'>{taskId}</span></p>
              <div className="flex items-center">
                <p className="mr-2">Status:</p>
                {status === 'IN_PROGRESS' && (
                  <span className="flex items-center text-yellow-400">
                    <FaSpinner className="animate-spin mr-2" /> In progress...
                  </span>
                )}
                {status === 'SUCCEEDED' && (
                  <span className="flex items-center text-green-400">
                    <FaCheck className="mr-2" /> Success!
                  </span>
                )}
                {status === 'PENDING' && (
                  <span className="flex items-center text-blue-400">
                    <FaExclamationTriangle className="mr-2" /> Pending
                  </span>
                )}
              </div>
              {status === 'IN_PROGRESS' && (
                <div className="mt-4">
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className='text-center mt-2'>Progress: {progress}%</p>
                </div>
              )}
            </div>
          )}

          {status === 'SUCCEEDED' && downloadLink && (
            <div className="mt-6 text-center">
              <a
                href={downloadLink}
                download
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
              >
                Download 3D Model
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImgTo3d;