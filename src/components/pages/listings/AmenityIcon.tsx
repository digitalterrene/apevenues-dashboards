import React from "react";
import {
  Wifi,
  ParkingSquare,
  Dumbbell,
  Snowflake,
  Flame,
  Utensils,
  Tv,
  Monitor,
  Coffee,
  Lock,
  Bed,
  Wine,
  Microwave,
  Fan,
  Sun,
  Waves,
  Tent,
  Home,
  Sparkles,
  Shield,
  GlassWaterIcon,
  Upload,
  GlassWater,
} from "lucide-react";

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

const AmenityIcon: React.FC<AmenityIconProps> = ({
  amenity,
  className = "",
}) => {
  // Default icon if no match is found
  const DefaultIcon = () => <span className={className}>🏠</span>;

  // Map amenity values to Lucide icons
  const iconMap: Record<string, React.ReactNode> = {
    wifi: <Wifi className={className} />,
    parking: <ParkingSquare className={className} />,
    pool: <GlassWaterIcon className={className} />,
    gym: <Dumbbell className={className} />,
    ac: <Snowflake className={className} />,
    heating: <Flame className={className} />,
    kitchen: <Utensils className={className} />,
    tv: <Tv className={className} />,
    workspace: <Monitor className={className} />,
    breakfast: <Coffee className={className} />,
    security: <Lock className={className} />,
    elevator: <Upload className={className} />,
    bathroom: <GlassWater className={className} />,
    bedroom: <Bed className={className} />,
    minibar: <Wine className={className} />,
    microwave: <Microwave className={className} />,
    fan: <Fan className={className} />,
    patio: <Sun className={className} />,
    beachfront: <Waves className={className} />,
    mountainview: <Tent className={className} />,
    fireplace: <Flame className={className} />,
    laundry: <Home className={className} />,
    cleaning: <Sparkles className={className} />,
    safebox: <Shield className={className} />,
  };

  // Return the matched icon or default
  return iconMap[amenity] || <DefaultIcon />;
};

export default AmenityIcon;
