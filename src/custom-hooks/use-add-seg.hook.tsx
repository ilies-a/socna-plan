import { AddSegSession, JointSegs, PlanElement, PlanElementsHelper, PlanElementsRecordsHandler, Position, Seg, SegClassName, SegNode, SegOnCreationData, Vector2D } from '@/entities';
import { setAddSegSession, setPlanElements, setPlanElementsRecords, setPlanElementsSnapshot, updatePlanElement } from '@/redux/plan/plan.actions';
import { selectPlanElements, selectPlanElementsRecords, selectSegOnCreationData } from '@/redux/plan/plan.selectors';
import { getOrthogonalProjection } from '@/utils';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useAddSeg() {
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const dispatch = useDispatch();
  const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);

  //lineToRemoveIndex is only for the case of drawing the first segment of a line
  const addSeg = useCallback((pointerPos: Vector2D, node?:SegNode, seg?:Seg)=>{
    let jointSegs:JointSegs | undefined;
    if(!segOnCreationData) return; //should throw error
    switch(segOnCreationData.segClassName){
        case(SegClassName.REP):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointREPs;
            break;
        }
        case(SegClassName.REU):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointREUs;
            break;
        }
        default:
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointWalls;
            break;
    }

    let addedSeg:Seg;
    let draggingNode:SegNode;

    if(node){
        [addedSeg, draggingNode] = jointSegs.addSegFromNode(node, pointerPos);
    }else if(seg){
        const pointOnSegMiddleLine:Vector2D = getOrthogonalProjection(seg.nodes[0].position, seg.nodes[1].position, new Position(pointerPos.x, pointerPos.y));
        [addedSeg, draggingNode] = jointSegs.addSegFromSeg(seg, [pointOnSegMiddleLine, pointerPos]);
    }
    else{
        [addedSeg, draggingNode] = jointSegs.addSegFromVoid(pointerPos, pointerPos);
    }

    dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));


    dispatch(setAddSegSession(
        new AddSegSession(
            jointSegs,
            addedSeg,
            draggingNode 
        )
    ));

    if(!segOnCreationData) return; //should throw error
    addedSeg.numero = segOnCreationData.numero;
    
    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
  },[dispatch, planElements, segOnCreationData]);
  return addSeg;
}