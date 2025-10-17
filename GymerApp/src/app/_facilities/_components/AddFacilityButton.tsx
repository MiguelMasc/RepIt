'use client';

import React from 'react';
// import {Search, MapPin, Star, Phone, Check} from 'lucide-react';
// import {Card, CardHeader, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
// import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {addFacility, Facility} from '@/server/api/facilities';

export const AddFacilityButton = ({facility}: {facility: Facility}) => {
  return (
    <div>
      <Button
        type="button"
        className="font-medium text-lg bg-violet-600 dark:text-white w-full"
        onClick={async () => addFacility(facility)}
      >
        Add Facility
      </Button>
    </div>
  );
};
