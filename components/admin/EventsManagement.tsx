"use client";

import React, { useState } from 'react';
import EventForm from './EventForm';

const EventsManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Events Management</h2>
          <p className="text-sm text-slate-400 mt-1">Create and manage your experiences</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-pink-500 hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">
            {showForm ? 'close' : 'add_circle'}
          </span>
          {showForm ? 'Close Form' : 'Create New Event'}
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <EventForm
          onSuccess={() => {
            setShowForm(false);
            // You could add a refetch events here
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Events List Placeholder */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-pink-500">event</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Events Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Get started by creating your first event. Click the "Create New Event" button above to begin.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-pink-500 hover:bg-pink-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Create Your First Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
