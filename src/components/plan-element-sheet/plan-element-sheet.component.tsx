
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { Dimensions, JoinedWalls, PlanElement, PlanElementSheetData, PlanElementSheetTypeName, PlanElementsHelper, PlanElementsRecordsHandler, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords } from "@/redux/plan/plan.selectors";

type Props = {
    data: PlanElementSheetData,
  };


const PlanElementSheet: React.FC<Props> = ({data}) => {
  const dispatch = useDispatch();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);

  const [inputNumero, setInputNumero] = useState<string | null>(null);

  useEffect(()=>{
    setInputNumero(null);
  },[data.planElementId, data.wallId])

  const handleInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newNumero = e.currentTarget.value;
    setInputNumero(newNumero);

    const el = PlanElementsHelper.findElementById(planElements, data.planElementId);
    if(!el) return;
    const isWall = data.wallId;
    if(isWall){ //then its a wall
      const wall = (el as JoinedWalls).walls[data.wallId!];
      if (!wall) return;
      wall.numero = newNumero;
    }
    dispatch(updatePlanElement(el));

    //todo: update planElements saves with the updated numero
    for(const planElements of planElementsRecords.records){
      const elIdx = PlanElementsHelper.findElementIndexById(planElements, data.planElementId);
      if(elIdx === -1) continue;
      const wall = (planElements[elIdx] as JoinedWalls).walls[data.wallId!];
      if(isWall && wall){
        wall.numero = newNumero;
      }
    }

    dispatch(setPlanElementsRecords(planElementsRecords.clone()));

    const sheetData:PlanElementSheetData = {planElementId:data.planElementId , wallId:data.wallId, typeName: data.typeName, numero:e.currentTarget.value};
    dispatch(setPlanElementSheetData(sheetData));
  },[data.planElementId, data.typeName, data.wallId, dispatch, planElements, planElementsRecords]);

  const convertTypeNameToString = useCallback(()=>{
    switch(data.typeName){
      case PlanElementSheetTypeName.Wall:{
        return "Mur";
      }
      default:{
        return "";
      }
    }
  },[data.typeName]);

  return (
    <div className={`${styles['main']}`} >
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>Ref</div>
        <div className={`${styles['content']}`}>{convertTypeNameToString() + "_" + data.numero}</div>
      </div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>N°</div>
        <input
            className={`${styles['content']}`}
            value={inputNumero != null ? inputNumero : data.numero? data.numero: ""}
            type="number"
            min="0"
            onChange={(e) => {handleInputOnChange(e)}} 
        />
      </div>
    </div>
  )
};

export default PlanElementSheet;