
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, Dimensions, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData, Res, ResArrowStatus, AppDynamicProps, Gutter, Wall, SymbolPlanElement, DEP, RVEP } from "@/entities";
import { Arrow, Group, Path, Rect, Text } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes, MovingSymbolData } from "../plan/plan.component";
import { selectAddSegSession, selectAppDynamicProps, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { getOrthogonalProjection, shrinkOrEnlargeSegment } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";
import ArrowDrawing from "../arrow-drawing/arrow-drawing.component";
import { SELECTED_ITEM_COLOR } from "@/global";
import DEPComponent from "./dep/dep.component";
import RVEPComponent from "./rvep/rvep.component";

type Props = {
    symbol: SymbolPlanElement,
    movingSymbol: MovingSymbolData | null,
    setMovingSymbol: Dispatch<SetStateAction<MovingSymbolData | null>>,
    setPointingOnSymbol: Dispatch<boolean>,
    pointerStartPos: Position | null,
    pointingOnSeg: boolean
};


const SymbolComponent: React.FC<Props> = ({symbol, setPointingOnSymbol, movingSymbol, setMovingSymbol, pointerStartPos, pointingOnSeg}) => {
    const dispatch = useDispatch();
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const planMode: PlanMode = useSelector(selectPlanMode);
    
    const getRightSymbol = ()=>{
        if(symbol instanceof DEP){
            return <DEPComponent
            size = {symbol.size}
            scale = {symbol.scale}
            selected = {symbol.isSelected}
        />;
        }else if(symbol instanceof RVEP){
            return <RVEPComponent
            size = {symbol.size}
            scale = {symbol.scale}
            selected = {symbol.isSelected}
        />;
        }
        return null
    };

    return (
        <Group
            position = {symbol.position}
            onPointerDown={e =>{
                // setPointingOnSymbol(true);
                if(planMode === PlanMode.AddSeg){
                    e.cancelBubble = true;
                }else{
                    setPointingOnSymbol(true);
                    if(symbol.isSelected) return;
                    PlanElementsHelper.unselectAllElements(planElements);
                    symbol.select();
                    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
                }
            }}
            onPointerMove={_=>{
                if(!pointerStartPos || pointingOnSeg || movingSymbol || planMode === PlanMode.AddSeg) return;
                dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));
                setMovingSymbol({
                    symbol:symbol,
                    pointerAndPositionOffset:{x:pointerStartPos.x - symbol.position.x, y:pointerStartPos.y - symbol.position.y},
                    startingPos:{x:symbol.position.x, y:symbol.position.y}});
            }}
            onPointerUp={_=>{}}
        >
        {getRightSymbol()}
        </Group>
    )
};

export default SymbolComponent;
