import { useAddPoint } from "@/custom-hooks/use-add-point.hook";
import { useRemLine } from "@/custom-hooks/use-rem-line.hook";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { Line, PlanMode, PlanElement, PlanProps, Point, Position, PlanElementsHelper, PlanElementsRecordsHandler, PlanPointerUpActionsHandler, Vector2D, JoinedWalls, WallNode, TestPoint, AddWallSession, PlanElementSheetData, MagnetData, Wall } from "@/entities";
import { setAddWallSession, setAddingPointLineIdPointId, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanElementsSnapshot, setPlanMode, setPlanPointerUpActionsHandler, setSelectingPlanElement, setTestPoints, setUnselectAllOnPlanMouseUp, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectAddWallSession, selectAddingPointLineIdPointId, selectMagnetData, selectPlanCursorPos, selectPlanElementSheetData, selectPlanElements, selectPlanElementsRecords, selectPlanElementsSnapshot, selectPlanIsDragging, selectPlanMode, selectPlanPointerUpActionsHandler, selectPlanProps, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import { cloneArray, doSegmentsIntersect, getMovingNodePositionWithMagnet, getOrthogonalProjection } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Circle, Group, Text } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from 'uuid';

type Props = {
  joinedWalls: JoinedWalls,
  node: WallNode,
  pointingOnWall: boolean
};
 
