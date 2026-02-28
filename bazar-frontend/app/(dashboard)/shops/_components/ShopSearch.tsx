"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ShopFilters {
    search: string;
    category: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    minRating: string;
    nearestOnly?: boolean;
}

interface ShopSearchProps {
    categories: any[];
    onFiltersChange: (filters: ShopFilters) => void;
}

export default function ShopSearch({ categories = [], onFiltersChange }: ShopSearchProps) {
    const [filters, setFilters] = useState<ShopFilters>({
        search: "",
        category: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
        nearestOnly: false,
    });

    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (field: keyof ShopFilters, value: string | boolean) => {
        const updatedFilters = {
            ...filters,
            [field]: value,
        };
        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    };

    const handleReset = () => {
        const emptyFilters = {
            search: "",
            category: "",
            location: "",
            minPrice: "",
            maxPrice: "",
            minRating: "",
            nearestOnly: false,
        };
        setFilters(emptyFilters);
        onFiltersChange(emptyFilters);
        setShowFilters(false);
    };

    const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search shops by name or description..."
                        value={filters.search}
                        onChange={(e) => handleChange("search", e.target.value)}
                        className="pl-12 pr-4 py-3 rounded-full bg-white border-2 border-transparent focus:border-[#8f7e4f] text-base"
                    />
                </div>
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-[#8f7e4f] text-white text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <Card className="p-6 bg-white/95 backdrop-blur-sm border border-[#efefef]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#2c2416]">Filters</h3>
                            <Button
                                onClick={handleReset}
                                variant="ghost"
                                className="text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Reset All
                            </Button>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2c2416] mb-2">
                                Category
                            </label>
                            <Select value={filters.category} onValueChange={(value) => handleChange("category", value)}>
                                <SelectTrigger className="border-[#d4c5a0] focus:border-[#8f7e4f]">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => {
                                        const value = cat._id || cat.categoryId || "";
                                        const label = cat.name || cat.categoryName || "";
                                        if (!value || !label) {
                                            return null;
                                        }
                                        return (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2c2416] mb-2">
                                Location
                            </label>
                            <Input
                                placeholder="Search by location..."
                                value={filters.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                className="border-[#d4c5a0] focus:border-[#8f7e4f]"
                            />
                        </div>

                        {/* Price Range Filter */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#2c2416] mb-2">
                                    Min Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={filters.minPrice}
                                    onChange={(e) => handleChange("minPrice", e.target.value)}
                                    className="border-[#d4c5a0] focus:border-[#8f7e4f]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#2c2416] mb-2">
                                    Max Price
                                </label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleChange("maxPrice", e.target.value)}
                                    className="border-[#d4c5a0] focus:border-[#8f7e4f]"
                                />
                            </div>
                        </div>

                        {/* Minimum Rating Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2c2416] mb-2">
                                Minimum Rating
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                        key={rating}
                                        onClick={() => handleChange("minRating", filters.minRating === rating.toString() ? "" : rating.toString())}
                                        variant={filters.minRating === rating.toString() ? "default" : "outline"}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            filters.minRating === rating.toString()
                                                ? "bg-[#8f7e4f] text-white"
                                                : "border-[#d4c5a0] text-[#2c2416] hover:bg-[#8f7e4f]/10"
                                        }`}
                                    >
                                        <span className="text-yellow-400 text-lg">★</span>
                                        {rating}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={filters.nearestOnly || false}
                                onChange={e => handleChange("nearestOnly", e.target.checked)}
                            />
                            Show only nearest shops
                        </label>
                    </div>
                        {/* Apply Button */}
                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() => setShowFilters(false)}
                                className="flex-1 bg-[#8f7e4f] text-white hover:bg-[#7a6b45] rounded-full"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
