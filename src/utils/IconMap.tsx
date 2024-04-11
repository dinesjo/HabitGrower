import {
  AbcTwoTone,
  AutoStoriesOutlined,
  BedOutlined,
  DirectionsBikeOutlined,
  FitnessCenterOutlined,
  GroupOutlined,
  HouseOutlined,
  LocalLaundryServiceOutlined,
  MedicationOutlined,
  MusicNoteOutlined,
  NordicWalkingOutlined,
  PetsOutlined,
  SavingsOutlined,
  SelfImprovementOutlined,
  SoupKitchenOutlined,
  WaterDropOutlined,
  WorkOutlined,
  YardOutlined,
} from "@mui/icons-material";

export interface IconMap {
  [key: string]: JSX.Element;
}

export const IconMap: IconMap = {
  Default: <AbcTwoTone />,
  WaterDrop: <WaterDropOutlined />,
  House: <HouseOutlined />,
  Pets: <PetsOutlined />,
  FitnessCenter: <FitnessCenterOutlined />,
  AutoStories: <AutoStoriesOutlined />,
  SelfImprovement: <SelfImprovementOutlined />,
  Music: <MusicNoteOutlined />,
  Medication: <MedicationOutlined />,
  SoupKitchen: <SoupKitchenOutlined />,
  Bed: <BedOutlined />,
  Work: <WorkOutlined />,
  NordicWalking: <NordicWalkingOutlined />,
  DirectionsBike: <DirectionsBikeOutlined />,
  Yard: <YardOutlined />,
  LocalLaundryService: <LocalLaundryServiceOutlined />,
  Savings: <SavingsOutlined />,
  Group: <GroupOutlined />,
};