const WallNodeComponent: React.FC<Props> = ({joinedWalls, node, pointingOnWall}) => {
  const dispatch = useDispatch();
  const savePlan = useSavePlan();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  // const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const planProps:PlanProps = useSelector(selectPlanProps);
  const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
  const [visible, setVisible] = useState<boolean>(false); 
  const magnetData: MagnetData = useSelector(selectMagnetData);
  const addWallSession: AddWallSession = useSelector(selectAddWallSession);
  const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const planElementsSnapshot: PlanElement[] | null = useSelector(selectPlanElementsSnapshot);

  const updateNodePosition = useCallback((p:Position) =>{
        node.position = p;
        dispatch(updatePlanElement(joinedWalls));
      }, [dispatch, joinedWalls, node]);
      

  return (
    <Group>
      <Circle
          x = {node.position.x}
          y = {node.position.y}
          radius = {node.radius * 1 / planProps.scale}
          fill="#428BCA"
          opacity={(visible || addWallSession && addWallSession.draggingNode.id === node.id) && !pointingOnWall? 1 : 0} //(addWallSession && addWallSession.wall.nodes[1].id === node.id) and !pointingOnWall conditions are just a fix
          listening = {false}
          // onClick={handleOnClick}
          
          // onMouseDown = { handleOnMouseDown}
          // onPointerDown={handleOnPointerDown}
          // onTouchStart = {handleOnTouchStart}
          // onMouseUp={handleOnMouseUp}

          // onPointerMove={e => {
          //   console.log("point onPointerMove")
          //   // e.cancelBubble = true;
          // }}
          // onPointerLeave={e => {
          //   console.log("point onPointerMove")
          //   // e.cancelBubble = true;
          //   handlePointerLeave();
          // }}
          // onTouchEnd={handleOnTouchEnd}
          // onDblClick={switchLinePointModeMoveAdd}
          // onDblTap={switchLinePointModeMoveAdd}
          // onMouseMove={handleOnMouseMove}
          // onTouchMove={handleOnTouchMove}
          // // onMouseOut={handleOnMouseOut}
          // onPointerOut={handleOnMouseOut}
          // draggable = {line.selectedPointId === id && planMode === PlanMode.MovePoint}
          // onDragStart={e => {
          //   setDragStartPos(planCursorPos);
          //   // console.log("point dragstart")
          //   e.cancelBubble = true;
          // }}
          // onDragMove={e => {
          //   // console.log("point dragmove")
          //   e.cancelBubble = true;
          //   updateLinePoint(new Point(v4(), e.target.position().x, e.target.position().y));
          // }}
          // onDragEnd={e => {
          //   // console.log("point dragend")
          //   e.cancelBubble = true;
          //   handleDragEnd();
          // }}

      />
      <Circle
        x = {node.position.x}
        y = {node.position.y}
        radius = {node.radius * 1 / planProps.scale}
        opacity={0}
        // stroke="black"
        // strokeWidth={1}
        listening = {!addWallSession && !pointingOnWall}//!pointingOnWall condition is just a fix
        draggable = {!addWallSession}
        onClick={e => {
          e.cancelBubble = true;
        }}
        // onTap={
        //   e => {
        //   alert("ooksss")
        //   e.cancelBubble = true;
        // }}
        onPointerDown={e => {
          e.cancelBubble = true;
          setVisible(true);
        //   handleOnPointerUp();
          dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));



          //REPETITION OF CODE IN WALL COMPONENT

          if(planMode === PlanMode.AddWall){
            const pointerPos = e.target.getPosition();
            const [addedWall, draggingNode] = joinedWalls.addWallFromNode(node, pointerPos);
            // const draggingNode = 
            // addedWall.nodes[0].id === node.id ?
            // addedWall.nodes[1] : addedWall.nodes[0];

            dispatch(setAddWallSession(
                new AddWallSession(
                  joinedWalls,
                  addedWall,
                  draggingNode 
                )
            ));

            if(!sheetData) return; //should throw error
            addedWall.numero = sheetData.numero;
            dispatch(updatePlanElement(joinedWalls));
            
            const newSheetData:PlanElementSheetData = {
                planElementId: joinedWalls.id, 
                wallId:addedWall.id, 
                typeName:sheetData.typeName, 
                numero:sheetData.numero
            };
            dispatch(setPlanElementSheetData(newSheetData));
            setVisible(false);

          }
        }}
        onPointerMove={e => {
          // e.cancelBubble = true;
        //   handleOnPointerUp();
        }}
        onPointerUp={e => {
          // console.log("point onPointerUp")
          e.cancelBubble = true;
          setVisible(false);
        //   handleOnPointerUp();
        }}
        onMouseEnter={_ =>{
          setVisible(true);
        }}
        onMouseOut={_ =>{
          setVisible(false);
        }}
        // onPointerOut={_ =>{
        //   setVisible(false);
        // }}
        // draggable
        // dragBoundFunc = {function (pos) {

        //   const linkedNodes = node.linkedNodes;
        //   console.log("planCursorPos.x", planCursorPos.x)
        //   console.log("planCursorPos.y", planCursorPos.y)


        //   return {
        //     x: pos.x,
        //     y: this.absolutePosition().y,
        //   };
        // }}
        onDragStart={e => {
            setVisible(true); //also in onPointerDown but just in case

            e.cancelBubble = true;
            //save position at start
            // setDragStartPos(new Position(e.target.position().x, e.target.position().y));
        }}
        onDragMove={e => {
            e.cancelBubble = true;
            // if(!magnetData){
            //   updateNodePosition(new Position(e.target.position().x, e.target.position().y));
            //   return;
            // }


            // console.log("e.target.position().x", e.target.position().x)
            // console.log("e.target.position().y", e.target.position().y)

            // console.log("node.position.x", node.position.x)
            // console.log("node.position.y", node.position.y)

            // console.log("")
            const nodeOrWall: Wall | WallNode | null = joinedWalls.getNodeOrWallPenetratedByPoint(e.target.position(), node);
            // console.log("nodeOrWall",nodeOrWall)


            const [movingNodePosWithMagnet, linePoints] = getMovingNodePositionWithMagnet(node, e.target.position(), magnetData);

            updateNodePosition(movingNodePosWithMagnet);

            dispatch(setMagnetData(
              {
                activeOnAxes: magnetData.activeOnAxes,
                node: nodeOrWall && nodeOrWall.id.length > 36? null: nodeOrWall as WallNode, //36 is uuid length, Wall id is 36*2
                wall: nodeOrWall && nodeOrWall.id.length > 36? nodeOrWall as Wall: null,
                linePoints
              }
            ))




            //TESTS PART:
            // const nodesToMark:{[nodeId:string]:boolean;} = {};

            // for(const n1 of node.linkedNodes){
            //     nodesToMark[n1.id] = true;
            //     for(const n2 of n1.linkedNodes){
            //       nodesToMark[n2.id] = true;
            //     }
            // }

            // const testPoints: TestPoint[] = [];
            
            // for(const id in nodesToMark){
            //     const node = joinedWalls.nodes[id];
            //     testPoints.push(new TestPoint( id, node.position.x, node.position.y, "red") );
            // }

            // dispatch(setTestPoints(
            //   testPoints
            // ))
    
        }}
        onDragEnd={e => {
            e.cancelBubble = true;
            setVisible(false);

            // dispatch(setTestPoints([new Point("", e.target.position().x, e.target.position().y)]))
            e.currentTarget.setPosition(node.position);

            //join nodes
            if(magnetData.node){
              joinedWalls.joinNodes(node, magnetData.node);              
            }else if(magnetData.wall){
              joinedWalls.joinDraggedNodeAndCreatedNodeOnWall(node, magnetData.wall);
            }
            dispatch(setMagnetData({activeOnAxes:magnetData.activeOnAxes, node:null, wall:null, linePoints:null}));


            joinedWalls.cleanWalls();

            //save
            // if(!dragStartPos) return;
            if(!planElementsSnapshot) return;
            // const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
            const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
            // const jwIdx = PlanElementsHelper.findElementIndexById(nextPlanElementsClone, joinedWalls.id);
            // (currentPlanElementsClone[jwIdx] as JoinedWalls).nodes[node.id].position = new Position(dragStartPos.x, dragStartPos.y);
            
            savePlan(PlanElementsHelper.clone(planElementsSnapshot), nextPlanElementsClone);

            // setDragStartPos(null);
        }}
        />
      {/* <Text 
          x = {node.position.x}
          y = {node.position.y}
          text={node.id}
      /> */}

      <Circle
        x = {node.position.x}
        y = {node.position.y}
        radius = {node.radius * 1 / planProps.scale}
        stroke="green"
        strokeWidth={5}
        opacity={magnetData.node?.id === node.id? 1:0}
        listening = {false}
      />
    </Group>
  )
};

export default WallNodeComponent;


// class PointKonvaProperties {
//   color: string;
//   position: Point;

//   constructor(){

//   }
// }