import { Line, PlanElement, PlanElementsHelper, Point, Vector2D } from '@/entities';
import { setAddingPointLineIdPointId, setPlanElements, updatePlanElement } from '@/redux/plan/plan.actions';
import { selectAddingPointLineIdPointId, selectPlanCursorPos, selectPlanElements } from '@/redux/plan/plan.selectors';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useAddPoint() {
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
    const dispatch = useDispatch();

    const addPoint = useCallback(() => {
        const [lineId, pointId]  = addingPointLineIdPointId as [string, string];
        const line = PlanElementsHelper.findElementById(planElements, lineId) as Line;
        if(!line) return;
        line.addPoint(new Point(planCursorPos.x, planCursorPos.y), pointId as string);
        // l.selectPointIndex(l.selectedPointIndex as number + 1);
        dispatch(updatePlanElement(line));
        // if(addOnSeries) return;
        dispatch(setAddingPointLineIdPointId(null));

    }, [addingPointLineIdPointId, dispatch, planCursorPos, planElements]);

  return addPoint;
}