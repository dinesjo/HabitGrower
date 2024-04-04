import {
  Abc,
  AutoStories,
  Bed,
  DirectionsBike,
  FitnessCenter,
  Group,
  House,
  LocalLaundryService,
  Medication,
  MusicNote,
  NordicWalking,
  Pets,
  Savings,
  SelfImprovement,
  SoupKitchen,
  WaterDrop,
  Work,
  Yard,
} from "@mui/icons-material";

export interface IconMap {
  [key: string]: JSX.Element;
}

export const IconMap: IconMap = {
  Default: <Abc />,
  WaterDrop: <WaterDrop />,
  House: <House />,
  Pets: <Pets />,
  FitnessCenter: <FitnessCenter />,
  AutoStories: <AutoStories />,
  SelfImprovement: <SelfImprovement />,
  Music: <MusicNote />,
  Medication: <Medication />,
  SoupKitchen: <SoupKitchen />,
  Bed: <Bed />,
  Work: <Work />,
  NordicWalking: <NordicWalking />,
  DirectionsBike: <DirectionsBike />,
  Yard: <Yard />,
  LocalLaundryService: <LocalLaundryService />,
  Savings: <Savings />,
  Group: <Group />,
};
