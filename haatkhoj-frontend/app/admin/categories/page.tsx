"use client";

import { useState, useEffect } from "react";
import { Tags, CloudDownload, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleGetAllCategories, handleCreateCategory, handleDeleteCategory } from "@/lib/actions/category-action";
import { handleFetchSourceCategories } from "@/lib/actions/aggregation-action";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSource, setFetchingSource] = useState(false);
    const [sourceCategories, setSourceCategories] = useState<Record<string, string[]>>({});
    const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
    const [newCategoryName, setNewCategoryName] = useState("");

    const fetchCategories = async () => {
        setLoading(true);
        const res = await handleGetAllCategories();
        if (res.success && res.data) {
            setCategories(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onFetchSource = async () => {
        setFetchingSource(true);
        const res = await handleFetchSourceCategories();
        if (res.success && res.data) {
            setSourceCategories(res.data);
        }
        setFetchingSource(false);
    };

    const toggleSourceSelection = (catName: string) => {
        const next = new Set(selectedSources);
        if (next.has(catName)) next.delete(catName);
        else next.add(catName);
        setSelectedSources(next);
    };

    const onSaveSelected = async () => {
        setLoading(true);
        for (const catName of selectedSources) {
            // Only add if not already exists in UI
            if (!categories.find(c => c.categoryName === catName)) {
                await handleCreateCategory({ categoryName: catName });
            }
        }
        setSelectedSources(new Set());
        setSourceCategories({});
        await fetchCategories();
        setLoading(false);
    };

    const onCreateManual = async () => {
        if (!newCategoryName.trim()) return;
        setLoading(true);
        await handleCreateCategory({ categoryName: newCategoryName });
        setNewCategoryName("");
        await fetchCategories();
        setLoading(false);
    };

    const onDelete = async (id: string) => {
        setLoading(true);
        await handleDeleteCategory(id);
        await fetchCategories();
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-[#142A1C]">Category Management</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Import Card */}
                <Card className="border-gray-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CloudDownload className="w-5 h-5 text-[#267A4C]" />
                            Import from Sources
                        </CardTitle>
                        <CardDescription>
                            Fetch official category lists from scraper sources (e.g., NepalYP) and import them directly into HaatKhoj.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            onClick={onFetchSource} 
                            disabled={fetchingSource}
                            className="bg-[#267A4C] hover:bg-[#1C5C39] text-white w-full"
                        >
                            <CloudDownload className={`w-4 h-4 mr-2 ${fetchingSource ? 'animate-bounce' : ''}`} />
                            {fetchingSource ? "Fetching..." : "Fetch Categories from Sources"}
                        </Button>

                        {Object.entries(sourceCategories).map(([source, cats]) => (
                            <div key={source} className="mt-4 border rounded-xl p-4 bg-gray-50 max-h-64 overflow-y-auto">
                                <h3 className="font-semibold text-gray-700 mb-2">{source}</h3>
                                <div className="space-y-2">
                                    {cats.map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSources.has(cat)}
                                                onChange={() => toggleSourceSelection(cat)}
                                                className="rounded border-gray-300 text-[#267A4C] focus:ring-[#267A4C]"
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {selectedSources.size > 0 && (
                            <Button 
                                onClick={onSaveSelected} 
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Save {selectedSources.size} Categories to Database
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* DB Categories Card */}
                <Card className="border-gray-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="w-5 h-5 text-[#267A4C]" />
                            Database Categories
                        </CardTitle>
                        <CardDescription>
                            Categories currently available in HaatKhoj for shops and users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add custom category..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:border-[#267A4C] focus:outline-none"
                            />
                            <Button onClick={onCreateManual} disabled={loading || !newCategoryName.trim()} className="bg-[#267A4C] hover:bg-[#1C5C39]">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="border rounded-xl divide-y bg-white max-h-96 overflow-y-auto">
                            {categories.length === 0 ? (
                                <p className="p-4 text-center text-sm text-gray-500">No categories found.</p>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat._id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                        <span className="text-sm font-medium text-gray-700">{cat.categoryName || cat.name}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => onDelete(cat._id)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
