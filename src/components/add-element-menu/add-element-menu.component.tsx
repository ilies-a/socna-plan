import { useDispatch } from "react-redux";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { useCallback } from "react";
import styles from './add-element-menu.module.scss';

const AddElementMenu: React.FC = () => {
  const dispatch = useDispatch();

  const setPlanElementToAddToWall = useCallback(() =>{

  },[]);

  const handleOnClick = useCallback(() =>{

  },[]);

  return (
    <div className={styles['main']}>
      <PlanMenuButton iconFileName="wall.png" handleOnClick={setPlanElementToAddToWall} active available/>
      <PlanMenuButton iconFileName="canal-eau-pluv.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="gout.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="alim-eau-pot.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="canal-eau-use.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="compass.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="compt-eau.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="eau-pluv.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="fosse.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="puit.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="regards.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="text.png" handleOnClick={handleOnClick} active available/>
      <PlanMenuButton iconFileName="vanne-aep.png" handleOnClick={handleOnClick} active available/>
    </div>
  )
};

export default AddElementMenu;
