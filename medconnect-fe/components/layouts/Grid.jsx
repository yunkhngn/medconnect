import React from 'react';
import { Card, CardBody } from '@heroui/react';

const Grid = ({ leftChildren, rightChildren }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 h-full">
      {/* Left Column - 2/10 width with scrollable card */}
      <div className="lg:col-span-2 h-full flex flex-col">
        <Card className="h-full flex-1 flex flex-col">
          <CardBody className="overflow-y-auto p-4 flex-1">
            {leftChildren}
          </CardBody>
        </Card>
      </div>

      {/* Right Column - 8/10 width with scrollable card */}
      <div className="lg:col-span-8 h-full flex flex-col">
        <Card className="h-full flex-1 flex flex-col">
          <CardBody className="overflow-y-auto p-4 flex-1">
            {rightChildren}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Grid;