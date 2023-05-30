
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { Dimensions, JoinedWalls, Position, Vector2D, WallNode, iconDataArr } from "@/entities";
import { Path } from "react-konva";
import { useDispatch } from "react-redux";
import { updatePlanElement } from "@/redux/plan/plan.actions";
import { JoinedWallsAndWallNodes } from "../plan/plan.component";

type Props = {
    w: JoinedWalls,
    points: Vector2D[],
    wallIsSelected: boolean,
    nodes: WallNode[],
    pointerStartPos: Position | null,
    movingWall: JoinedWallsAndWallNodes | null,
    setMovingWall: Dispatch<SetStateAction<JoinedWallsAndWallNodes | null>>
  };


const WallComponent: React.FC<Props> = ({w, points, wallIsSelected, nodes, pointerStartPos, movingWall, setMovingWall}) => {
    const dispatch = useDispatch();
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
            fill="grey"
            stroke="green"
            strokeWidth={wallIsSelected ? 2 : 0}
            onPointerDown={_ => {
                console.log("onPointerDown")
                // setPreventPointerUpOnPlan(true);
                const nodesIds:[string, string] = [nodes[0].id, nodes[1].id];
                if(wallIsSelected) return;
                w.selectWall(nodesIds);                                   
                dispatch(updatePlanElement(w));
            }}
            onPointerMove={_=>{
                if(!pointerStartPos || movingWall) return;
                console.log("ok setMovingWall")
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
