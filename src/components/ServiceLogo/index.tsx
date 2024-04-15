import React from "react";
import Image from "next/image";
import { services } from "../SupportedServices";

export const ServiceLogo: React.FC<{ name: string; size?: number }> = ({
  name,
  size = 24,
}) => {
  const url = services.find(
    (service) => service.key.toLocaleLowerCase() === name.toLocaleLowerCase()
  )?.logo;

  if (!url) return null;

  return <Image src={url} alt={name} width={size} height={size} />;
};
