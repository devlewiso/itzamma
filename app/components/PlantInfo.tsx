import React from 'react';

// Define la interfaz para las props
interface PlantInfoProps {
  name: string;
  info: string;
}

export default function PlantInfo({ name, info }: PlantInfoProps) {
  return (
    <div className="mt-4 p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold">{name}</h2>
      <p>{info}</p>
    </div>
  );
}
