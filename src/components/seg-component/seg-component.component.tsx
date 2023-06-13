
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, Dimensions, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr, SegOnCreationData } from "@/entities";
import { Path } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectPlanProps, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { getOrthogonalProjection } from "@/utils";
import { v4 } from 'uuid';
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";

type Props = {
    id: string,
    numero:string,
    jointSegs: JointSegs,
    seg: Seg,
    points: Vector2D[],
    segIsSelected: boolean,
    nodes: SegNode[],
    pointerStartPos: Position | null,
    movingSeg: JointSegsAndSegNodes | null,
    setMovingSeg: Dispatch<SetStateAction<JointSegsAndSegNodes | null>>,
    setPointingOnSeg: Dispatch<boolean>
  };


const SegComponent: React.FC<Props> = ({jointSegs, seg, id, numero, points, segIsSelected, nodes, pointerStartPos, movingSeg, setMovingSeg, setPointingOnSeg}) => {
    const dispatch = useDispatch();
    const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
    const planMode: PlanMode = useSelector(selectPlanMode);
    const planProps:PlanProps = useSelector(selectPlanProps);
    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const addSegSession: AddSegSession = useSelector(selectAddSegSession);
    const magnetData: MagnetData = useSelector(selectMagnetData);
    const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);
    const addSeg = useAddSeg();

    const getCursorPosWithEventPos = useCallback((e:any, touch:boolean): Position =>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
        // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
        return new Position((ePos.x - e.target.getStage().getPosition().x) * 1/planProps.scale, (ePos.y - e.target.getStage().getPosition().y) * 1/planProps.scale);
    
    },[planProps.scale]); 

    return (
        <Path
            data= {
                (():string => {
                    let s:string = "";
                    s += "M";
                    for(const point of points){
                        s += " " + point.x + " " + point.y + " ";
                    }
                    s += "Z";
                    return s
                })()
            }
            fill={seg.color}
            stroke="#5CB85C"
            strokeWidth={segIsSelected ? 2 : 0}
            onPointerDown={e => {
                // setPreventPointerUpOnPlan(true);

                if(planMode === PlanMode.AddSeg){
                    e.cancelBubble = true;
                    addSeg(
                        getCursorPosWithEventPos(e, false), 
                        undefined, 
                        seg);

                }else{
                    setPointingOnSeg(true);
                    if(segIsSelected) return;
                    PlanElementsHelper.unselectAllElements(planElements);
                    jointSegs.selectSeg(id);                                   
                    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
 
                }
            }}
            onPointerMove={_=>{
                if(!pointerStartPos || movingSeg || planMode === PlanMode.AddSeg) return;
                dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));

                const node1 = jointSegs.nodes[nodes[0].id];
                const node2 = jointSegs.nodes[nodes[1].id];

                setMovingSeg({ 
                    jointSegs, 
                    segNodes:[node1, node2],
                    startingNodesPos:[
                        new Position(node1.position.x, node1.position.y), 
                        new Position(node2.position.x, node2.position.y),
                    ]
                });
            }}
            onPointerUp={_=>{
                if(addSegSession && addSegSession.seg.id != id){
                    dispatch(setMagnetData(
                        {
                            activeOnAxes: magnetData.activeOnAxes,
                            node: magnetData.node,
                            seg,
                            linePoints:magnetData.linePoints
                        }
                    ))
                    
                    // dispatch(setTestPoints([
                    //     new TestPoint("", pointOnSegMiddleLine.x, pointOnSegMiddleLine.y, "blue")
                    // ]))



                }
            }}
        />
    )
};

export default SegComponent;
