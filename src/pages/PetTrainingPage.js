import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ImSpinner8, ImSearch } from 'react-icons/im';
import { FaFilter } from 'react-icons/fa';

const PetTrainingPage = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    priceRange: '',
    duration: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get('/api/training');
        setPrograms(res.data);
        setFilteredPrograms(res.data);
      } catch (err) {
        setError('Failed to load training programs');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    let results = programs;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(program =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (filters.difficulty) {
      results = results.filter(program =>
        program.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      results = results.filter(program => {
        const programPrice = Number(program.price.replace(/[^0-9.-]+/g, ""));
        return programPrice >= min && (max ? programPrice <= max : true);
      });
    }
    
    // Apply duration filter
    if (filters.duration) {
      results = results.filter(program =>
        program.duration.toLowerCase().includes(filters.duration.toLowerCase())
      );
    }
    
    setFilteredPrograms(results);
  }, [searchTerm, filters, programs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      difficulty: '',
      priceRange: '',
      duration: ''
    });
    setFilteredPrograms(programs);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <ImSpinner8 className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Pet Training Programs</h1>
      
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <ImSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
          {(searchTerm || filters.difficulty || filters.priceRange || filters.duration) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <select
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Any Price</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-">$100+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Any Duration</option>
                  <option value="week">1 Week</option>
                  <option value="month">1 Month</option>
                  <option value="months">3+ Months</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No programs match your search criteria.
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-2">
            Showing {filteredPrograms.length} of {programs.length} programs
          </div>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div key={program._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">{program.title}</h3>
            <p className="text-gray-600 mb-4">{program.description}</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {program.difficulty}
              </span>
              <div className="text-right">
                <p className="text-lg font-bold">{program.price}</p>
                <p className="text-sm text-gray-600">{program.duration}</p>
              </div>
            </div>

            {/* Video display section */}
            {program.videos && program.videos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Training Videos:</h4>
                <div className="grid grid-cols-1 gap-4">
                  {program.videos.map((video, index) => {
                    const filename = video.path.split(/[\\/]/).pop();
                    return (
                      <div key={index} className="bg-gray-100 p-3 rounded-lg">
                        <video controls className="w-full rounded-lg">
                          <source 
                            src={`/uploads/videos/${filename}`} 
                            type={video.mimetype} 
                          />
                          Your browser does not support the video tag.
                        </video>
                        <p className="mt-2 text-sm">{video.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetTrainingPage;