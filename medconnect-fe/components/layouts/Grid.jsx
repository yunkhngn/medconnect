import React from 'react';
import { Card, CardBody } from '@heroui/react';

const Grid = ({ leftChildren, rightChildren }) => {
  return (
    <div className="h-[calc(100vh-2.25rem)] grid grid-cols-1 lg:grid-cols-10 gap-4">
      {/* Left Column - 3/10 width with scrollable card */}
      <div className="lg:col-span-2 h-full">
        <Card className="h-full">
          <CardBody className="overflow-y-auto p-7">
            {leftChildren}
          </CardBody>
        </Card>
      </div>

      {/* Right Column - 7/10 width with scrollable card */}
      <div className="lg:col-span-8 h-full">
        <Card className="h-full">
          <CardBody className="overflow-y-auto p-7">
            {rightChildren}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Grid;