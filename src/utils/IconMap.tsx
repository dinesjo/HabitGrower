import {
  AbcTwoTone,
  AutoStoriesTwoTone,
  BedTwoTone,
  DirectionsBikeTwoTone,
  FitnessCenterTwoTone,
  GroupTwoTone,
  HouseTwoTone,
  LocalCafeTwoTone,
  LocalFloristTwoTone,
  LocalLaundryServiceTwoTone,
  MedicationTwoTone,
  MusicNoteTwoTone,
  NordicWalkingTwoTone,
  PetsTwoTone,
  SavingsTwoTone,
  SelfImprovementTwoTone,
  SoupKitchenTwoTone,
  SportsGymnastics,
  WaterDropTwoTone,
  WorkTwoTone,
} from "@mui/icons-material";

export interface IconMap {
  [key: string]: JSX.Element;
}

export const IconMap: IconMap = {
  Default: <AbcTwoTone />,
  WaterDrop: <WaterDropTwoTone />,
  House: <HouseTwoTone />,
  Pets: <PetsTwoTone />,
  FitnessCenter: <FitnessCenterTwoTone />,
  AutoStories: <AutoStoriesTwoTone />,
  SelfImprovement: <SelfImprovementTwoTone />,
  Music: <MusicNoteTwoTone />,
  Medication: <MedicationTwoTone />,
  SoupKitchen: <SoupKitchenTwoTone />,
  Bed: <BedTwoTone />,
  Work: <WorkTwoTone />,
  NordicWalking: <NordicWalkingTwoTone />,
  SportsGymnastics: <SportsGymnastics />,
  DirectionsBike: <DirectionsBikeTwoTone />,
  Yard: <LocalFloristTwoTone />,
  Cafe: <LocalCafeTwoTone />,
  LocalLaundryService: <LocalLaundryServiceTwoTone />,
  Savings: <SavingsTwoTone />,
  Group: <GroupTwoTone />,
};
