import React, { useState } from 'react';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { FaSpinner } from 'react-icons/fa';

const axiosInstance = axios.create({
  adapter: axiosTauriApiAdapter,
});

function ImgTo3d() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URI;

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTYzMzgzNzFlNTQ0ZGI0NDYwMmM0ZiIsImlhdCI6MTcyNjU5MDAxNywiZXhwIjoxNzI5MTgyMDE3fQ.i-ULGZQxbJomdtGka0WfyWn6Al5hVFHoHIAFYSkiqnw';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      // console.log(response.data.model.meshyId)
      pollForModel(response.data.model.meshyId);
    } catch (error) {
      console.error('Failed to create task:', error);
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
        // console.log(response.data)

        setStatus(status);
        setProgress(response.data.progress);
        // console.log(response.data.progress)

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
    <div className="flex flex-col gap-10 justify-center items-center">
      <h2 className="text-2xl font-bold text-center my-10">Blueprint to 3D Model</h2>

      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleImageUpload}
        className="border-2 border-white p-2"
        disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {imageUrl && (
        <div className="mt-5 flex flex-col justify-center items-center gap-10">
          <p>Image uploaded successfully. URL: <a href={imageUrl} target='_blank' className='underline text-blue-400'>View Image Online</a></p>
          <img
            src={imageUrl}
            alt="Uploaded Image Preview"
            className="mt-4 w-1/3 h-auto border-2 border-gray-300"
          />
          <button
            onClick={handleSubmit}
            className="border-2 border-white p-2"
            disabled={isCreating}>
            {isCreating ? 'Creating 3D Model...' : 'Create 3D Model'}
          </button>
        </div>
      )}

      {taskId && (
        <div className="my-5">
          <p className="text-lg">Task ID: <span className='text-xl'>{taskId}</span></p>
          <p>
            Status: 
            {status === 'IN_PROGRESS' && (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" /> Work in progress...
              </span>
            )}
            {status === 'SUCCEEDED' && ' Success!'}
            {status === 'PENDING' && ' Still Pending'}
          </p>
          {status === 'IN_PROGRESS' && <p>Progress: {progress}%</p>}
        </div>
      )}

      {status === 'SUCCEEDED' && downloadLink && (
        <div className="mt-5 mb-20">
          <a href={downloadLink} download className="bg-blue-500 text-white rounded-xl py-2 px-5">Download 3D Model</a>
        </div>
      )}
    </div>
  );
}

export default ImgTo3d;
