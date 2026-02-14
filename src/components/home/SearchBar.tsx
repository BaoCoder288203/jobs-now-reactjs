import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { HCM_WARDS } from '@/constants/hcmWards';
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedWard) {
      params.set('location', selectedWard);
    }
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-primary-light to-primary rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-dark z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tên công việc, từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-14 text-base bg-white border border-gray-200 rounded-lg text-gray-900 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Location Select */}
          <div className="md:w-64 relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-dark z-10 pointer-events-none" />
            <Select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="pl-12 h-14 text-base appearance-none bg-white border border-gray-200 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Tất cả địa điểm</option>
              {HCM_WARDS.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-14 px-8 text-base font-semibold rounded-lg bg-white text-primary-dark hover:bg-primary-dark hover:text-white shadow-md"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}
