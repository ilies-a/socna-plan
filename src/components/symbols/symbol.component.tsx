
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, Dimensions, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData, Res, ResArrowStatus, AppDynamicProps, Gutter, Wall, SymbolPlanElement } from "@/entities";
import { Arrow, Group, Path, Rect, Text } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectAppDynamicProps, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { getOrthogonalProjection, shrinkOrEnlargeSegment } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";
import ArrowDrawing from "../arrow-drawing/arrow-drawing.component";
import { SELECTED_ITEM_COLOR } from "@/global";

type Props = {
    symbol: SymbolPlanElement,
    pointingOnStage:boolean
  };


const SymbolComponent: React.FC<Props> = ({symbol, pointingOnStage}) => {
    const dispatch = useDispatch();
    const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
    const planMode: PlanMode = useSelector(selectPlanMode);
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const appDynamicProps: AppDynamicProps = useSelector(selectAppDynamicProps);

    const getCursorPosWithEventPos = useCallback((e:any, touch:boolean): Position =>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
        // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
        return new Position((ePos.x - e.target.getStage().getPosition().x) * 1/appDynamicProps.planScale, (ePos.y - e.target.getStage().getPosition().y) * 1/appDynamicProps.planScale);
    
    },[appDynamicProps.planScale]); 


    return (
        <Group>
            <Rect
                x={symbol.position.x}
                y={symbol.position.y}
                width={symbol.size.width}
                height={symbol.size.height}
                fill={"green"}
                draggable
                onDragStart={e=>{e.cancelBubble=true}}
                onDragMove={e=>{e.cancelBubble=true}}
                onDragEnd={e=>{e.cancelBubble=true}}
                onPointerDown={e=>{e.cancelBubble=true}}
                onPointerMove={e=>{e.cancelBubble=true}}
                onPointerUp={e=>{e.cancelBubble=true}}
                listening= {!pointingOnStage}
            />
        </Group>
    )
};

export default SymbolComponent;
