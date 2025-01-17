import React from 'react';
import { Lead } from '../types';
import { Phone, Mail, Building, Tag, Calendar } from 'lucide-react';

type Props = {
  leads: Lead[];
};

export const GridView: React.FC<Props> = ({ leads }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <div key={lead.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                <p className="text-sm text-gray-500">{lead.company}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                lead.status === 'New' ? 'bg-green-100 text-green-800' :
                lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                lead.status === 'Qualified' ? 'bg-blue-100 text-blue-800' :
                lead.status === 'Closed Won' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {lead.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {lead.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {lead.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                {lead.industry}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="w-4 h-4 mr-2" />
                {lead.source}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Last Contact: {new Date(lead.lastContact).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-lg font-semibold text-indigo-600">
                ${lead.value.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};