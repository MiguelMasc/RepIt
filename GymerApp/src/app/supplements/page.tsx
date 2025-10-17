// src/app/supplements/page.tsx
import SupplementHistory from './_components/SupplementHistory';

const SupplementsPage = () => {
  return (
    <div className="container flex-grow mx-auto dark:bg-gray-900 bg-transparent mt-8 px-4">
      <SupplementHistory />
    </div>
  );
};

export default SupplementsPage;
