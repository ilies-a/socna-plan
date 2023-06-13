
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Dimensions, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, SegOnCreationData, SheetData, SheetDataChildClassName, SheetDataREP, SheetDataREU, SheetDataSeg, SheetDataWall, iconDataArr } from "@/entities";
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
        dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, numero: newNumero}));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        if(sheetData instanceof SheetDataREP){
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

        }else{
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


      }

  
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(updatePlanElement(sheetDataPlanElement));
    dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, planElements, planElementsRecords, segOnCreationData, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else{
      return "Wall";
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    let sheetDataPlanElement:PlanElement | undefined;

    if(sheetData instanceof SheetDataREP){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointREPs.deleteSeg((sheetData as SheetDataREP).segId!);
    }else if(sheetData instanceof SheetDataREU){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointREUs.deleteSeg((sheetData as SheetDataREU).segId!);
    }else{
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointWalls.deleteSeg((sheetData as SheetDataWall).segId!);
    }


    if(!sheetDataPlanElement) return; //theorically not possible but just in case
    dispatch(updatePlanElement(sheetDataPlanElement));
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch]);


  const getNumero = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.numero;
      }
      else if(sheetData.planElementId != undefined){
        if(sheetData instanceof SheetDataREP){
          const res = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointREPs.segs[segId];
          return res? res.numero : ""; 
        }else if(sheetData instanceof SheetDataREU){
          const res = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointREUs.segs[segId];
          return res? res.numero : ""; 
        }else{
          const wall = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointWalls.segs[segId];
          return wall? wall.numero : ""; //wall can be undefined, 
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



  return (
    <div className={`${styles['main']}`} >
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