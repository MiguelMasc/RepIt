'use client';

import React, {Suspense, useState} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import FacilityCard from './FacilityCard';
import {
  Facility,
  getNearbyFacilities,
  insertFacilities,
} from '@/server/api/facilities';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import findSportsFacilities from '@/lib/osm';
import {Search, Compass} from 'lucide-react';

// Utility function to calculate distance using the Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const FacilityListings = ({search}: {search: string | undefined}) => {
  const [range, setRange] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOSMSearch = async () => {
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        },
      );

      const {latitude, longitude} = position.coords;
      console.log(latitude, longitude);

      // Convert range from kilometers to meters
      const radiusMeters = range * 1000;

      setIsLoading(true);
      // Call the findSportsFacilities function
      const response: Facility[] = await findSportsFacilities(
        latitude,
        longitude,
        radiusMeters,
      );

      // insert the result facilities into the db
      await insertFacilities(response);

      // after inserting facilities, reload/re-search the facilities
      await handleDBSearch();

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDBSearch = async () => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        },
      );
      const {latitude, longitude} = position.coords;

      setIsLoading(true);

      const results = await getNearbyFacilities(
        latitude,
        longitude,
        range,
        search,
      );

      // Add distance to each facility and sort by distance
      const facilitiesWithDistance = results.map(facility => ({
        ...facility,
        distance: calculateDistance(
          latitude,
          longitude,
          facility.lat || 0,
          facility.lon || 0,
        ),
      }));

      const sortedFacilities = facilitiesWithDistance.sort(
        (a, b) => a.distance - b.distance,
      );

      setFacilities(sortedFacilities);
      setIsLoading(false);
    } catch {
      setError('Please enable location services.');
    }
  };

  if (error) {
    return <div className="text-red-50">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-between mb-2">
        <Slider
          defaultValue={[range]}
          max={10}
          step={0.5}
          onValueChange={val => setRange(val[0])}
          className="min-w-48 sm:min-w-96 w-full"
        />
        <div className="font-medium mt-4">Radius: {range} km</div>
        {!isLoading ? (
          <div className="mt-2">
            <Button
              onClick={handleDBSearch}
              className="
                flex items-center justify-center space-x-2
                bg-violet-600 hover:bg-violet-700
                text-white
                transition-all duration-300
                ease-in-out
                transform hover:-translate-y-0.5
                shadow-md hover:shadow-lg
                px-4 py-2
              "
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="space-y-4 py-2">
        <Suspense fallback={<div>Loading...</div>}>
          {isLoading ? (
            <div>Getting nearby facilities...</div>
          ) : (
            facilities.map(facility => (
              <FacilityCard key={facility.osm_id} facility={facility} />
            ))
          )}
        </Suspense>
      </div>
      <Button
        onClick={handleOSMSearch}
        variant="outline"
        className="
          flex items-center justify-center space-x-2
          border-2 border-violet-500
          text-violet-500
          bg-gray-900
          hover:bg-violet-600
          transition-all duration-300
          ease-in-out
          transform hover:-translate-y-0.5
          px-4 py-2
        "
      >
        <Compass className="w-5 h-5 mr-2" />I don&apos;t see my facility
      </Button>
    </div>
  );
};

export default FacilityListings;
