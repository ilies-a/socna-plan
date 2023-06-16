
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Dimensions, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, Res, ResArrowStatus, SegClassName, SegOnCreationData, SheetData, SheetDataAEP, SheetDataREP, SheetDataREU, SheetDataRes, SheetDataSeg, SheetDataWall, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setSegOnCreationData, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";

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
        dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, numero: newNumero, resArrowStatus: segOnCreationData.resArrowStatus}));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        if(sheetData instanceof SheetDataWall){
          sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
          const wall = (sheetDataPlanElement as AllJointSegs).jointWalls.segs[segId];
          wall.numero = newNumero;

          //update planElements saves with the updated numero
          // if(!segId) return;
          for(const planElementsRecord of planElementsRecords.records){
            const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
            if(elIdx === -1) continue;
            const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointWalls.segs[segId];
            if(wallInPlanElementsRecord){
              wallInPlanElementsRecord.numero = newNumero;
            }
          }
        }
        else if(sheetData instanceof SheetDataREP){
          sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
          const res = (sheetDataPlanElement as AllJointSegs).jointREPs.segs[segId];
          res.numero = newNumero;

          //update planElements saves with the updated numero
          // if(!segId) return;
          for(const planElementsRecord of planElementsRecords.records){
            const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
            if(elIdx === -1) continue;
            const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointREPs.segs[segId];
            if(wallInPlanElementsRecord){
              wallInPlanElementsRecord.numero = newNumero;
            }
          }

        }else if(sheetData instanceof SheetDataREU){
          sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
          const res = (sheetDataPlanElement as AllJointSegs).jointREUs.segs[segId];
          res.numero = newNumero;

          //update planElements saves with the updated numero
          // if(!segId) return;
          for(const planElementsRecord of planElementsRecords.records){
            const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
            if(elIdx === -1) continue;
            const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointREUs.segs[segId];
            if(wallInPlanElementsRecord){
              wallInPlanElementsRecord.numero = newNumero;
            }
          }
        }else if(sheetData instanceof SheetDataAEP){
          sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
          const res = (sheetDataPlanElement as AllJointSegs).jointAEPs.segs[segId];
          res.numero = newNumero;

          //update planElements saves with the updated numero
          // if(!segId) return;
          for(const planElementsRecord of planElementsRecords.records){
            const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
            if(elIdx === -1) continue;
            const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointAEPs.segs[segId];
            if(wallInPlanElementsRecord){
              wallInPlanElementsRecord.numero = newNumero;
            }
          }
        }


      }

  
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, planElements, planElementsRecords, segOnCreationData, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    if(sheetData instanceof SheetDataWall){
      return "Mur";
    }
    else if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else if(sheetData instanceof SheetDataAEP){
      return "AEP";
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    let sheetDataPlanElement:PlanElement | undefined;
    if(sheetData instanceof SheetDataWall){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointWalls.deleteSeg((sheetData as SheetDataWall).segId!);
    }
    else if(sheetData instanceof SheetDataREP){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointREPs.deleteSeg((sheetData as SheetDataREP).segId!);
    }else if(sheetData instanceof SheetDataREU){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointREUs.deleteSeg((sheetData as SheetDataREU).segId!);
    }else if(sheetData instanceof SheetDataAEP){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointAEPs.deleteSeg((sheetData as SheetDataAEP).segId!);
    }

    if(!sheetDataPlanElement) return; //theorically not possible but just in case
    dispatch(updatePlanElement(sheetDataPlanElement));
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch]);


  const toggleArrowVisibility = useCallback(()=>{
    if(segOnCreationData != null){
      segOnCreationData.resArrowStatus = segOnCreationData.resArrowStatus == ResArrowStatus.None? ResArrowStatus.Forwards : ResArrowStatus.None;

    }else{
      const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      let res:Res;

      if(sheetData instanceof SheetDataREP){
        res = sheetDataPlanElement.jointREPs.segs[segId] as Res;
      }else if(sheetData instanceof SheetDataREU){
        res = sheetDataPlanElement.jointREUs.segs[segId] as Res;
      }else if(sheetData instanceof SheetDataAEP){
        res = sheetDataPlanElement.jointAEPs.segs[segId] as Res;
      }
      else{
        return; //should throw error
      }
      res.arrowStatus = res.arrowStatus == ResArrowStatus.None? ResArrowStatus.Forwards : ResArrowStatus.None;

      const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
      savePlan(currentPlanElementsClone, nextPlanElementsClone);
      // dispatch(updatePlanElement(sheetDataPlanElement));
      // dispatch(setPlanElementsRecords(planElementsRecords.clone()));

    }
  },[planElements, savePlan, segOnCreationData, sheetData]);

  const reverseArrow = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
    const segId = (sheetData as SheetDataSeg).segId!;
    let res:Res;

    if(sheetData instanceof SheetDataREP){
      res = sheetDataPlanElement.jointREPs.segs[segId] as Res;
    }else if(sheetData instanceof SheetDataREU){
      res = sheetDataPlanElement.jointREUs.segs[segId] as Res;
    }else if(sheetData instanceof SheetDataAEP){
      res = sheetDataPlanElement.jointAEPs.segs[segId] as Res;
    }
    else{
      return; //should throw error
    }

    res.arrowStatus = res.arrowStatus === ResArrowStatus.Backwards ? ResArrowStatus.Forwards : ResArrowStatus.Backwards;

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  },[planElements, savePlan, sheetData]);

  const arrowIsVisible = ():boolean=>{
    if(segOnCreationData != null){
      return segOnCreationData.resArrowStatus != ResArrowStatus.None;
    }else{
      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      let res:Res;
  
      if(sheetData instanceof SheetDataREP){
        res = sheetDataPlanElement.jointREPs.segs[segId] as Res;
      }else if(sheetData instanceof SheetDataREU){
        res = sheetDataPlanElement.jointREUs.segs[segId] as Res;
      }else if(sheetData instanceof SheetDataAEP){
        res = sheetDataPlanElement.jointAEPs.segs[segId] as Res;
      }
      else{
        return false; //should throw error
      }
      if(!res) return false;

      return res.arrowStatus != ResArrowStatus.None;
    }

  }

  const getNumero = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.numero;
      }
      else if(sheetData.planElementId != undefined){
        if(sheetData instanceof SheetDataWall){
          const wall = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointWalls.segs[segId];
          return wall? wall.numero : ""; //wall can be undefined, 
          //because imo after wall deletion, planElements is updated before sheetData and then this function is redefined
          //with a deleted (undefined) wall
        }
        else if(sheetData instanceof SheetDataREP){
          const res = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointREPs.segs[segId];
          return res? res.numero : ""; 
        }else if(sheetData instanceof SheetDataREU){
          const res = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointREUs.segs[segId];
          return res? res.numero : ""; 
        }else if(sheetData instanceof SheetDataAEP){
          const res = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointAEPs.segs[segId];
          return res? res.numero : ""; //wall can be undefined, 
          //because imo after wall deletion, planElements is updated before sheetData and then this function is redefined
          //with a deleted (undefined) wall
          
        }
      }

    }


    // switch(sheetData.instantiatedSegClassName){
    //   default:{
    //     if(segIsOnCreation){
    //       return segOnCreationData!.numero;
    //     }else if(sheetData.planElementId != undefined){
    //       const segId = (sheetData as SheetDataWall).segId!;
    //       const wall = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointWalls.segs[segId];
    //       return wall? wall.numero : ""; //wall can be undefined, 
    //       //because imo after wall deletion, planElements is updated before sheetData and then this function is redefined
    //       //with a deleted (undefined) wall
    //     }
    //   }
    // }
    return "";
  }, [planElements, segOnCreationData, sheetData]);


  const getSheetTitle = ():string=>{
    if(segOnCreationData){
      switch(segOnCreationData.segClassName){
        case(SegClassName.Wall):{
          return "Mur";
        }
        case(SegClassName.REP):{
          return "REP";
        }
        case(SegClassName.REU):{
          return "REU";
        }
        case(SegClassName.AEP):{
          return "AEP";
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
    }
    return "";
  }

  return (
    <div className={`${styles['main']}`} >
      <div className={styles['sheet-header']}>{getSheetTitle()}</div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>Ref</div>
        <div className={`${styles['content']}`}>{convertTypeNameToString() + "_" + getNumero()}</div>
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
      {sheetData instanceof SheetDataRes?
        <>
          <button
            className={styles['toggle-arrow-visibility-btn']}
            onClick={toggleArrowVisibility}
          >{arrowIsVisible()?"Cacher":"Afficher"} la flèche</button>
          {
            segOnCreationData === null && arrowIsVisible()?
            <button
              className={styles['reverse-arrow-btn']}
              onClick={reverseArrow}
            >Inverser le sens de la flèche</button>
            :null
          }

        </>
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