import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ImgTo3d() {
  const [file, setFile] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return alert('Please upload an image.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTYzMzgzNzFlNTQ0ZGI0NDYwMmM0ZiIsImlhdCI6MTcyNjM2MjQ5OSwiZXhwIjoxNzI4OTU0NDk5fQ.bl1i0kb0Ik_eczRy9kaXp8On70fvCVWROD6Zjf2shE8';  //will be taken from local storage after sujal setups auth
      const response = await axios.post('http://localhost:5000/create-task', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setTaskId(response.data.model.meshyId);
      pollForModel(response.data.model.meshyId);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const pollForModel = (id) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get-model/${id}`);
        const { status, progress, model_urls } = response.data.model;

        setStatus(status);
        setProgress(progress);

        if (status === 'SUCCEEDED') {
          setDownloadLink(model_urls.glb);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling model:', error);
      }
    }, 2000);
  };

  return (
    <div>
      <h2>Image to 3D Converter</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload and Create 3D Model Task</button>
      {taskId && (
        <div>
          <p>Task ID: {taskId}</p>
          <p>Status: {status}</p>
          {status === 'IN_PROGRESS' && <p>Progress: {progress}%</p>}
        </div>
      )}
      {status === 'SUCCEEDED' && downloadLink && (
        <div>
          <a href={downloadLink} download>Download 3D Model</a>
        </div>
      )}
    </div>
  );
}

export default ImgTo3d;
