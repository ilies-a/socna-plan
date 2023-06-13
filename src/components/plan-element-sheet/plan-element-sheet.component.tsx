
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
      if(sheetData instanceof SheetDataWall){
        if(segIsOnCreation){
          segOnCreationData!.numero = newNumero;
          dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, numero: newNumero}));
        }
        else if(sheetData.planElementId != undefined){
          const wallId = (sheetData as SheetDataWall).wallId!;
          sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
          const wall = (sheetDataPlanElement as AllJointSegs).jointWalls.segs[wallId];
          wall.numero = newNumero;
  
          //update planElements saves with the updated numero
          for(const planElementsRecord of planElementsRecords.records){
            const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
            if(elIdx === -1) continue;
            const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointWalls.segs[wallId];
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
      console.log("instanceof REP")
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      console.log("instanceof REU")
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
      .jointWalls.deleteSeg((sheetData as SheetDataREP).resId!);
    }else if(sheetData instanceof SheetDataREU){
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointWalls.deleteSeg((sheetData as SheetDataREU).resId!);
    }else{
      sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      (sheetDataPlanElement as AllJointSegs)
      .jointWalls.deleteSeg((sheetData as SheetDataWall).wallId!);
    }


    if(!sheetDataPlanElement) return; //theorically not possible but just in case
    dispatch(updatePlanElement(sheetDataPlanElement));
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch]);


  const getNumero = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataREP){

    }else if(sheetData instanceof SheetDataREU){

    }else{
      if(segIsOnCreation){
        return segOnCreationData!.numero;
      }else if(sheetData.planElementId != undefined){
        const wallId = (sheetData as SheetDataWall).wallId!;
        const wall = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointWalls.segs[wallId];
        return wall? wall.numero : ""; //wall can be undefined, 
        //because imo after wall deletion, planElements is updated before sheetData and then this function is redefined
        //with a deleted (undefined) wall
      }
    }


    // switch(sheetData.instantiatedSegClassName){
    //   default:{
    //     if(segIsOnCreation){
    //       return segOnCreationData!.numero;
    //     }else if(sheetData.planElementId != undefined){
    //       const wallId = (sheetData as SheetDataWall).wallId!;
    //       const wall = (PlanElementsHelper.getAllJointSegs(planElements) as AllJointSegs).jointWalls.segs[wallId];
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