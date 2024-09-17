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
              <span className="flex font-bold justify-center items-center my-4">
                <FaSpinner className="animate-spin mr-2 text-3xl" /> In progress...
              </span>
            )}
            {status === 'SUCCEEDED' && ' Success!'}
            {status === 'PENDING' && ' Still Pending'}
          </p>
          {status === 'IN_PROGRESS' && <p className='text-2xl text-center'>Progress: {progress}%</p>}
        </div>
      )}

      {/* <model-viewer
        // src="https://assets.meshy.ai/google-oauth2%7C115507272937322081344/tasks/0191f33b-6948-7b95-87fe-b48414b51abb/output/model.glb?Expires=1726621960&Signature=KCCsMbxJhR4JTAnoylCMtKu42GeFRaF6trBo41da~pfVwr5-7~PljF3nQ93bB-rmwtDQbJX2N~V2oFXFboJSOlsSQWb2SwhkSY425PnFsG~y9k93I856yki~ufO5aSVe0J8PWlHZABKoQcYvtqJ1nOHpKfHwLAKUCvq7Vsdkg-OqWt3Y6xgkNNDniLTFFPtiuvI3lD~Hd~fggfGSak72-yCg7jT7sCr-eXU9ngNNYo~hg3Ye2Q-FuRgxvylaHUoy9czJ2zqs4Grhuua6f-hdRqxlmWcDRThhwrr8a9GAuy3TZKAemNJbqHjn6zpA4Dc6reBR7b0B4VQNR3La54JOtA__&Key-Pair-Id=KL5I0C8H7HX83"
        src="model.glb"
        style={{
          width: '80%',
          margin: "20px auto 20px auto",
          height: '400px',
          backgroundColor: '#3d35b1',
          '--poster-color': '#ffffff00',
        }}
        ios-src="https://cdn.glitch.com/36cb8393-65c6-408d-a538-055ada20431b/Astronaut.usdz?v=1569545377878"
        poster="loading.gif"
        alt="mgcms"
        shadow-intensity="1"
        camera-controls
        auto-rotate
        ar
      /> */}
      {status === 'SUCCEEDED' && downloadLink && (
        <div className="mt-5 mb-20">
          <a href={downloadLink} download className="bg-blue-500 text-white rounded-xl py-2 px-5">Download 3D Model</a>
        </div>
      )}
    </div>
  );
}

export default ImgTo3d;
