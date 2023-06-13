import { useDispatch, useSelector } from "react-redux";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { useCallback, useEffect, useState } from "react";
import styles from './plan-element-menu.module.scss';
import { setPlanElementSheetData, setPlanElements, setPlanMode, setSegOnCreationData } from "@/redux/plan/plan.actions";
import { AddSegSession, AllJointSegs, Dimensions, JointSegsClassName, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, Seg, SegClassName, SegOnCreationData, SheetData, SheetDataREP, SheetDataREU, SheetDataWall, Wall } from "@/entities";
import { v4 } from 'uuid';
import { selectAddSegSession, selectLineToAdd, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { LEFT_MENU_WIDTH } from "@/global";
import PlanElementSheet from "../plan-element-sheet/plan-element-sheet.component";
import PlanElementButton from "../plan-element-button/plan-element-button.component";


const PlanElementMenu: React.FC = () => {
  const dispatch = useDispatch();
  const WALL_STROKE_MIN = 10;
  const WALL_STROKE_MAX = 50;
  const WALL_STROKE_DEFAULT = 30;
  const [segStroke, setSegStroke] = useState<number>(WALL_STROKE_DEFAULT);
  // const [showSheet, setShowSheet] = useState<PlanElementSheetData | null>(null);
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  // const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const addSegSession: AddSegSession | null = useSelector(selectAddSegSession);
  const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);


  useEffect(()=>{
    const selectedEl = PlanElementsHelper.getSelectedElement(planElements);
    if(selectedEl != null){
      switch(selectedEl.instantiatedClassName){
        default: //AllJointSegs
          const ajs = selectedEl as AllJointSegs;
          const js = ajs.getSelectedJointSegs();
          if(!js) return; //should throw error
          switch(js.instantiatedClassName){
            case(JointSegsClassName.JointREPs):{
              const selectedREP = js.getSelectedSeg() as Wall; 
              if(!selectedREP) return; //should throw error
              setSheetData(new SheetDataREP(ajs.id, selectedREP.id));
              break;
            }
            case(JointSegsClassName.JointREUs):{
              const selectedREP = js.getSelectedSeg() as Wall; 
              if(!selectedREP) return; //should throw error
              setSheetData(new SheetDataREU(ajs.id, selectedREP.id));
              break;
            }
            default:{
              const selectedWall = js.getSelectedSeg() as Wall; 
              if(!selectedWall) return; //should throw error
              setSheetData(new SheetDataWall(ajs.id, selectedWall.id));
              break;
            }
          }
          break;
      }
    }else if(segOnCreationData != null){ //we could use PlanMode.AddSeg but it would overload dependencies array and then rerenders (imo)
      //todo setSheetData with data inside adding element data (not implemented yet)
      switch(segOnCreationData.segClassName){
        case(SegClassName.REP):{
          setSheetData(new SheetDataREP());
          break;
        }
        case(SegClassName.REU):{
          setSheetData(new SheetDataREU());
          break;
        }
        default:{
          setSheetData(new SheetDataWall());
          break;
        }
      }
    }else{
      setSheetData(null);
    }
  },[planElements, segOnCreationData]);


  const handleClickOnAddWall = useCallback(() =>{
    // const sheetData:PlanElementSheetData = {planElementId:newJoinedSegsId, segId:undefined, typeName: PlanElementSheetTypeName.Seg, numero:""};
    // dispatch(setPlanElementSheetData(sheetData));
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData({segClassName: SegClassName.Wall, numero:"0"}));
    
  },[dispatch]);

  const handleClickOnAddREP = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData({segClassName: SegClassName.REP, numero:"0"}));
  },[dispatch]);

  const handleClickOnAddREU = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData({segClassName: SegClassName.REU, numero:"0"}));
  },[dispatch]);

  const goBack = useCallback(()=>{
    dispatch(setPlanElementSheetData(null));
    dispatch(setSegOnCreationData(null));
    PlanElementsHelper.unselectAllElements(planElements);
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    dispatch(setPlanMode(PlanMode.Move));
  }, [dispatch, planElements]);


  return (
    <div className={styles['main']}
      style={{"width":""+LEFT_MENU_WIDTH+"px", "maxWidth":""+LEFT_MENU_WIDTH+"px"}}
    >
      <button className={`${styles['back-button']} ${sheetData? styles['active']: null}`} onClick={goBack}>&#8592;</button>
      {sheetData?
        <PlanElementSheet sheetData={sheetData}/>
        :
        <div className={styles['linears-wrapper']}>
          <div className={styles['linears-header']}>LINEAIRES</div>
          <div className={styles['linears-body']}>
            <PlanElementButton name="Ajouter un mur" onClick={handleClickOnAddWall}/>
            <PlanElementButton name="Ajouter un REP" onClick={handleClickOnAddREP}/>
            <PlanElementButton name="Ajouter un REU" onClick={handleClickOnAddREU}/>
          </div>
        </div>
      }


{/* 
      <div className={styles['seg-buttons-wrapper']}>
        <input className={`${styles['seg-stroke-input']}`} 
                            name="seg-stroke-input" 
                            type="range" 
                            min={WALL_STROKE_MIN} 
                            max={WALL_STROKE_MAX} 
                            value={segStroke}
                            onChange={handleSegStrokeInputOnChange}/>
        <PlanMenuButton iconFileName="seg.png" handleOnClick={setPlanElementToAddToSeg} active= {isActive(PlanElementTypeName.Seg)} available segStrokeWidth={segStroke}/>
      </div>
      <PlanMenuButton iconFileName="canal-eau-pluv.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="gout.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="alim-eau-pot.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="canal-eau-use.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="compass.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="compt-eau.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="eau-pluv.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="fosse.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="puit.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="regards.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="text.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/>
      <PlanMenuButton iconFileName="vanne-aep.png" handleOnClick={handleOnClick} active= {false} available segStrokeWidth={null}/> */}
    </div>
  )
};

export default PlanElementMenu;
