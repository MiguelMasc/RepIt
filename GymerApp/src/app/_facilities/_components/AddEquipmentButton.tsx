'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useSession} from '@clerk/nextjs';

interface AddEquipmentButtonProps {
  osm_id: string;
  facilityName: string;
  onEquipmentAdded?: () => void;
}

export const AddEquipmentButton: React.FC<AddEquipmentButtonProps> = ({
  osm_id,
  facilityName,
  onEquipmentAdded,
}) => {
  // const [equipmentList, setEquipmentList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    condition: '',
    description: '',
    maintenanceDate: '',
    quantity: '',
    osm_id,
  });
  const {session} = useSession();

  // const viewEquipment = async () => {
  //   try {
  //     const response = await fetch(`/api/equipment?facilityId=${osm_id}`);
  //     if (!response.ok) throw new Error('Failed to fetch equipment');
  //     const { data } = await response.json();
  //     setEquipmentList(data);
  //   } catch (error) {
  //     console.error('Error viewing equipment:', error);
  //   }
  // };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      condition: '',
      description: '',
      maintenanceDate: '',
      quantity: '',
      osm_id,
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!session) {
        setErrorMessage('User not authenticated');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        osm_id,
        quantity: parseInt(formData.quantity) || 1,
        maintenanceDate: formData.maintenanceDate || null,
      };

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add equipment');
      }

      // const {data} = await response.json();

      if (onEquipmentAdded) {
        onEquipmentAdded();
      }

      resetForm();
      setOpen(false);
    } catch (error: unknown) {
      console.error('Error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-[#1a1f2e]">
      <Button
        type="button"
        data-testid="open-equipment-form"
        className="font-medium text-lg w-full bg-violet-600 hover:bg-violet-700 text-white"
        onClick={() => setOpen(true)}
      >
        Add Equipment
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-[#1a1f2e] border-slate-800 overflow-y-auto no-scrollbar">
          <SheetHeader>
            <SheetTitle className="text-violet-400">
              Add Equipment - {facilityName}
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Add details about the new machine or equipment.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-6 overflow-y-auto"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Equipment Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter equipment name"
                className="bg-slate-800 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">
                Equipment Type
              </Label>
              <Select
                required
                onValueChange={value =>
                  setFormData(prev => ({...prev, type: value}))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="functional">
                    Functional Training
                  </SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="text-slate-300">
                Condition
              </Label>
              <Select
                required
                onValueChange={value =>
                  setFormData(prev => ({...prev, condition: value}))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceDate" className="text-slate-300">
                Last Maintenance Date
              </Label>
              <Input
                id="maintenanceDate"
                name="maintenanceDate"
                type="date"
                value={formData.maintenanceDate}
                onChange={handleChange}
                className="bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter equipment description"
                className="min-h-[100px] bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-300">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="bg-slate-800 text-white"
                required
                min="1"
              />
            </div>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <SheetFooter>
              <Button
                type="submit"
                data-testid="submit-equipment-form"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Equipment'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};
