
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { AddWallSession, Dimensions, JoinedWalls, PlanElement, PlanElementSheetData, PlanElementSheetTypeName, PlanElementsHelper, PlanMode, PlanProps, Position, TestPoint, Vector2D, Wall, WallNode, iconDataArr } from "@/entities";
import { Path } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setAddWallSession, setPlanElementSheetData, setPlanElementsSnapshot, setTestPoints, updatePlanElement } from "@/redux/plan/plan.actions";
import { JoinedWallsAndWallNodes } from "../plan/plan.component";
import { selectPlanElementSheetData, selectPlanElements, selectPlanMode, selectPlanProps } from "@/redux/plan/plan.selectors";
import { getOrthogonalProjection } from "@/utils";
import { v4 } from 'uuid';

type Props = {
    id: string,
    numero:string,
    w: JoinedWalls,
    wall: Wall,
    points: Vector2D[],
    wallIsSelected: boolean,
    nodes: WallNode[],
    pointerStartPos: Position | null,
    movingWall: JoinedWallsAndWallNodes | null,
    setMovingWall: Dispatch<SetStateAction<JoinedWallsAndWallNodes | null>>,
    setPointingOnWall: Dispatch<boolean>
  };


const WallComponent: React.FC<Props> = ({w, wall, id, numero, points, wallIsSelected, nodes, pointerStartPos, movingWall, setMovingWall, setPointingOnWall}) => {
    const dispatch = useDispatch();
    const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
    const planMode: PlanMode = useSelector(selectPlanMode);
    const planProps:PlanProps = useSelector(selectPlanProps);
    const planElements: PlanElement[] = useSelector(selectPlanElements);

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
            strokeWidth={wallIsSelected ? 2 : 0}
            onPointerDown={e => {
                // setPreventPointerUpOnPlan(true);
                if(planMode === PlanMode.AddWall){
                    dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));
                    const pointerPos = getCursorPosWithEventPos(e, false);
                    const pointOnWallMiddleLine = getOrthogonalProjection(wall.nodes[0].position, wall.nodes[1].position, new Position(pointerPos.x, pointerPos.y))
                    const addedWall = w.addWall(wall, [pointOnWallMiddleLine, pointerPos]);
                    dispatch(setAddWallSession(
                        new AddWallSession(
                            w,
                            addedWall                        
                        )
                    ));
                    dispatch(updatePlanElement(w));
                    if(!sheetData) return; //should throw error
                    const newSheetData:PlanElementSheetData = {
                        planElementId: sheetData.planElementId, 
                        wallId:addedWall.id, 
                        typeName:sheetData.typeName, 
                        numero:sheetData.numero
                    };
                    dispatch(setPlanElementSheetData(newSheetData))
                }else{
                    setPointingOnWall(true);
                    // const nodesIds:[string, string] = [nodes[0].id, nodes[1].id];
                    if(wallIsSelected) return;
                    w.selectWall(id);                                   
                    dispatch(updatePlanElement(w));
                    const newSheetData:PlanElementSheetData = {planElementId:w.id, wallId:id, typeName:PlanElementSheetTypeName.Wall, numero:numero};
                    dispatch(setPlanElementSheetData(newSheetData));
                }
            }}
            onPointerMove={_=>{
                if(!pointerStartPos || movingWall || planMode === PlanMode.AddWall) return;
                const wClone = w.clone();                                        
                const node1Clone = w.nodes[nodes[0].id];
                const node2Clone = w.nodes[nodes[1].id];

                setMovingWall({ 
                    joinedWalls:wClone, 
                    wallNodes:[node1Clone, node2Clone],
                    startingNodesPos:[
                        new Position(node1Clone.position.x, node1Clone.position.y), 
                        new Position(node2Clone.position.x, node2Clone.position.y)
                    ]
                });
            }}
        />
    )
};

export default WallComponent;
