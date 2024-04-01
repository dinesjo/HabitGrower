import { Abc, AutoStories, FitnessCenter, SelfImprovement, WaterDrop } from "@mui/icons-material";

export interface IconMap {
  [key: string]: JSX.Element;
}

export const IconMap: IconMap = {
  WaterDrop: <WaterDrop />,
  FitnessCenter: <FitnessCenter />,
  AutoStories: <AutoStories />,
  SelfImprovement: <SelfImprovement />,
  Default: <Abc />,
};
