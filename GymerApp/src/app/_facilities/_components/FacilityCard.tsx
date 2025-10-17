//GymerApp/src/app/facilities/_components/facilityCard.tsx
'use client';

import React, {useState} from 'react';
import {MapPin, Phone} from 'lucide-react';
import {Card, CardHeader, CardContent} from '@/components/ui/card';
import {Facility} from '@/server/api/facilities';
import {AddEquipmentButton} from './AddEquipmentButton';
import {ViewEquipmentsButton} from './ViewEquipmentsButton';
import {EquipmentData} from '@/drizzle/api/equipment'; // Updated import

const FacilityCard = ({facility}: {facility: Facility}) => {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]); // Updated type to EquipmentData

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment?osm_id=${facility.osm_id}`);
      const data = await response.json();

      // Adjusted to match the structure of response JSON
      setEquipment(() => {
        return data.data;
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const onEquipmentAdded = async () => {
    // Refetch equipment when new equipment is added
    await fetchEquipment();
  };

  const capitalizeAndReplaceUnderscores = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // https://stackoverflow.com/questions/70997371/external-link-getting-appended-with-localhost-url
  const setURL = (link: string) => {
    return link.includes('://') ? link : '//' + link;
  };

  // useEffect(() => {
  //   fetchEquipment();
  // }, [facility.osm_id]);

  return (
    <div>
      <Card className="dark:bg-gray-800 bg-neutral-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-4 flex-1">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start">
                <div>
                  {/* NAME */}
                  <span className="text-xl font-semibold">{facility.name}</span>
                  {facility.website ? (
                    <a
                      className="ml-1 italic dark:text-gray-400 text-gray-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={setURL(facility.website)}
                    >
                      - link
                    </a>
                  ) : (
                    <a
                      className="ml-1 italic dark:text-gray-400 text-gray-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.google.com/search?q=${facility.name}`}
                    >
                      - check the web
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              {/* ADDRESS */}
              {facility.address ? (
                <div className="flex items-start space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span>{facility.address}</span>
                </div>
              ) : null}

              {/* PHONE */}
              {facility.phone ? (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>{facility.phone}</span>
                </div>
              ) : null}

              {/* LEISURE */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {facility.leisure.endsWith('centre')
                    ? capitalizeAndReplaceUnderscores(
                        facility.leisure.split('_')[0],
                      ) + ' Center'
                    : capitalizeAndReplaceUnderscores(facility.leisure)}
                </span>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <AddEquipmentButton
                    osm_id={facility.osm_id}
                    facilityName={facility.name}
                    onEquipmentAdded={onEquipmentAdded}
                  />
                  <ViewEquipmentsButton
                    osmId={facility.osm_id}
                    equipment={equipment}
                    setEquipment={setEquipment}
                  />{' '}
                  {/* Pass the equipment prop */}
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FacilityCard;
