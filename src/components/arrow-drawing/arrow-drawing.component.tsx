
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, Dimensions, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData } from "@/entities";
import { Arrow, Group, Path } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectPlanProps, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { calculateSidelinesPoints, createShrinkedSegment, getOrthogonalProjection, shrinkOrEnlargeSegment } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";

type Props = {
    points:[Vector2D, Vector2D],
    width:number,
  };

const ArrowDrawing: React.FC<Props> = ({points, width}) => {
    // const arrowPointerLength = 20;
    // const calculatePoints = useCallback(():string=>{
    //     const seg = createShrinkedSegment({p1:points[0], p2:points[1]}, points[0], arrowPointerLength);
    //     const sideLinePoints = calculateSidelinesPoints(seg.p1, seg.p2, width);

    // },[]);

    // return (
    //     <Path
    //         data= {calculatePoints()}
    //         stroke="#5CB85C"
    //         strokeWidth={1}
    //         listening={false}
    //     />

    // )
    return null
};

export default ArrowDrawing;
