import { PlanElement, PlanElementsHelper, PlanElementsRecordsHandler } from '@/entities';
import { setPlanElements, setPlanElementsRecords } from '@/redux/plan/plan.actions';
import { selectPlanElements, selectPlanElementsRecords } from '@/redux/plan/plan.selectors';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useSavePlan() {
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  // const planElements: PlanElement[] = useSelector(selectPlanElements);
  const dispatch = useDispatch();

  //lineToRemoveIndex is only for the case of drawing the first segment of a line
  const savePlan = useCallback((currentPlanElements: PlanElement[], nextPlanElements:PlanElement[])=>{
    console.log("savePlan")

    // const planElementsClone = PlanElementsHelper.clone(planElements);
    const planElementsRecordsClone:PlanElementsRecordsHandler = planElementsRecords.clone();

    planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex] = currentPlanElements;

    planElementsRecordsClone.currentRecordIndex++;
    planElementsRecordsClone.records = planElementsRecordsClone.records.slice(0, planElementsRecordsClone.currentRecordIndex);


    planElementsRecordsClone.records.push(nextPlanElements);

    dispatch(setPlanElementsRecords(planElementsRecordsClone));
    dispatch(setPlanElements(planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex]));
  },[dispatch, planElementsRecords]);
  return savePlan;
}