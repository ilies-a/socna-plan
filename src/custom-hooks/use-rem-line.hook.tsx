import { Line, PlanElement, PlanElementsHelper, Point, Vector2D } from '@/entities';
import { setAddingPointLineIdPointId, setPlanElements, updatePlanElement } from '@/redux/plan/plan.actions';
import { selectAddingPointLineIdPointId, selectPlanCursorPos, selectPlanElements } from '@/redux/plan/plan.selectors';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useRemLine() {
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
    const dispatch = useDispatch();

    const removeLineIfNoPoints = useCallback((lineIndex:number) => {
        if((planElements[lineIndex] as Line).path.length < 2){
            const clone = PlanElementsHelper.clone(planElements);
            clone.splice(lineIndex, 1);
            dispatch(setPlanElements(clone));
        }
    }, [dispatch, planElements]);

  return removeLineIfNoPoints;
}