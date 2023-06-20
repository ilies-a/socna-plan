
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData, SheetDataEditable, Wall } from "@/entities";
import { Arrow, Group, Text, Shape } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanElementsSnapshot, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { calculateSidelinesPoints, createShrinkedSegment, getDistance, getOrthogonalProjection, getPointAlongSegment, shrinkOrEnlargeSegment, sortPointsClockwise } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";

type Props = {
    planElement: PlanElement,
    editableElement:SheetDataEditable,
    setPointingOnSeg: Dispatch<boolean>
  };


const RefText: React.FC<Props> = ({planElement, editableElement, setPointingOnSeg}) => {
    const dispatch = useDispatch();
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const savePlan = useSavePlan();

    const selectElement = useCallback(()=>{
        PlanElementsHelper.unselectAllElements(planElements);
        PlanElementsHelper.selectElement(planElements, editableElement);
        dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    },[dispatch, editableElement, planElements]);

    return (
        <Text
            text={editableElement.getRef()}
            x={editableElement.nameTextPosition.x}
            y={editableElement.nameTextPosition.y}
            rotation={editableElement.nameTextRotation}
            fontSize={editableElement.nameTextFontSize}
            offsetX={20} //arbitrary
            offsetY={10} //arbitrary
            draggable
            onPointerDown={e=>{
                e.cancelBubble = true;
                setPointingOnSeg(true);
                selectElement();
            }}
            onDragStart={e=>{
                e.cancelBubble = true;
                selectElement();
            }}
            onDragMove={e=>{
                e.cancelBubble = true;
            }}
            onDragEnd={e=>{
                e.cancelBubble = true;
                const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

                editableElement.nameTextPosition.x = e.currentTarget.getPosition().x;
                editableElement.nameTextPosition.y = e.currentTarget.getPosition().y;

                savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));

                e.currentTarget.setPosition({x:editableElement.nameTextPosition.x, y:editableElement.nameTextPosition.y});
            }}
        />

    )
};

export default RefText;
