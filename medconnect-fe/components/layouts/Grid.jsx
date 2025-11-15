import React from 'react';
import { Card, CardBody } from '@heroui/react';

const Grid = ({ leftChildren, rightChildren }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-10 gap-3 sm:gap-4 h-full min-h-0">
      {/* Left Column - 2/10 width with scrollable card */}
      <div className="lg:col-span-2 h-full flex flex-col min-h-0 order-2 lg:order-1">
        <Card className="h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-white shadow-sm">
          <CardBody className="overflow-y-auto p-3 sm:p-4 flex-1 min-h-0">
            {leftChildren}
          </CardBody>
        </Card>
      </div>

      {/* Right Column - 8/10 width with scrollable card */}
      <div className="lg:col-span-8 h-full flex flex-col min-h-0 order-1 lg:order-2">
        <Card className="h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-white shadow-sm">
          <CardBody className="overflow-y-auto p-3 sm:p-4 flex-1 min-h-0">
            {rightChildren}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Grid;