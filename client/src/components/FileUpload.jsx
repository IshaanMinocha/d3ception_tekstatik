import React, { useState } from 'react';

import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { Upload, Check, Loader } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { Command } from '@tauri-apps/api/shell';
import { join, appDataDir } from '@tauri-apps/api/path';
import { readBinaryFile, writeBinaryFile, createDir } from '@tauri-apps/api/fs';

const axiosInstance = axios.create({
  adapter: axiosTauriApiAdapter,
});

const GradientButton = ({ children, onClick, className = "", disabled = false, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600"></span>
    <span className="absolute inset-0 opacity-0 hover:opacity-100 bg-gradient-to-r from-indigo-600 to-blue-500 transition-opacity duration-300"></span>
    <span className="relative z-10 flex items-center justify-center">{children}</span>
  </button>
);

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-white mb-4">Form Submitted Successfully</h2>
        <div className="flex justify-center items-center my-6">
          <div className="rounded-full bg-green-500 p-3">
            <Check className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>
        <p className="text-gray-300 text-center mb-6">Your blueprint has been successfully submitted.</p>
        <GradientButton onClick={onClose} className="w-full">
          Close
        </GradientButton>
      </div>
    </div>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URI;
const token = localStorage.getItem('authToken');

const BlueprintForm = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('select');
  const [showModal, setShowModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pythonOutput, setPythonOutput] = useState('');
  const [analysisImage, setAnalysisImage] = useState(null);
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

  const resetForm = () => {
    setFormData({
      height: '',
      breadth: '',
      length: '',
      floors: ''
    });
    setFile(null);
    setImageUrl(null);
    setUploadStatus('select');
    setPythonOutput('');
    setAnalysisImage(null);
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
        setShowModal(true);
        resetForm();
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const runPythonScript = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      // Get the app data directory path
      const appDataDirPath = await appDataDir();
  
      // Create a subdirectory for our app's data
      const appDataPath = await join(appDataDirPath, 'app_data');
      await createDir(appDataPath, { recursive: true });
  
      // Save the uploaded image to the app's data directory
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();
      const inputImagePath = await join(appDataPath, 'input.png');
      await writeBinaryFile(inputImagePath, new Uint8Array(imageBuffer));
  
      // Use the actual path to the Python script
      const scriptPath = 'C:\\Users\\acer\\Desktop\\Projects\\d3ception_tekstatik\\pyscripts\\blueprint-analyzer-model\\index.py';
      const scriptDir = 'C:\\Users\\acer\\Desktop\\Projects\\d3ception_tekstatik\\pyscripts\\blueprint-analyzer-model';
  
      console.log('Input Image Path:', inputImagePath);
      console.log('Script Path:', scriptPath);
  
      // Run the Python script
      const command = new Command('python', [scriptPath, inputImagePath]);
      const output = await command.execute();
      
      console.log('Python script stdout:', output.stdout);
      console.log('Python script stderr:', output.stderr);
  
      if (output.stderr.trim() !== '') {
        console.error('Python script error:', output.stderr);
        setPythonOutput(`Python script error: ${output.stderr}`);
        return;
      }
  
      let result;
      try {
        // Find the last occurrence of a valid JSON object in the output
        const jsonMatch = output.stdout.match(/\{(?:[^{}]|(\{(?:[^{}]|\1)*\}))*\}/g);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[jsonMatch.length - 1]);
        } else {
          throw new Error('No valid JSON found in the output');
        }
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        setPythonOutput(`Error parsing Python output: ${output.stdout}`);
        return;
      }finally{
        setIsAnalyzing(false);
      }
  
      setPythonOutput(JSON.stringify(result, null, 2));
      console.log('Python script output:', result);
  
      if (result.success) {
        // Read the output image from the script directory
        const outputImagePath = await join(scriptDir, 'output.png');
        try {
          const imageData = await readBinaryFile(outputImagePath);
          const blob = new Blob([imageData], { type: 'image/png' });
          const analysisImageUrl = URL.createObjectURL(blob);
          setAnalysisImage(analysisImageUrl);
        } catch (readError) {
          console.error('Error reading output image:', readError);
          setPythonOutput(prevOutput => prevOutput + '\n\nError reading output image: ' + readError.message);
        }
      } else {
        console.error('Python script error:', result.error);
        setPythonOutput(`Python script error: ${result.error}\n\nTraceback: ${result.traceback}`);
      }
    } catch (error) {
      console.error('Error running Python script:', error);
      setPythonOutput(`Error: ${error.message}`);
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

        <GradientButton onClick={runPythonScript} className="w-full" disabled={!imageUrl || isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Analyzing...
            </>
          ) : (
            'Run Blueprint Analysis'
          )}
        </GradientButton>

     

        {analysisImage && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
            <img src={analysisImage} alt="Analysis Result" className="w-full h-auto border-2 border-gray-300" />
          </div>
        )}

        <InputField name="height" label="Height (m)" type="number" value={formData.height} onChange={handleInputChange} />
        <InputField name="breadth" label="Breadth (m)" type="number" value={formData.breadth} onChange={handleInputChange} />
        <InputField name="length" label="Length (m)" type="number" value={formData.length} onChange={handleInputChange} />
        <InputField name="floors" label="Number of Floors" type="number" value={formData.floors} onChange={handleInputChange} />

        <GradientButton type="submit" className="w-full" disabled={!imageUrl}>
          Submit Form
        </GradientButton>
      </form>

      <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default BlueprintForm;