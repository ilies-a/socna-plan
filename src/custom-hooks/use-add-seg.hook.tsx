import { AEP, AddSegSession, AgrDrain, Gutter, JointSegs, JointSegsClassName, PlanElement, PlanElementsHelper, PlanElementsRecordsHandler, Pool, Position, REP, REU, Res, RoadDrain, Seg, SegClassName, SegNode, SegOnCreationData, Vector2D, Wall } from '@/entities';
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

  const addSeg = useCallback((pointerPos: Vector2D, node?:SegNode, seg?:Seg): boolean=>{
    let jointSegs:JointSegs | undefined;
    if(!segOnCreationData) return false; //should throw error
    switch(segOnCreationData.segClassName){
        case(SegClassName.Wall):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointWalls;
            break;
        }
        case(SegClassName.REP):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointREPs;
            break;
        }
        case(SegClassName.REU):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointREUs;
            break;
        }
        case(SegClassName.AEP):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointAEPs;
            break;
        }
        case(SegClassName.Gutter):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointGutters;
            break;
        }
        case(SegClassName.Pool):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointPools;
            break;
        }
        case(SegClassName.RoadDrain):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointRoadDrains;
            break;
        }
        case(SegClassName.AgrDrain):{
            jointSegs = PlanElementsHelper.getAllJointSegs(planElements).jointAgrDrains;
            break;
        }
    }

    let addedSeg:Seg;
    let draggingNode:SegNode;

    if(node){ //check if seg on creation and node are the from same category of segs
        if(
            !(segOnCreationData.segClassName === SegClassName.Wall && node.jointSegClassName === JointSegsClassName.JointWalls) &&
            !(segOnCreationData.segClassName === SegClassName.REP && node.jointSegClassName === JointSegsClassName.JointREPs) &&
            !(segOnCreationData.segClassName === SegClassName.REU && node.jointSegClassName === JointSegsClassName.JointREUs) &&
            !(segOnCreationData.segClassName === SegClassName.AEP && node.jointSegClassName === JointSegsClassName.JointAEPs) &&
            !(segOnCreationData.segClassName === SegClassName.Gutter && node.jointSegClassName === JointSegsClassName.JointGutters) &&
            !(segOnCreationData.segClassName === SegClassName.Pool && node.jointSegClassName === JointSegsClassName.JointPools) &&
            !(segOnCreationData.segClassName === SegClassName.RoadDrain && node.jointSegClassName === JointSegsClassName.JointRoadDrains) &&
            !(segOnCreationData.segClassName === SegClassName.AgrDrain && node.jointSegClassName === JointSegsClassName.JointAgrDrains)
        ){
            return false;
        }
        [addedSeg, draggingNode] = jointSegs.addSegFromNode(node, pointerPos);
    }else if(seg){ //check if seg on creation and seg are the from same category of segs
        if(
            !(segOnCreationData.segClassName === SegClassName.Wall && seg instanceof Wall) &&
            !(segOnCreationData.segClassName === SegClassName.REP && seg instanceof REP) &&
            !(segOnCreationData.segClassName === SegClassName.REU && seg instanceof REU) &&
            !(segOnCreationData.segClassName === SegClassName.AEP && seg instanceof AEP) &&
            !(segOnCreationData.segClassName === SegClassName.Gutter && seg instanceof Gutter) &&
            !(segOnCreationData.segClassName === SegClassName.Pool && seg instanceof Pool) &&
            !(segOnCreationData.segClassName === SegClassName.RoadDrain && seg instanceof RoadDrain) &&
            !(segOnCreationData.segClassName === SegClassName.AgrDrain && seg instanceof AgrDrain)
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
    addedSeg.nameTextVisibility = segOnCreationData.nameTextVisibility;
    addedSeg.nameTextFontSize = segOnCreationData.nameTextFontSize;
    addedSeg.nameTextRotation = segOnCreationData.nameTextRotation;
    addedSeg.nameTextPosition = {x:addedSeg.nodes[0].position.x, y:addedSeg.nodes[0].position.y};

    if(addedSeg instanceof Res){
        (addedSeg as Res).arrowStatus = segOnCreationData.resArrowStatus;
    }
    
    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
    return true;
  },[dispatch, planElements, segOnCreationData]);
  return addSeg;
}