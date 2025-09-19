import React from 'react';

const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-slate-700 animate-pulse rounded ${className}`} />
);

export const TableSkeleton = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <SkeletonLine className="h-10 w-1/3" />
            <SkeletonLine className="h-10 w-24" />
        </div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                    <SkeletonLine className="h-8 w-1/3" />
                    <SkeletonLine className="h-8 w-1/4" />
                    <SkeletonLine className="h-8 flex-grow" />
                </div>
            ))}
        </div>
    </div>
);
