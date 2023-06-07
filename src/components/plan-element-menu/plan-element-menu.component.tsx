import { useDispatch, useSelector } from "react-redux";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { useCallback, useEffect, useState } from "react";
import styles from './plan-element-menu.module.scss';
import { setLineToAdd, setPlanElementSheetData, setPlanElements, setPlanMode } from "@/redux/plan/plan.actions";
import { Dimensions, Line, PlanElement, PlanElementSheetData, PlanElementSheetTypeName, PlanElementTypeName, PlanElementsHelper, PlanMode, Wall } from "@/entities";
import { v4 } from 'uuid';
import { selectLineToAdd, selectPlanElementSheetData, selectPlanElements } from "@/redux/plan/plan.selectors";
import { LEFT_MENU_WIDTH } from "@/global";
import PlanElementSheet from "../plan-element-sheet/plan-element-sheet.component";
import PlanElementButton from "../plan-element-button/plan-element-button.component";

const PlanElementMenu: React.FC = () => {
  const dispatch = useDispatch();
  const WALL_STROKE_MIN = 10;
  const WALL_STROKE_MAX = 50;
  const WALL_STROKE_DEFAULT = 30;
  const [wallStroke, setWallStroke] = useState<number>(WALL_STROKE_DEFAULT);
  const lineToAdd:Line | null = useSelector(selectLineToAdd);
  // const [showSheet, setShowSheet] = useState<PlanElementSheetData | null>(null);
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);

  useEffect(()=>{
    return ()=>{
      dispatch(setLineToAdd(null));
    };
  },[dispatch]);

  // useEffect(()=>{
  //   console.log("sheetData updated")
  // },[sheetData]);

  const handleWallStrokeInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    setWallStroke(parseFloat(e.currentTarget.value));
  },[]);

  // const setPlanElementToAddToWall = useCallback(() =>{
  //   const wall = new Wall(v4(), [], wallStroke);
  //   dispatch(setLineToAdd(wall));
  // },[dispatch, wallStroke]);

  
  // useEffect(()=>{
  //   setPlanElementToAddToWall();
  // },[setPlanElementToAddToWall]);

  const handleClickOnAddWall = useCallback(() =>{
    const newJoinedWallsId = v4();
    const sheetData:PlanElementSheetData = {planElementId:newJoinedWallsId, wallId:null, typeName: PlanElementSheetTypeName.Wall, numero:""};
    dispatch(setPlanElementSheetData(sheetData));
    dispatch(setPlanMode(PlanMode.AddWall));
  },[dispatch]);

  const isActive = useCallback((typeName: PlanElementTypeName):boolean=>{
    if(!lineToAdd) return false;
    return typeName === lineToAdd.typeName;
  }, [lineToAdd]);

  const goBack = useCallback(()=>{
    dispatch(setPlanElementSheetData(null));
    PlanElementsHelper.unselectAllElements(planElements);
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    dispatch(setPlanMode(PlanMode.Move));

  }, [dispatch, planElements]);

  return (
    <div className={styles['main']}
      style={{"width":""+LEFT_MENU_WIDTH+"px", "maxWidth":""+LEFT_MENU_WIDTH+"px"}}
    >
      <button className={`${styles['back-button']} ${sheetData? styles['active']: null}`} onClick={goBack}>&#8592;</button>
      {sheetData ?
        <PlanElementSheet data={sheetData as PlanElementSheetData} />
        :
        <div className={styles['linears-wrapper']}>
          <div className={styles['linears-header']}>LINEAIRES</div>
          <div className={styles['linears-body']}>
            <PlanElementButton name="Ajouter un mur" onClick={handleClickOnAddWall}/>
          </div>
        </div>
      }


{/* 
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
      <PlanMenuButton iconFileName="vanne-aep.png" handleOnClick={handleOnClick} active= {false} available wallStrokeWidth={null}/> */}
    </div>
  )
};

export default PlanElementMenu;
