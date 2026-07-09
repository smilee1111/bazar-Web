"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCcw, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleTriggerAggregation } from "@/lib/actions/aggregation-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";

export default function AggregationPage() {
    const [loading, setLoading] = useState(false);
    const [statusLogs, setStatusLogs] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    
    useEffect(() => {
        const fetchCategories = async () => {
            const res = await handleGetAllCategories();
            if (res.success && res.data) {
                setCategories(res.data);
                if (res.data.length > 0) {
                    setSelectedCategory(res.data[0]._id);
                }
            }
        };
        fetchCategories();
    }, []);

    const onTrigger = async () => {
        if (!selectedCategory) {
            setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Failed: Please select a category first.`]);
            return;
        }

        setLoading(true);
        setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering NepalYP Crawler for category...`]);
        const res = await handleTriggerAggregation(selectedCategory);
        
        if (res.success) {
            setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Success: ${res.message}`]);
            if (res.data) {
                setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Data: ${JSON.stringify(res.data)}`]);
            }
        } else {
            setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Failed: ${res.message}`]);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#2D2318]">Data Import</h1>
            
            <Card className="border-gray-100 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#8B6F47]" />
                        Aggregation Control
                    </CardTitle>
                    <CardDescription>
                        Manually trigger the crawler to fetch new shops and details from external directories (e.g. NepalYP). This process runs asynchronously.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Category</label>
                        <select 
                            className="w-full md:w-1/2 rounded-lg border-gray-300 border p-2 text-sm focus:border-[#8B6F47] focus:outline-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={loading || categories.length === 0}
                        >
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.categoryName || cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button 
                        onClick={onTrigger} 
                        disabled={loading || !selectedCategory}
                        className="bg-[#8B6F47] hover:bg-[#7D5A3F] text-white"
                    >
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? "Running..." : "Trigger Crawler"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-md bg-gray-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="w-5 h-5 text-gray-500" />
                        Operation Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-xl min-h-64 font-mono text-sm overflow-y-auto max-h-96">
                        {statusLogs.length === 0 ? (
                            <span className="text-gray-500">Waiting for trigger...</span>
                        ) : (
                            statusLogs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
