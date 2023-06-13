
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Dimensions, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, SegOnCreationData, SheetData, SheetDataChildClassName, SheetDataWall, iconDataArr } from "@/entities";
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
    const segIsOnCreation = segOnCreationData != null;
    let sheetDataPlanElement:PlanElement | undefined;

    switch(sheetData.instantiatedSegClassName){
      default:{
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

        break;
      }
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(updatePlanElement(sheetDataPlanElement));
    dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, planElements, planElementsRecords, segOnCreationData, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    switch(sheetData.instantiatedSegClassName){
      default:{    
        return "Mur"
      }
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    let sheetDataPlanElement:PlanElement | undefined;

    switch(sheetData.instantiatedSegClassName){
      default:{
        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        (sheetDataPlanElement as AllJointSegs)
        .jointWalls.deleteSeg((sheetData as SheetDataWall).wallId!);
      }
    }
    if(!sheetDataPlanElement) return; //theorically not possible but just in case
    dispatch(updatePlanElement(sheetDataPlanElement));
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch]);


  const getNumero = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    switch(sheetData.instantiatedSegClassName){
      default:{
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
    }
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