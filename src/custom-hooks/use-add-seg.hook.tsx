import { AddSegSession, JointSegs, JointSegsClassName, PlanElement, PlanElementsHelper, PlanElementsRecordsHandler, Position, Seg, SegClassName, SegNode, SegOnCreationData, Vector2D } from '@/entities';
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

//   const addSegOnCompatibleNodeOrSeg = (segClassName: SegClassName, node?:SegNode, seg?:Seg) =>{
//     if(node){
//         if(
//             !(segClassName === SegClassName.Wall && node.jointSegClassName === JointSegsClassName.JointWalls) &&
//             !(segClassName === SegClassName.REP && node.jointSegClassName === JointSegsClassName.JointREPs) &&
//             !(segClassName === SegClassName.REU && node.jointSegClassName === JointSegsClassName.JointREUs)
//         ){
//             return false;
//         }
//     }else if(seg){
//         if(
//             !(segClassName === SegClassName.Wall && seg.instantiatedSegClassName === SegClassName.Wall) &&
//             !(segClassName === SegClassName.REP && seg.instantiatedSegClassName === SegClassName.REP) &&
//             !(segClassName === SegClassName.REU && seg.instantiatedSegClassName === SegClassName.REU)
//         ){
//             return false;
//         }
//     }
//     return true;
//   };


  //lineToRemoveIndex is only for the case of drawing the first segment of a line
  const addSeg = useCallback((pointerPos: Vector2D, node?:SegNode, seg?:Seg): boolean=>{
    let jointSegs:JointSegs | undefined;
    if(!segOnCreationData) return false; //should throw error
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

    if(node){ //check if seg on creation and node are the from same category of segs
        if(
            !(segOnCreationData.segClassName === SegClassName.Wall && node.jointSegClassName === JointSegsClassName.JointWalls) &&
            !(segOnCreationData.segClassName === SegClassName.REP && node.jointSegClassName === JointSegsClassName.JointREPs) &&
            !(segOnCreationData.segClassName === SegClassName.REU && node.jointSegClassName === JointSegsClassName.JointREUs)
        ){
            return false;
        }
        [addedSeg, draggingNode] = jointSegs.addSegFromNode(node, pointerPos);
    }else if(seg){ //check if seg on creation and seg are the from same category of segs
        if(
            !(segOnCreationData.segClassName === SegClassName.Wall && seg.instantiatedSegClassName === SegClassName.Wall) &&
            !(segOnCreationData.segClassName === SegClassName.REP && seg.instantiatedSegClassName === SegClassName.REP) &&
            !(segOnCreationData.segClassName === SegClassName.REU && seg.instantiatedSegClassName === SegClassName.REU)
        ){
            return false;
        }
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

    if(!segOnCreationData) return false; //should throw error
    addedSeg.numero = segOnCreationData.numero;
    
    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
    return true;
  },[dispatch, planElements, segOnCreationData]);
  return addSeg;
}