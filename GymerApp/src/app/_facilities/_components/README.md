# Facilities Components

This directory contains React components for managing and displaying fitness facilities in the app, which handles facility searching, viewing, and equipment management.

## Components

### FacilityCard

This component renders a styled card displaying individual facility details, including name, address, phone number, and equipment management options3

#### Features

- Displays facility name, address, and contact information
- Equipment management integration
- Website linking capability
- Leisure type categorization

#### Example

```
import FacilityCard from './FacilityCard';

function Facilities() {
  return (
    <FacilityCard
      facility={{
        name: "Gold's Gym",
        address: "123 Fitness St",
        phone: "555-0123",
        leisure: "fitness_centre",
        osm_id: "12345"
      }}
    />
  );
}
```

#### References

- `GymerApp/src/app/facilities/_components/FacilityCard.tsx`

### FacilitySearchBar

This component provides search functionality for facilities with debounced input handling2

#### Features

- Debounced search input
- Support for different search types (Nearby/Tracked)
- Dynamic URL updates based on search terms

#### Example

```
import { FacilitySearchBar } from './FacilitySearchBar';

function FacilitiesPage() {
  return <FacilitySearchBar searchType="Nearby" />;
}
```

#### References

- `GymerApp/src/app/facilities/_components/FacilitySearchBar.tsx`

### FacilityListings

This component manages the display of facility listings with location-based features4

#### Features

- Geolocation-based facility search
- Distance calculation using Haversine formula
- Adjustable search radius
- Sorting facilities by distance
- Loading states management

#### Example

```
import FacilityListings from './FacilityListings';

function FacilitiesPage() {
  return <FacilityListings search="gym" />;
}
```

#### References

- `GymerApp/src/app/facilities/_components/FacilityListings.tsx`

### ViewEquipmentsButton

This component provides equipment management functionality for facilities1

#### Features

- Equipment inventory viewing
- Equipment deletion capability
- Condition-based styling
- Loading and error state handling
- Real-time equipment list updates

#### Example

```
import { ViewEquipmentsButton } from './ViewEquipmentsButton';

function EquipmentManager() {
  return (
    <ViewEquipmentsButton
      osmId="12345"
      equipment={[]}
      setEquipment={setEquipmentState}
    />
  );
}
```

#### References

- `GymerApp/src/app/facilities/_components/ViewEquipmentsButton.tsx`

### AddEquipmentButton

This component provides a form interface for adding new equipment to a facility.

#### Features
- Form for equipment details input
- Equipment type categorization
- Condition status selection
- Maintenance date tracking
- Quantity management

#### Example

```
import { AddEquipmentButton } from './AddEquipmentButton';

function FacilityPage() {
  return (
    <AddEquipmentButton
      osm_id="12345"
      facilityName="Gold's Gym"
      onEquipmentAdded={() => console.log('Equipment added')}
    />
  );
}
```

#### References

- `GymerApp/src/app/facilities/_components/AddEquipmentButton.tsx`
  
### EquipmentContext

This component provides global state management for equipment data across the application.

#### Features
- Global equipment list state
- Equipment addition functionality
- Context provider wrapper

#### Example

```
import { EquipmentProvider, useEquipment } from './EquipmentContext';

function App() {
  return (
    <EquipmentProvider>
      <FacilityManager />
    </EquipmentProvider>
  );
}
```

#### References

- `GymerApp/src/app/facilities/_components/EquipmentContext.tsx`

### ViewEquipmentsButton

This component displays a comprehensive list of equipment for a facility.

#### Features

- Equipment inventory display
- Deletion capability
- Condition status indicators
- Maintenance date tracking
- Low quantity alerts
- Loading state management

#### Example

```
import { ViewEquipmentsButton } from './ViewEquipmentsButton';

function EquipmentManager() {
  return (
    <ViewEquipmentsButton
      osmId="12345"
      equipment={equipmentList}
      setEquipment={setEquipmentList}
    />
  );
}
```

### AddFacilityButton

This component handles the addition of new facilities to the system.

#### Features

- Facility creation interface
- Integration with facility API
- Success/error state handling
  
#### Example

```
import { AddFacilityButton } from './AddFacilityButton';

function FacilitiesPage() {
  return (
    <AddFacilityButton
      facility={{
        name: "New Gym",
        osm_id: "12345",
        leisure: "fitness_centre"
      }}
    />
  );
}
```

#### References

- `GymerApp/src/app/facilities/_components/AddFacilityButton.tsx`
