import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { generateGoogleCalendarUrl, generateICalData } from '../utils/calendarUtils';
import { ExternalLink, RefreshCw, MapPin, AlignLeft, Clock, Type, Download } from 'lucide-react';

interface EventEditorProps {
  initialData: CalendarEvent;
  onReset: () => void;
}

const EventEditor: React.FC<EventEditorProps> = ({ initialData, onReset }) => {
  const [formData, setFormData] = useState<CalendarEvent>(initialData);

  // Sync state if prop changes (though usually we reconstruct this component)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof CalendarEvent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDownloadIcs = () => {
    const icsContent = generateICalData(formData);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Sanitize filename
    const filename = (formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event') + '.ics';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calendarUrl = generateGoogleCalendarUrl(formData);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-800">Event Details</h2>
        <button 
          onClick={onReset}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          title="Start Over"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-5 flex-grow">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 font-medium"
          />
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Starts
            </label>
            <input
              type="datetime-local"
              // Convert ISO string to datetime-local format (YYYY-MM-DDThh:mm)
              value={formData.startDate.slice(0, 16)}
              onChange={(e) => handleChange('startDate', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <div className="space-y-1.5">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Ends
            </label>
            <input
              type="datetime-local"
              value={formData.endDate.slice(0, 16)}
              onChange={(e) => handleChange('endDate', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700"
            placeholder="Add a location"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700 resize-none"
            placeholder="Add details"
          />
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a 
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <span>Google Calendar</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={handleDownloadIcs}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all hover:shadow-sm"
        >
          <span>Download iCal</span>
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EventEditor;
