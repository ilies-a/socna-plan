
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData } from "@/entities";
import { Arrow, Group, Path, Shape } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { calculateSidelinesPoints, createShrinkedSegment, getDistance, getOrthogonalProjection, getPointAlongSegment, shrinkOrEnlargeSegment, sortPointsClockwise } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";

type Props = {
    points:[Vector2D, Vector2D],
    width:number,
    reversed:boolean,
  };


const ArrowDrawing: React.FC<Props> = ({points, width, reversed}) => {
    const arrowPointerWidth = 60;
    const dispatch = useDispatch();

    // useEffect(()=>{
    //     const seg = createShrinkedSegment({p1:points[0], p2:points[1]}, points[0], arrowPointerLength);
        
    //     const sideLinesPoints = calculateSidelinesPoints(seg.p1, seg.p2, width);

    //     // const slpFlat = sideLinesPoints.flat();
    //     const sl1 = sideLinesPoints[0];
    //     const sl2 = sideLinesPoints[1];

    //     const arrowPointerWidth = 50;

    //     const arrowPointerSidePoint1 = getPointAlongSegment({p1:sl1[0], p2:sl1[1]}, 1, arrowPointerWidth/2);
    //     const arrowPointerSidePoint2 = getPointAlongSegment({p1:sl2[0], p2:sl2[1]}, 1, -arrowPointerWidth/2);
    //     const arrowPointerForwardsPoint = points[1];
        
    //     dispatch(setTestPoints([
    //         new TestPoint(v4(), arrowPointerSidePoint1.x, arrowPointerSidePoint1.y, "blue"),
    //         new TestPoint(v4(), arrowPointerSidePoint2.x, arrowPointerSidePoint2.y, "cyan"),
    //         new TestPoint(v4(), arrowPointerForwardsPoint.x, arrowPointerForwardsPoint.y, "red"),

    //     ]))
    // },[])

    const calculatePoints = useCallback(():string=>{
        let p1Idx:number;
        let p2Idx:number;
        if(reversed){
            p1Idx = 1;
            p2Idx = 0;
        }else{
            p1Idx = 0;
            p2Idx = 1;
        }

        const seg = shrinkOrEnlargeSegment({p1:points[p1Idx], p2:points[p2Idx]}, 50);
        const segLength = getDistance(seg.p1, seg.p2);

        // if(dimensions.width != segLength || dimensions.height != arrowPointerWidth){
        //     setDimensions({width:segLength, height:arrowPointerWidth});
        // }

        // const arrowPointerLengthMinFactor = 0.2;
        // const arrowPointerLengthMaxFactor = 0.5;

        // const segLengthForMinFactor = 20;
        // const segLengthForMaxFactor = 200;

        // const percentage = segLength > segLengthForMaxFactor ? 100 : segLength < arrowPointerLengthMinFactor ? 20 :
        //     segLength * 100 / (segLengthForMaxFactor - segLengthForMinFactor);

        // const f = percentage * (arrowPointerLengthMaxFactor - arrowPointerLengthMinFactor) / 100;

        const arrowPointerLength = segLength * 0.4;


        const segMinusArrowPointerLength = createShrinkedSegment(seg, seg.p1, arrowPointerLength);
        
        const sideLinesPoints = calculateSidelinesPoints(segMinusArrowPointerLength.p1, segMinusArrowPointerLength.p2, width);

        // const slpFlat = sideLinesPoints.flat();
        const sl1 = sideLinesPoints[0];
        const sl2 = sideLinesPoints[1];

        const arrowPointerSidePoint1 = getPointAlongSegment({p1:sl2[0], p2:sl2[1]}, 1, -arrowPointerWidth/2);
        const arrowPointerSidePoint2 = getPointAlongSegment({p1:sl1[0], p2:sl1[1]}, 1, arrowPointerWidth/2);
        const arrowPointerForwardsPoint = seg.p2;

        const slp = [
            sl1[0], 
            sl1[1],
            arrowPointerSidePoint1,
            arrowPointerForwardsPoint,
            arrowPointerSidePoint2,
            sl2[1], 
            sl2[0]
        ];

        // const sideLinesPointsFlattenedAndSortedClockwise = sortPointsClockwise(sideLinesPoints.flat());
        let s:string = "";
        s += "M";
        for(const point of slp){
            // console.log("point",point)
            s += " " + point.x + " " + point.y + " ";
        }
        s += "Z";
        // console.log("\n\n")
        return s;
        
    },[points, reversed, width]);

    return (
        <Path
            data= {calculatePoints()}
            stroke="#5CB85C"
            strokeWidth={1}
            // rotation={180}
            // offsetX={-dimensions.width/2}
            // offsetY={-dimensions.height/2}
            listening={false}
        />

    )
};

export default ArrowDrawing;
