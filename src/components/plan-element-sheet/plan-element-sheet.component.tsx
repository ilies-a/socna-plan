
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Dimensions, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, Res, ResArrowStatus, Seg, SegClassName, SegOnCreationData, SheetData, SheetDataAEP, SheetDataAgrDrain, SheetDataGutter, SheetDataPool, SheetDataREP, SheetDataREU, SheetDataRes, SheetDataRoadDrain, SheetDataSeg, SheetDataWall, Wall, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setSegOnCreationData, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { NAME_TEXT_DEFAULT_FONT_SIZE } from "@/global";

type Props = {
    sheetData: SheetData,
  };


const PlanElementSheet: React.FC<Props> = ({sheetData}) => {
  const dispatch = useDispatch();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const planMode: PlanMode = useSelector(selectPlanMode);
  // const [inputNumero, setInputNumero] = useState<string>("");
  const savePlan = useSavePlan();
  const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);
  const [sheetDataPlanElement, setSheetDataPlanElement] = useState<PlanElement | undefined>();

  // useEffect(()=>{
  //   if(!sheetData.planElementId) return;

  //   setSheetDataPlanElement()
  // },[planElements]);


  // useEffect(()=>{
  //   setInputNumero("");
  // },[sheetData])

    // useEffect(()=>{
  //   setInputNumero("");
  // },[sheetData])

  const getRightJointSegs = useCallback((allJointSegs:AllJointSegs):JointSegs | undefined=>{
    if(sheetData instanceof SheetDataWall){
      return allJointSegs.jointWalls;
    } else if(sheetData instanceof SheetDataREP){
      return allJointSegs.jointREPs;
    } else if(sheetData instanceof SheetDataREU){
      return allJointSegs.jointREUs;
    } else if(sheetData instanceof SheetDataAEP){
      return allJointSegs.jointAEPs;
    } else if(sheetData instanceof SheetDataGutter){
      return allJointSegs.jointGutters;
    } else if(sheetData instanceof SheetDataPool){
      return allJointSegs.jointPools;
    } else if(sheetData instanceof SheetDataRoadDrain){
      return allJointSegs.jointRoadDrains;
    } else if(sheetData instanceof SheetDataAgrDrain){
      return allJointSegs.jointAgrDrains;
    }
  }, [sheetData]);


  const handleInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newNumero = e.currentTarget.value;
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        segOnCreationData!.numero = newNumero;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: newNumero, 
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: segOnCreationData.nameTextFontSize,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: segOnCreationData.sinister
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        seg.numero = newNumero;
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
          if(elIdx === -1) continue;
          const segInPlanElementsRecord = getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[segId];
          if(segInPlanElementsRecord){
            segInPlanElementsRecord.numero = newNumero;
          }
        }

      }

  
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, planElementsRecords.records, segOnCreationData, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    if(sheetData instanceof SheetDataWall){
      return "Mur";
    }else if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else if(sheetData instanceof SheetDataAEP){
      return "RAEP";
    }else if(sheetData instanceof SheetDataGutter){
      return "G";
    }else if(sheetData instanceof SheetDataPool){
      return "RP";
    }else if(sheetData instanceof SheetDataRoadDrain){
      return "DR";
    }else if(sheetData instanceof SheetDataAgrDrain){
      return "DA";
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
    getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.deleteSeg((sheetData as SheetDataSeg).segId!);

    if(!sheetDataPlanElement) return; //theorically not possible but just in case
    // dispatch(updatePlanElement(sheetDataPlanElement));
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, getRightJointSegs, sheetData, dispatch, savePlan]);


  const handleShowArrowInputChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const showArrow = e.currentTarget.checked;
    if(segOnCreationData != null){
      segOnCreationData.resArrowStatus = showArrow ? ResArrowStatus.Forwards : ResArrowStatus.None;
      dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, 
        numero: segOnCreationData.numero, 
        nameTextVisibility: segOnCreationData.nameTextVisibility, 
        resArrowStatus: segOnCreationData.resArrowStatus,
        nameTextFontSize: segOnCreationData.nameTextFontSize,
        nameTextRotation: segOnCreationData.nameTextRotation,
        sinister: segOnCreationData.sinister
      }));
    }else{
      const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const res:Res = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Res;

      res.arrowStatus = showArrow ? ResArrowStatus.Forwards : ResArrowStatus.None;

      const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
      savePlan(currentPlanElementsClone, nextPlanElementsClone);
      // dispatch(updatePlanElement(sheetDataPlanElement));
      // dispatch(setPlanElementsRecords(planElementsRecords.clone()));

    }
  },[dispatch, getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);

  const handleShowNameInputChange= useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const showName = e.currentTarget.checked;

    if(segOnCreationData != null){
      segOnCreationData.nameTextVisibility = showName;
      dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, 
        numero: segOnCreationData.numero, 
        nameTextVisibility: segOnCreationData.nameTextVisibility, 
        resArrowStatus: segOnCreationData.resArrowStatus,
        nameTextFontSize: segOnCreationData.nameTextFontSize,
        nameTextRotation: segOnCreationData.nameTextRotation,
        sinister: segOnCreationData.sinister
      }));
      return segOnCreationData.nameTextVisibility;
    }else{

      const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const seg:Seg = getRightJointSegs(sheetDataPlanElement)!.segs[segId];

      if(!showName){
        seg.nameTextVisibility = false;
      }else{
        seg.nameTextPosition = {x:seg.nodes[0].position.x, y:seg.nodes[0].position.y};
        seg.nameTextFontSize = seg.nameTextFontSize;
        seg.nameTextRotation = seg.nameTextRotation;
        seg.nameTextVisibility = true;
      }

      const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
      savePlan(currentPlanElementsClone, nextPlanElementsClone);
      // dispatch(updatePlanElement(sheetDataPlanElement));
      // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
      return seg.nameTextVisibility;
    }

  },[dispatch, getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);

  const nameIsVisible = useCallback(():boolean=>{
    if(segOnCreationData != null){
      return segOnCreationData.nameTextVisibility;
    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const seg:Seg = getRightJointSegs(sheetDataPlanElement)!.segs[segId];

      return seg? seg.nameTextVisibility:false;

    }
    return false;
  },[getRightJointSegs, planElements, segOnCreationData, sheetData]);

  const reverseArrow = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
    const segId = (sheetData as SheetDataSeg).segId!;
    const res:Res = getRightJointSegs(sheetDataPlanElement)!.segs[segId] as Res;

    res.arrowStatus = res.arrowStatus === ResArrowStatus.Backwards ? ResArrowStatus.Forwards : ResArrowStatus.Backwards;

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  },[getRightJointSegs, planElements, savePlan, sheetData]);

  const arrowIsVisible = ():boolean=>{
    if(segOnCreationData != null){
      return segOnCreationData.resArrowStatus != ResArrowStatus.None;
    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const res:Res = getRightJointSegs(sheetDataPlanElement)!.segs[segId] as Res;
  
      return res? res.arrowStatus != ResArrowStatus.None : false;
    }
    return false;

  }

  const getNumero = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.numero;
      }
      else if(sheetData.planElementId != undefined){
        const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        return seg? seg.numero : "";
      
      }

    }

    return "";
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);


  const getTextSize = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.nameTextFontSize.toString();
      }
      else if(sheetData.planElementId != undefined){

        const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        return seg.nameTextFontSize.toString();
        
      }

    }
    return "";
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);



  const handleSizeInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newSize = e.currentTarget.value;
    const newSizeNumber = parseFloat(newSize);
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        // segOnCreationData!.nameTextFontSize = newSizeNumber;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: segOnCreationData.numero, 
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: newSizeNumber,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: segOnCreationData.sinister
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;

        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        seg.nameTextFontSize = newSizeNumber;
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
          if(elIdx === -1) continue;
          const segInPlanElementsRecord = getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[segId];
          if(segInPlanElementsRecord){
            segInPlanElementsRecord.nameTextFontSize = newSizeNumber;
          }
        }

      }

    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    // dispatch(updatePlanElement(sheetDataPlanElement));
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, planElementsRecords.records, segOnCreationData, sheetData]);




  const getSheetTitle = ():string=>{
    let preTitle = segOnCreationData != null? " en création": "";
    if(segOnCreationData){
      switch(segOnCreationData.segClassName){
        case(SegClassName.Wall):{
          return "Mur"+preTitle;
        }
        case(SegClassName.REP):{
          return "REP"+preTitle;
        }
        case(SegClassName.REU):{
          return "REU"+preTitle;
        }
        case(SegClassName.AEP):{
          return "AEP"+preTitle;
        }
        case(SegClassName.Gutter):{
          return "Gouttière"+preTitle;
        }
        case(SegClassName.Pool):{
          return "Rés. Piscine"+preTitle;
        }
        case(SegClassName.RoadDrain):{
          return "Drain Routier"+preTitle;
        }
        case(SegClassName.AgrDrain):{
          return "Drain Agricole"+preTitle;
        }
        default:{
          return "";
        }
      }
    }
    if(sheetData instanceof SheetDataWall){
      return "Mur";
    }else if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else if(sheetData instanceof SheetDataAEP){
      return "AEP";
    }else if(sheetData instanceof SheetDataGutter){
      return "Gouttière";
    }else if(sheetData instanceof SheetDataPool){
      return "Rés. Piscine";
    }else if(sheetData instanceof SheetDataRoadDrain){
      return "Drain Routier";
    }else if(sheetData instanceof SheetDataAgrDrain){
      return "Drain Agricole";
    }
    return "";
  }



  const handleSinisterInputChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newValue = e.currentTarget.checked;
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataWall){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        segOnCreationData!.sinister = newValue;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: segOnCreationData.numero,
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: segOnCreationData.nameTextFontSize,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: newValue,
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Wall;
        seg.sinister = newValue;
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
          if(elIdx === -1) continue;
          const segInPlanElementsRecord = getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[segId] as Wall;
          if(segInPlanElementsRecord){
            segInPlanElementsRecord.sinister = newValue;
          }
        }

      }

  
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, planElementsRecords.records, segOnCreationData, sheetData]);

  
  const getSinister = useCallback(():boolean=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(!(sheetData instanceof SheetDataWall)) return false;

    const segId = (sheetData as SheetDataSeg).segId!;

    if(segIsOnCreation){
      return segOnCreationData!.sinister;
    }
    else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Wall;
      if(!seg) return false; //otherwise bug if wall is deleted
      return seg.sinister;
    }
    return false;
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);


  return (
    <div className={`${styles['main']}`} >
      <div className={styles['sheet-header']}>{getSheetTitle()}</div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>Ref</div>
        <div className={`${styles['content']}`}>{convertTypeNameToString() + getNumero()}</div>
      </div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>N°</div>
        <input
            className={`${styles['content']}`}
            value={getNumero()}
            type="number"
            min="0"
            onChange={(e) => {handleInputOnChange(e)}} 
        />
      </div>
      
      <div>
          <input 
            type="checkbox" 
            id="show-name" 
            className={styles["checkbox"]}
            onChange={handleShowNameInputChange}
            checked={nameIsVisible()}
          />
          <label htmlFor="show-name">Afficher le nom</label>
        </div>
      {/* <button className={styles['toggle-name-visibility-btn']}
        onClick={toggleNameVisibility}
      > */}
        {/* {nameIsVisible()?"Cacher":"Afficher"} le nom
      </button> */}
      {nameIsVisible()?
        <>
          <input type="range" id="size" name="size" value={getTextSize()} onChange={handleSizeInputOnChange}
          min="16" max="22"/>
          <label htmlFor="size">Taille</label>
          {/* <input type="range" id="rotation" name="rotation" value={getTextRotation()} onChange={(e)=>{handleRotationInputOnChange(e)}}
          min="0" max="360"/>
          <label htmlFor="volume">Angle</label> */}
        </>
        :null
      }

      {sheetData instanceof SheetDataRes?
        <div>
          {/* <button
            className={styles['toggle-arrow-visibility-btn']}
            onClick={toggleArrowVisibility}
          >{arrowIsVisible()?"Cacher":"Afficher"} la flèche</button> */}

          <input 
            type="checkbox" 
            id="show-arrow"
            className={styles["checkbox"]}
            onChange={handleShowArrowInputChange}
            checked={arrowIsVisible()}
          />
          <label htmlFor="show-arrow">Afficher la flèche</label>
          {
            segOnCreationData === null && arrowIsVisible()?
            <button
              className={styles['reverse-arrow-btn']}
              onClick={reverseArrow}
            >Inverser la flèche</button>
            :null
          }

        </div>
        :null
      }
      {
        sheetData instanceof SheetDataWall?
        <div>
          <input 
            type="checkbox"
            id="sinister"
            className={styles["checkbox"]}
            onChange={handleSinisterInputChange}
            checked={getSinister()}
          />
          <label htmlFor="sinister">Sinistre</label>
        </div>
        :null
      }
      {!segOnCreationData?
        <button className={styles['del-btn']}
          onClick={deleteElement}
        >
          <div className={styles['del-cross']}>
            +</div> Supprimer
        </button>
        :null
      }
    </div>
  )
};

export default PlanElementSheet;