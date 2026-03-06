
import React from 'react';
 
const ActivityTimelinePage = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Your Activity History</h1>
      
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-12 relative">
          {MOCK_ACTIVITIES.map((activity, index) => (
            <div key={activity.id} className="flex items-start">
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-2xl ${index === 0 ? 'ring-4 ring-indigo-50' : ''}`}>
                {activity.type === 'LOGIN' ? '🔑' : activity.type === 'SKILL_ADDED' ? '✨' : '🏆'}
              </div>
              <div className="ml-8 pt-2">
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest leading-none mb-1">{activity.type.replace('_', ' ')}</p>
                <h3 className="text-xl font-bold text-gray-800">{activity.description}</h3>
                <p className="text-gray-500 text-sm mt-1">{activity.timestamp}</p>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 italic">"System log recorded successful interaction."</p>
                </div>
              </div>
            </div>
          ))}

          {/* Just to make the timeline look longer/better for the demo */}
          <div className="flex items-start opacity-50">
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-2xl">
              📝
            </div>
            <div className="ml-8 pt-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Registration</p>
              <h3 className="text-xl font-bold text-gray-400">Welcome to UniClub!</h3>
              <p className="text-gray-400 text-sm mt-1">1 month ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimelinePage;
