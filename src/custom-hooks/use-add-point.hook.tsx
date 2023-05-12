import { Line, PlanElement, PlanElementsHelper, Point, Vector2D } from '@/entities';
import { setAddingPointLineIdPointId, setPlanElements, updatePlanElement } from '@/redux/plan/plan.actions';
import { selectAddingPointLineIdPointId, selectPlanCursorPos, selectPlanElements } from '@/redux/plan/plan.selectors';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSavePlan } from './use-save-plan.hook';
import { v4 } from 'uuid';

export function useAddPoint() {
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
    const dispatch = useDispatch();
    const savePlan = useSavePlan();

    const addPoint = useCallback((pointOver:string | null) => {
        const currentStatePlanElementsClone = PlanElementsHelper.clone(planElements);
        const nextStatePlanElementsClone = PlanElementsHelper.clone(planElements);

        const [lineId, pointId]  = addingPointLineIdPointId as [string, string];
        // const lineIndex = PlanElementsHelper.findElementIndexById(planElementsClone, lineId);
        // if(lineIndex === -1) return; //todo: throw an error
        // if((planElements[lineIndex] as Line).path.length === 1){
        //     planElements.splice(lineIndex, 1);
        // }

        const line = PlanElementsHelper.findElementById(nextStatePlanElementsClone, lineId) as Line;
        if(!line) return; //todo: throw an error
        const pointIsAdded = line.addPoint(new Point(v4(), planCursorPos.x, planCursorPos.y), pointId as string, pointOver);
        dispatch(setAddingPointLineIdPointId(null));
        if(pointIsAdded){
            if(line.path.length === 2){ //if line had only one point (if we were adding the first segment) we remove the line
                const lineIndex = PlanElementsHelper.findElementIndexById(currentStatePlanElementsClone, lineId);
                currentStatePlanElementsClone.splice(lineIndex, 1);
            }
            
            savePlan(currentStatePlanElementsClone, nextStatePlanElementsClone);
        }else{
            if(line.path.length === 1){ //if line has only one point (if we were adding the first segment) we remove the line
                const lineIndex = PlanElementsHelper.findElementIndexById(currentStatePlanElementsClone, lineId);
                currentStatePlanElementsClone.splice(lineIndex, 1);
                dispatch(setPlanElements(currentStatePlanElementsClone));
            }
        }

        // const planElementsClone = PlanElementsHelper.clone(planElements);
        // const [lineId, pointId]  = addingPointLineIdPointId as [string, string];
        // const line = PlanElementsHelper.findElementById(planElementsClone, lineId) as Line;

        // if(!line) return;//todo: throw an error
        // if(line.path.length === 1){
            
        // }

        // const lineClone = PlanElementsHelper.findElementById(planElementsClone, lineId) as Line;
        // if(!lineClone) return; //todo: throw an error
        // lineClone.addPoint(new Point(planCursorPos.x, planCursorPos.y), pointId as string);
        // dispatch(setAddingPointLineIdPointId(null));
        // savePlan(planElementsClone);

    }, [addingPointLineIdPointId, dispatch, planCursorPos.x, planCursorPos.y, planElements, savePlan]);

  return addPoint;
}