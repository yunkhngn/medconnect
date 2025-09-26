import { useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";

export default function HomePage() {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:8080/hello");
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage("Error fetching API");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <Button onPress={handleClick} color="primary">
            Get API
          </Button>
          {message && <p>{message}</p>}
        </CardBody>
      </Card>
    </div>
  );
}