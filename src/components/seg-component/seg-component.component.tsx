
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddSegSession, Dimensions, JointSegs, MagnetData, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Seg, SegNode, iconDataArr } from "@/entities";
import { Path } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddSegSession, setMagnetData, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JointSegsAndSegNodes } from "../plan/plan.component";
import { selectAddSegSession, selectMagnetData, selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectPlanProps } from "@/redux/plan/plan.selectors";
import { getOrthogonalProjection } from "@/utils";
import { v4 } from 'uuid';

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
            fill="#AAAAAA"
            stroke="#5CB85C"
            strokeWidth={segIsSelected ? 2 : 0}
            onPointerDown={e => {
                // setPreventPointerUpOnPlan(true);

                if(planMode === PlanMode.AddSeg){
                    e.cancelBubble = true;

                    dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));
                    const pointerPos = getCursorPosWithEventPos(e, false);
                    const pointOnSegMiddleLine = getOrthogonalProjection(seg.nodes[0].position, seg.nodes[1].position, new Position(pointerPos.x, pointerPos.y))
                    const [addedSeg, draggingNode] = jointSegs.addSegFromSeg(seg, [pointOnSegMiddleLine, pointerPos]);
                    // const orthogonalProjectionNode = 
                    // addedSeg.nodes[0].position.x === pointOnSegMiddleLine.x
                    // && addedSeg.nodes[0].position.y === pointOnSegMiddleLine.y ?
                    // addedSeg.nodes[1] : addedSeg.nodes[0];

                    dispatch(setAddSegSession(
                        new AddSegSession(
                            jointSegs,
                            addedSeg,
                            draggingNode 
                        )
                    ));

                    // if(!sheetData) return; //should throw error
                    // addedSeg.numero = sheetData.numero;
                    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
                    
                    // const newSheetData:PlanElementSheetData = {
                    //     planElementId: PlanElementsHelper.getAllJointSegs(planElements).id, 
                    //     segId:addedSeg.id, 
                    //     typeName:sheetData.typeName, 
                    //     numero:sheetData.numero
                    // };
                    // dispatch(setPlanElementSheetData(newSheetData));
                }else{
                    setPointingOnSeg(true);
                    // const nodesIds:[string, string] = [nodes[0].id, nodes[1].id];
                    if(segIsSelected) return;
                    jointSegs.selectSeg(id);                                   
                    dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
                    // const newSheetData:PlanElementSheetData = {
                    //     planElementId:PlanElementsHelper.getAllJointSegs(planElements).id, 
                    //     segId:id, 
                    //     typeName:PlanElementSheetTypeName.Seg, 
                    //     numero:numero};
                    // dispatch(setPlanElementSheetData(newSheetData));
                }
            }}
            onPointerMove={_=>{
                if(!pointerStartPos || movingSeg || planMode === PlanMode.AddSeg) return;
                const wClone = jointSegs.clone();                                        
                const node1Clone = jointSegs.nodes[nodes[0].id];
                const node2Clone = jointSegs.nodes[nodes[1].id];

                setMovingSeg({ 
                    jointSegs:wClone, 
                    segNodes:[node1Clone, node2Clone],
                    startingNodesPos:[
                        new Position(node1Clone.position.x, node1Clone.position.y), 
                        new Position(node2Clone.position.x, node2Clone.position.y),
                    ]
                });

                // dispatch(setMagnetData(
                //     {
                //         activeOnAxes: magnetData.activeOnAxes,
                //         node: magnetData.node,
                //         seg:seg
                //     }
                // ))
            }}
            onPointerUp={e=>{

                if(addSegSession && addSegSession.seg.id != id){
                    console.log("onPointerUp seg")
                    const pointerPos = getCursorPosWithEventPos(e, false);
                    console.log("onPointerUp seg pointerPos.x", pointerPos.x)
                    // const pointOnSegMiddleLine = getOrthogonalProjection(seg.nodes[0].position, seg.nodes[1].position, new Position(pointerPos.x, pointerPos.y))


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
