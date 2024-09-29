import React from 'react'
import FileUpload from '../components/FileUpload'

function Dashboard() {
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <FileUpload />
    </div>
  )
}

export default Dashboard