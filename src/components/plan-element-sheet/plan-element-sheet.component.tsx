
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Dimensions, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, SheetData, SheetDataChildClassName, SheetDataWall, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords, selectPlanMode } from "@/redux/plan/plan.selectors";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";

type Props = {
    sheetData: SheetData,
  };


const PlanElementSheet: React.FC<Props> = ({sheetData}) => {
  const dispatch = useDispatch();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const [inputNumero, setInputNumero] = useState<string | null>(null);
  const savePlan = useSavePlan();
  
  // useEffect(()=>{
  //   console.log("render sheetData", sheetData)
  // },[sheetData]);


  useEffect(()=>{
    setInputNumero(null);
  },[sheetData])

  const handleInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newNumero = e.currentTarget.value;
    setInputNumero(newNumero);

    switch(sheetData.instantiatedSegClassName){
      default:{
        const wall = (sheetData as SheetDataWall).wall;
        wall.numero = newNumero;

        //todo: update planElements saves with the updated numero
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElement.id);
          if(elIdx === -1) continue;
          
          const wallInPlanElementsRecord = (planElementsRecord[elIdx] as AllJointSegs).jointWalls.segs[wall.id];
            if(wallInPlanElementsRecord){
              wallInPlanElementsRecord.numero = newNumero;
            }
          }
        }
        break;
      }
    
    dispatch(updatePlanElement(sheetData.planElement));
    dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  


 

    //   const isSeg = sheetData.segId;
    //   if(isSeg){ //then its a seg
    //     const seg = (el as JointSegs).segs[sheetData.segId!];
    //     if (!seg) return;
    //     seg.numero = newNumero;
    //   }
    //   dispatch(updatePlanElement(el));

    //   //todo: update planElements saves with the updated numero
    //   for(const planElements of planElementsRecords.records){
    //     const elIdx = PlanElementsHelper.findElementIndexById(planElements, sheetData.planElementId);
    //     if(elIdx === -1) continue;
    //     const seg = (planElements[elIdx] as JointSegs).segs[sheetData.segId!];
    //     if(isSeg && seg){
    //       seg.numero = newNumero;
    //     }
    //   }
    //   dispatch(setPlanElementsRecords(planElementsRecords.clone()));
    // }
    // const sheetData:PlanElementSheetData = {planElementId:sheetData.planElementId , segId:sheetData.segId, typeName: sheetData.typeName, numero:e.currentTarget.value};
    // dispatch(setPlanElementSheetData(sheetData));
    
  },[dispatch, planElementsRecords, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    switch(sheetData.instantiatedSegClassName){
      default:{    
        return "Mur"
      }
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    switch(sheetData.instantiatedSegClassName){
      default:{
        (sheetData.planElement as AllJointSegs)
        .jointWalls.deleteSeg((sheetData as SheetDataWall).wall.id);
      }
    }
    dispatch(updatePlanElement(sheetData.planElement));
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch]);


  const getNumero = useCallback(():string=>{
    switch(sheetData.instantiatedSegClassName){
      default:{
        return (sheetData as SheetDataWall).wall.numero;
      }
    }
  }, [sheetData]);



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
            value={inputNumero != null ? inputNumero : getNumero()? getNumero(): ""}
            type="number"
            min="0"
            onChange={(e) => {handleInputOnChange(e)}} 
        />
      </div>
      {planMode != PlanMode.AddSeg?
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