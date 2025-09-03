import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Search = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <MagnifyingGlassIcon className="mx-auto h-24 w-24 text-secondary-400 mb-8" />
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Search</h1>
          <p className="text-secondary-600">
            Search functionality will be implemented here. You can search for users, projects, problems, and skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Search;
