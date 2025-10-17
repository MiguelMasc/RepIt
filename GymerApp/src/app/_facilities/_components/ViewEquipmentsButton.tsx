'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {EquipmentData} from '@/drizzle/api/equipment';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {Dumbbell, Calendar, AlertCircle, Trash2} from 'lucide-react';

// Utility function to determine condition badge color
const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'new':
      return 'bg-violet-900 text-violet-200';
    case 'excellent':
      return 'bg-green-900 text-green-200';
    case 'good':
      return 'bg-blue-900 text-blue-200';
    case 'fair':
      return 'bg-yellow-900 text-yellow-200';
    case 'poor':
      return 'bg-red-900 text-red-200';
    default:
      return 'bg-slate-900 text-slate-200';
  }
};

interface ViewEquipmentsButtonProps {
  osmId: string;
  equipment: EquipmentData[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentData[]>>;
}

export const ViewEquipmentsButton: React.FC<ViewEquipmentsButtonProps> = ({
  osmId,
  equipment,
  setEquipment,
}: ViewEquipmentsButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/equipment?osm_id=${osmId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }

      const data = await response.json();
      setEquipment(data.data);
      setIsOpen(true);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Error loading equipment data');
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async (item: EquipmentData) => {
    const identifier = item.identifier;
    const originalEquipment = equipment;

    // Optimistically remove the item from the UI
    setEquipment(prevEquipment =>
      prevEquipment.filter(equipItem => equipItem.identifier !== identifier),
    );

    try {
      const response = await fetch('/api/equipment', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);

      // Rollback the equipment list
      setEquipment(originalEquipment);
    }
  };

  return (
    <div className="bg-[#1a1f2e]">
      <Button
        type="button"
        className="font-medium text-lg w-full bg-violet-600 hover:bg-violet-700 text-white"
        onClick={fetchEquipment}
        disabled={loading}
      >
        {loading ? (
          'Loading...'
        ) : (
          <>
            <Dumbbell className="mr-2 h-5 w-5" /> View Equipment
          </>
        )}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="h-[80vh] bg-[#1a1f2e] border-slate-800"
        >
          <SheetHeader>
            <SheetTitle className="text-violet-400">
              Equipment Inventory
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              View and manage your gym equipment inventory
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Table header */}
            <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-slate-800 rounded-t-lg">
              <div className="text-slate-300 font-medium">Name</div>
              <div className="text-slate-300 font-medium">Type</div>
              <div className="text-slate-300 font-medium">Condition</div>
              <div className="text-slate-300 font-medium">Description</div>
              <div className="text-slate-300 font-medium">Maintenance</div>
              <div className="text-slate-300 font-medium">Qty</div>
              <div className="text-slate-300 font-medium">Actions</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-slate-700">
              {equipment && equipment.length > 0 ? (
                equipment.map(item => (
                  <div
                    key={item.identifier}
                    className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-slate-800/50"
                  >
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-slate-300">{item.type || 'N/A'}</div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getConditionColor(
                          item.condition || 'N/A',
                        )}`}
                      >
                        {item.condition || 'N/A'}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      {item.description || 'No description'}
                    </div>
                    <div className="text-slate-300 flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-violet-400" />
                      {item.maintenance_date
                        ? new Date(item.maintenance_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="flex items-center text-slate-300">
                      <span className="font-semibold">
                        {item.quantity || 'N/A'}
                      </span>
                      {item.quantity && item.quantity <= 2 && (
                        <AlertCircle className="ml-2 h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => deleteEquipment(item)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 px-4 py-3">
                  No equipment found for this facility.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ViewEquipmentsButton;
