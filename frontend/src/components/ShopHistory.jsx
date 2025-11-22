import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { format } from 'date-fns';
import { History, User, ArrowRight } from 'lucide-react';

export default function ShopHistory({ shopId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetch logs specifically for this shop
                const res = await api.get(`/shops/logs/?shop_id=${shopId}`);
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };

        if (shopId) fetchLogs();
    }, [shopId]);

    if (loading) return <div className="p-4 text-sm text-gray-500">Loading history...</div>;
    
    if (logs.length === 0) return (
        <div className="p-6 text-center border rounded-lg bg-gray-50">
            <History className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
            <p className="text-gray-500 text-sm">No activity recorded for this shop yet.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-900 flex items-center">
                <History className="w-4 h-4 mr-2"/> Activity Log
            </h3>
            <div className="border-l-2 border-gray-200 ml-2 space-y-6">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                        {/* Dot on timeline */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                            log.action_type === 'CREATE' ? 'bg-green-500' : 
                            log.action_type === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    {format(new Date(log.timestamp), "MMM d, yyyy • h:mm a")}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    <span className={
                                        log.action_type === 'CREATE' ? 'text-green-700' : 
                                        log.action_type === 'DELETE' ? 'text-red-700' : 'text-blue-700'
                                    }>{log.action_type}</span> by {log.actor_name}
                                </p>
                            </div>
                        </div>

                        {/* The Changes Details */}
                        <div className="mt-2 bg-gray-50 rounded p-3 text-xs text-gray-700 border border-gray-100">
                            {log.changes.msg ? (
                                <p>{log.changes.msg}</p>
                            ) : (
                                <ul className="space-y-1">
                                    {Object.entries(log.changes).map(([field, values]) => (
                                        <li key={field} className="flex items-center gap-2"> {/* Changed space-x-2 to gap-2 for better spacing control */}
                                            
                                            {/* 1. Increased width, added shrink-0 so it doesn't squash, and truncate for safety */}
                                            <span className="font-semibold uppercase text-gray-500 text-[10px] min-w-[120px] shrink-0 truncate" title={field}>
                                                {field}:
                                            </span>

                                            {/* 2. Wrapped values in a flex container to handle overflow gracefully */}
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="line-through text-red-400 truncate max-w-[150px]">
                                                    {values.old || 'Empty'}
                                                </span>
                                                
                                                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0"/>
                                                
                                                <span className="text-green-600 font-medium truncate">
                                                    {values.new}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}