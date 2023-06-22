import { useDispatch, useSelector } from "react-redux";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { useCallback, useEffect, useState } from "react";
import styles from './plan-element-menu.module.scss';
import { setPlanElementSheetData, setPlanElements, setPlanMode, setSegOnCreationData } from "@/redux/plan/plan.actions";
import { AEP, AddSegSession, AgrDrain, AllJointSegs, AppDynamicProps, Dimensions, Gutter, JointAEPs, JointAgrDrains, JointGutters, JointPools, JointREPs, JointREUs, JointRoadDrains, JointSegsClassName, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, Pool, REP, REU, ResArrowStatus, RoadDrain, Seg, SegClassName, SegOnCreationData, SheetData, SheetDataAEP, SheetDataAgrDrain, SheetDataGutter, SheetDataPool, SheetDataREP, SheetDataREU, SheetDataRoadDrain, SheetDataWall, Wall } from "@/entities";
import { v4 } from 'uuid';
import { selectAddSegSession, selectAppDynamicProps, selectLineToAdd, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
// import { LEFT_MENU_WIDTH } from "@/global";
import PlanElementSheet from "../plan-element-sheet/plan-element-sheet.component";
import PlanElementButton from "../plan-element-button/plan-element-button.component";
import { NAME_TEXT_DEFAULT_FONT_SIZE } from "@/global";


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
  const [sheetDataOpen, setSheetDataOpen] = useState<boolean>(false);
  const appDynamicProps: AppDynamicProps = useSelector(selectAppDynamicProps);



  useEffect(()=>{
    const selectedEl = PlanElementsHelper.getSelectedElement(planElements);
    if(selectedEl != null){
      if(selectedEl instanceof AllJointSegs){
        const ajs = selectedEl as AllJointSegs;
        const js = ajs.getSelectedJointSegs();
        if(!js) return; //should throw error
        if(js instanceof JointWalls){
          const selectedWall = js.getSelectedSeg() as Wall; 
          if(!selectedWall) return; //should throw error
          setSheetData(new SheetDataWall(ajs.id, selectedWall.id));
        }else if(js instanceof JointREPs){
          const selectedREP = js.getSelectedSeg() as REP; 
          if(!selectedREP) return; //should throw error
          setSheetData(new SheetDataREP(ajs.id, selectedREP.id));
        }else if(js instanceof JointREUs){
          const selectedREP = js.getSelectedSeg() as REU; 
          if(!selectedREP) return; //should throw error
          setSheetData(new SheetDataREU(ajs.id, selectedREP.id));
        }else if(js instanceof JointAEPs){
          const selectedAEP = js.getSelectedSeg() as AEP; 
          if(!selectedAEP) return; //should throw error
          setSheetData(new SheetDataAEP(ajs.id, selectedAEP.id));
        }else if(js instanceof JointGutters){
          const selectedGutter = js.getSelectedSeg() as Gutter; 
          if(!selectedGutter) return; //should throw error
          setSheetData(new SheetDataGutter(ajs.id, selectedGutter.id));
        }else if(js instanceof JointPools){
          const selectedPool = js.getSelectedSeg() as Pool; 
          if(!selectedPool) return; //should throw error
          setSheetData(new SheetDataPool(ajs.id, selectedPool.id));
        }else if(js instanceof JointRoadDrains){
          const selectedRoadDrain = js.getSelectedSeg() as RoadDrain; 
          if(!selectedRoadDrain) return; //should throw error
          setSheetData(new SheetDataRoadDrain(ajs.id, selectedRoadDrain.id));
        }else if(js instanceof JointAgrDrains){
          const selectedAgrDrain = js.getSelectedSeg() as AgrDrain; 
          if(!selectedAgrDrain) return; //should throw error
          setSheetData(new SheetDataAgrDrain(ajs.id, selectedAgrDrain.id));
        }
        // switch(js.instantiatedClassName){
        //   case(JointSegsClassName.JointREPs):{
        //     const selectedREP = js.getSelectedSeg() as Wall; 
        //     if(!selectedREP) return; //should throw error
        //     setSheetData(new SheetDataREP(ajs.id, selectedREP.id));
        //     break;
        //   }
        //   case(JointSegsClassName.JointREUs):{
        //     const selectedREP = js.getSelectedSeg() as Wall; 
        //     if(!selectedREP) return; //should throw error
        //     setSheetData(new SheetDataREU(ajs.id, selectedREP.id));
        //     break;
        //   }
        //   default:{
        //     const selectedWall = js.getSelectedSeg() as Wall; 
        //     if(!selectedWall) return; //should throw error
        //     setSheetData(new SheetDataWall(ajs.id, selectedWall.id));
        //     break;
        //   }
        // }
        setSheetDataOpen(true);
      }
      // switch(selectedEl.instantiatedClassName){
      //   default: //AllJointSegs
      //     const ajs = selectedEl as AllJointSegs;
      //     const js = ajs.getSelectedJointSegs();
      //     if(!js) return; //should throw error
      //     switch(js.instantiatedClassName){
      //       case(JointSegsClassName.JointREPs):{
      //         const selectedREP = js.getSelectedSeg() as Wall; 
      //         if(!selectedREP) return; //should throw error
      //         setSheetData(new SheetDataREP(ajs.id, selectedREP.id));
      //         break;
      //       }
      //       case(JointSegsClassName.JointREUs):{
      //         const selectedREP = js.getSelectedSeg() as Wall; 
      //         if(!selectedREP) return; //should throw error
      //         setSheetData(new SheetDataREU(ajs.id, selectedREP.id));
      //         break;
      //       }
      //       default:{
      //         const selectedWall = js.getSelectedSeg() as Wall; 
      //         if(!selectedWall) return; //should throw error
      //         setSheetData(new SheetDataWall(ajs.id, selectedWall.id));
      //         break;
      //       }
      //     }
      //     break;
      // }
    }else if(segOnCreationData != null){ //we could use PlanMode.AddSeg but it would overload dependencies array and then rerenders (imo)
      //todo setSheetData with data inside adding element data (not implemented yet)
      switch(segOnCreationData.segClassName){
        case(SegClassName.Wall):{
          setSheetData(new SheetDataWall());
          break;
        }
        case(SegClassName.REP):{
          setSheetData(new SheetDataREP());
          break;
        }
        case(SegClassName.REU):{
          setSheetData(new SheetDataREU());
          break;
        }
        case(SegClassName.AEP):{
          setSheetData(new SheetDataAEP());
          break;
        }
        case(SegClassName.Gutter):{
          setSheetData(new SheetDataGutter());
          break;
        }
        case(SegClassName.Pool):{
          setSheetData(new SheetDataPool());
          break;
        }
        case(SegClassName.RoadDrain):{
          setSheetData(new SheetDataRoadDrain());
          break;
        }
        case(SegClassName.AgrDrain):{
          setSheetData(new SheetDataAgrDrain());
          break;
        }
      }
      setSheetDataOpen(true);
    }else{
      setSheetData(null);
      // console.log("setSheetData null")
      setSheetDataOpen(false);
    }
  },[planElements, segOnCreationData]);

  const createNewStandardSegOnCreationData = (segClassName:SegClassName):SegOnCreationData=>{
    return {
      segClassName: segClassName, 
      numero:"0", 
      resArrowStatus: ResArrowStatus.None,
      nameTextVisibility: false,
      nameTextFontSize: NAME_TEXT_DEFAULT_FONT_SIZE,
      nameTextRotation: 0,
    }
  }

  const handleClickOnAddWall = useCallback(() =>{
    // const sheetData:PlanElementSheetData = {planElementId:newJoinedSegsId, segId:undefined, typeName: PlanElementSheetTypeName.Seg, numero:""};
    // dispatch(setPlanElementSheetData(sheetData));
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.Wall)));
  },[dispatch]);

  const handleClickOnAddREP = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.REP)));
  },[dispatch]);

  const handleClickOnAddREU = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.REU)));
  },[dispatch]);

  const handleClickOnAddAEP = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.AEP)));
  },[dispatch]);

  const handleClickOnAddGutter = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.Gutter)));
  },[dispatch]);

  const handleClickOnAddPool = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.Pool)));
  },[dispatch]);

  const handleClickOnAddRoadDrain = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.RoadDrain)));
  },[dispatch]);

  const handleClickOnAddAgrDrain = useCallback(() =>{
    dispatch(setPlanMode(PlanMode.AddSeg));
    dispatch(setSegOnCreationData(createNewStandardSegOnCreationData(SegClassName.AgrDrain)));
  },[dispatch]);

  const goBack = useCallback(()=>{
    // dispatch(setPlanElementSheetData(null));
    PlanElementsHelper.unselectAllElements(planElements);
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    dispatch(setPlanMode(PlanMode.Move));
    dispatch(setSegOnCreationData(null));
    setSheetDataOpen(false);

  }, [dispatch, planElements]);


  return (
    <div className={styles['main']}
      style={{"width":""+appDynamicProps.leftMenuWidth+"px", "maxWidth":""+appDynamicProps.leftMenuWidth+"px"}}
    >
      <button className={`${styles['back-button']} ${sheetData? styles['active']: null}`} onClick={goBack}>&#8592;</button>
      {sheetDataOpen && sheetData?
        <PlanElementSheet sheetData={sheetData}/>
        :
        <div className={styles['linears-wrapper']}>
          <div className={styles['linears-header']}>AJOUTER UN LINEAIRE</div>
          <div className={styles['linears-body']}>
            <PlanElementButton name="Mur" onClick={handleClickOnAddWall}/>
            <PlanElementButton name="REP" onClick={handleClickOnAddREP}/>
            <PlanElementButton name="REU" onClick={handleClickOnAddREU}/>
            <PlanElementButton name="RAEP" onClick={handleClickOnAddAEP}/>
            <PlanElementButton name="Gouttière" onClick={handleClickOnAddGutter}/>
            <PlanElementButton name="Rés. Piscine" onClick={handleClickOnAddPool}/>
            <PlanElementButton name="Drain Routier" onClick={handleClickOnAddRoadDrain}/>
            <PlanElementButton name="Drain Agricole" onClick={handleClickOnAddAgrDrain}/>
          </div>
          <div className={styles['symbols-header']}>AJOUTER UN SYMBOLE</div>
          <div className={styles['symbols-body']}>
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
