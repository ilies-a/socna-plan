import { useDispatch, useSelector } from "react-redux";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { useCallback, useEffect, useState } from "react";
import styles from './add-element-menu.module.scss';
import { setLineToAdd } from "@/redux/plan/plan.actions";
import { Dimensions, Line, PlanElementTypeName, Wall } from "@/entities";
import { v4 } from 'uuid';
import { selectLineToAdd } from "@/redux/plan/plan.selectors";

const AddElementMenu: React.FC = () => {
  const dispatch = useDispatch();
  const WALL_STROKE_MIN = 10;
  const WALL_STROKE_MAX = 50;
  const WALL_STROKE_DEFAULT = 30;
  const [wallStroke, setWallStroke] = useState<number>(WALL_STROKE_DEFAULT);
  const lineToAdd:Line | null = useSelector(selectLineToAdd);

  useEffect(()=>{
    return ()=>{
      dispatch(setLineToAdd(null));
    };
  },[dispatch])

  const handleWallStrokeInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    setWallStroke(parseFloat(e.currentTarget.value));
  },[]);

  const setPlanElementToAddToWall = useCallback(() =>{
    const wall = new Wall(v4(), [], wallStroke);
    dispatch(setLineToAdd(wall));
  },[dispatch, wallStroke]);

  useEffect(()=>{
    setPlanElementToAddToWall();
  },[setPlanElementToAddToWall]);

  const handleOnClick = useCallback(() =>{

  },[]);

  const isActive = useCallback((typeName: PlanElementTypeName):boolean=>{
    if(!lineToAdd) return false;
    return typeName === lineToAdd.typeName;
  }, [lineToAdd]);

  return (
    <div className={styles['main']}>
      <div className={styles['wall-buttons-wrapper']}>
        <input className={`${styles['wall-stroke-input']}`} 
                            name="wall-stroke-input" 
                            type="range" 
                            min={WALL_STROKE_MIN} 
                            max={WALL_STROKE_MAX} 
                            value={wallStroke}
                            onChange={handleWallStrokeInputOnChange}/>
        <PlanMenuButton iconFileName="wall.png" handleOnClick={setPlanElementToAddToWall} active= {isActive(PlanElementTypeName.Wall)} available wallStrokeWidth={wallStroke}/>
      </div>
      <PlanMenuButton iconFileName="canal-eau-pluv.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="gout.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="alim-eau-pot.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="canal-eau-use.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="compass.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="compt-eau.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="eau-pluv.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="fosse.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="puit.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="regards.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="text.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
      <PlanMenuButton iconFileName="vanne-aep.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/>
    </div>
  )
};

export default AddElementMenu;
