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
};
 
const WallNodeComponent: React.FC<Props> = ({joinedWalls, node}) => {
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
      
  // const test = useCallback(() =>{
  //   if(!node.linkedNodes.length) return;
  //   // const segments = joinedWalls.getSegments();



  //   //intersection part

  //   //calculating intersection points
  //   const nodesAndTheirClockwiseSortedSegments: [WallNode, Segment[]][] = [];
  //   for(const nodeId in joinedWalls.nodes){
  //     const node = joinedWalls.nodes[nodeId];
  //     if(node.linkedNodes.length < 2) continue; //we want nodes with 2 linked nodes at least
  //     nodesAndTheirClockwiseSortedSegments.push([node, node.getClockwiseSortedSegment()]);
  //   }

  //   //for each segment
  //   //sideline1 with sideline1 of next segment

  //   const points: TestPoint[] = [];
  //   let pointId = 100;

  //   const segPointsBySegment: Position[][] = [];

  //   for(const nodeAndSegments of nodesAndTheirClockwiseSortedSegments){
  //     const node = nodeAndSegments[0];
  //     const segments = nodeAndSegments[1];
      
  //     for(let i=0; i < segments.length; i++){
  //       // if(i>0) break; //for testing
  //       const seg = segments[i];
  //       const offset = 1;
  //       const minimumValue = 0;
  //       const modulus = segments.length;
  //       const nextSegIndex = (i - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
  //       const prevSegIndex = i > 0? i - 1 : segments.length - 1;

  //       const nextSeg = segments[nextSegIndex];
  //       const prevSeg = segments[prevSegIndex];
  //       console.log("i",i)
  //       console.log("nextSegIndex",nextSegIndex)
  //       console.log("prevSegIndex",prevSegIndex)

  //       console.log("\n\n")

  //       //next point intersection

  //       let sl:[Position, Position] = seg.sideline2Points;
  //       const nextSegSl:[Position, Position] = nextSeg.sideline1Points;

  //       let l1p1 = sl[0];
  //       let l1p2 = sl[1];

  //       let l2p1 = nextSegSl[0];
  //       let l2p2 = nextSegSl[1];


  //       let m1 = (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x);
  //       let m2 = (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x);

  //       let b1 = l1p1.y - m1 * l1p1.x;
  //       let b2 = l2p1.y - m2 * l2p1.x;

  //       //y = m1 * x + b1
  //       //y = m2 * x + b2
        
  //       //m1 * x + b1 = m2 * x + b2
  //       //m1 * x - m2 * x = b2 - b1
  //       //m1 * x - m2 * x = b2 - b1
  //       //x (m1 - m2) = b2 - b1
  //       let x = (b2 - b1) / (m1 - m2);
  //       let y = m1 * x + b1;

  //       const intersectionPointWithNextSegLine = new Position(x, y);

  //       //prev point intersection

  //       sl = seg.sideline1Points;
  //       const prevSegSl:[Position, Position] = prevSeg.sideline2Points;

  //       l1p1 = sl[0];
  //       l1p2 = sl[1];

  //       l2p1 = prevSegSl[0];
  //       l2p2 = prevSegSl[1];


  //       m1 = (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x);
  //       m2 = (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x);

  //       b1 = l1p1.y - m1 * l1p1.x;
  //       b2 = l2p1.y - m2 * l2p1.x;

  //       //y = m1 * x + b1
  //       //y = m2 * x + b2
        
  //       //m1 * x + b1 = m2 * x + b2
  //       //m1 * x - m2 * x = b2 - b1
  //       //m1 * x - m2 * x = b2 - b1
  //       //x (m1 - m2) = b2 - b1
  //       x = (b2 - b1) / (m1 - m2);
  //       y = m1 * x + b1;

  //       const intersectionPointWithPreviousSegLine = new Position(x, y);


  //       //drawing intersection point
  //       // points.push(new TestPoint(pointId.toString()+"_i", x, y, "red"));

  //       //drawing segment points

  //       const p1 = seg.sideline1Points[0];
  //       const p2 = seg.sideline1Points[1];
  //       const p3 = seg.sideline2Points[1];
  //       const p4 = seg.sideline2Points[0];

  //       // points.push(new TestPoint(pointId.toString()+"_1", p1.x, p1.y, "grey"));
  //       // points.push(new TestPoint(pointId.toString()+"_2", p2.x, p2.y, "grey"));
  //       // points.push(new TestPoint(pointId.toString()+"_3", p3.x, p3.y, "grey"));
  //       // points.push(new TestPoint(pointId.toString()+"_4", p4.x, p4.y, "grey"));

  //       pointId++;



  //       //check if segment position is valid, if not valid segment appears simply with its 4 points
  //       //position is valid if the farthest segment intersects prev and next side segments


  //       let isValid = true;
  //       //draw for testing

  //         const prevSegClosestSidePoints = prevSeg.sideline2Points;
  //         const nextSegClosestSidePoints = nextSeg.sideline1Points;
  //         const segBase = [p2 , p3];
  //         const prevSegBase = [prevSeg.sideline1Points[1], prevSeg.sideline2Points[1]];
  //         const nextSegBase = [nextSeg.sideline1Points[1], nextSeg.sideline2Points[1]];

  //         const segSideClosestToPrevSegSide = [p1 , p2];
  //         const segSideClosestToNextSegSide = [p3 , p4];
  
  //         // for(const p of prevSegClosestSidePoints){
  //         //   points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "brown"));
  //         // }
  
  //         // for(const p of nextSegClosestSidePoints){
  //         //   points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "brown"));
  //         // }

  //         // for(const p of segBase){
  //         //   points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "blue"));
  //         // }

  //         // for(const p of segSideClosestToPrevSegSide){
  //         //   points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "cyan"));
  //         // }
  //         // for(const p of segSideClosestToNextSegSide){
  //         //   points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "cyan"));
  //         // }


  //         const segBaseFormated = {
  //           "p1": {"x":segBase[0].x, "y":segBase[0].y}, 
  //           "p2": {"x":segBase[1].x, "y":segBase[1].y}, 
  //         };
  //         const segSideClosestToPrevSegSideFormated = {
  //           "p1": {"x":segSideClosestToPrevSegSide[0].x, "y":segSideClosestToPrevSegSide[0].y}, 
  //           "p2": {"x":segSideClosestToPrevSegSide[1].x, "y":segSideClosestToPrevSegSide[1].y}, 
  //         };

  //         const segSideClosestToNextSegSideFormated = {
  //           "p1": {"x":segSideClosestToNextSegSide[0].x, "y":segSideClosestToNextSegSide[0].y}, 
  //           "p2": {"x":segSideClosestToNextSegSide[1].x, "y":segSideClosestToNextSegSide[1].y}, 
  //         };


  //         const prevSegBaseFormated = {
  //           "p1": {"x":prevSegBase[0].x, "y":prevSegBase[0].y}, 
  //           "p2": {"x":prevSegBase[1].x, "y":prevSegBase[1].y}, 
  //         };
  //         const prevSegClosestSidePointsFormated = {
  //           "p1": {"x":prevSegClosestSidePoints[0].x, "y":prevSegClosestSidePoints[0].y}, 
  //           "p2": {"x":prevSegClosestSidePoints[1].x, "y":prevSegClosestSidePoints[1].y}, 
  //         };

  //         const nextSegBaseFormated = {
  //           "p1": {"x":nextSegBase[0].x, "y":nextSegBase[0].y}, 
  //           "p2": {"x":nextSegBase[1].x, "y":nextSegBase[1].y}, 
  //         };
  //         const nextSegClosestSidePointsFormated = {
  //           "p1": {"x":nextSegClosestSidePoints[0].x, "y":nextSegClosestSidePoints[0].y}, 
  //           "p2": {"x":nextSegClosestSidePoints[1].x, "y":nextSegClosestSidePoints[1].y}, 
  //         };


  //         if(
  //           doSegmentsIntersect(segBaseFormated, prevSegClosestSidePointsFormated) 
  //           || doSegmentsIntersect(segBaseFormated, nextSegClosestSidePointsFormated)
  //           || doSegmentsIntersect(prevSegBaseFormated, segSideClosestToPrevSegSideFormated)
  //           || doSegmentsIntersect(nextSegBaseFormated, segSideClosestToNextSegSideFormated)

  //           ){
  //             isValid = false;
  //             console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOK")
  //         }
        

  //       //if reflex angle node,
  //       //if left reflex angle node
  //       //points are the two extremity points, 
  //       //if right reflex angle node

  //       //otherwise
  //       //points are the two extremity points, first intersection point, node point, second intersection point


  //       let points:Position[] = [];
  //       if(isValid){


  //         //check if reflex angle :


  //         const pi1 = intersectionPointWithNextSegLine;
  //         const pi2 = intersectionPointWithPreviousSegLine;


  //         const reflexAngleLinkedNodes = node.getReflexAngleLinkedNodes();
  //         if(reflexAngleLinkedNodes && 
  //           (
  //             seg.nodes[0].id === reflexAngleLinkedNodes[0].id || 
  //             seg.nodes[0].id === reflexAngleLinkedNodes[1].id || 
  //             seg.nodes[1].id === reflexAngleLinkedNodes[0].id || 
  //             seg.nodes[1].id === reflexAngleLinkedNodes[1].id
  //             )
  //         ){ //if reflex angle
  //           points = [pi1, p2, p3, pi2 as Position];
  //         }
  //         else{ //if not reflex angle
  //           points = [pi1, p3, p2, pi2, node.position];
  //         }

  //       }
  //       else{ //if not valid
  //         points = [p1, p2, p3, p4];

  //       }
  //       segPointsBySegment.push(points);
      

  //     }
  //   }


  //   for(const segPoints of segPointsBySegment){
  //     let i = 0;
  //     for(const p of segPoints){
  //       points.push(new TestPoint(i+"__"+v4().slice(0,2), p.x, p.y, "grey"));
  //       i++;
  //     }
  //   }
    
  //   dispatch(setTestPoints(points));






  //   // const reflexAngleLinkedNodes = node.getReflexAngleLinkedNodes();
  //   // if(reflexAngleLinkedNodes){//covergence point is the intersection of extended reflexAngleLinkedNodes segments

  //   // }else{ //covergence point is node.position

  //   // }


  //   //to draw the points for testing
  //   // const segments = joinedWalls.getSegments();
  //   // let i = 0;
  //   //   for(const seg of segments){
  //   //     for(const p of seg.sideline1Points){
  //   //       points.push( new TestPoint(i.toString(), p.x, p.y, "violet"));
  //   //       i++;
  //   //     }
  //   //     for(const p of seg.sideline2Points){
  //   //       points.push( new TestPoint(i.toString(), p.x, p.y, "violet"));
  //   //       i++;
  //   //     }
  //   //   }
    






  //   // //intersection part :
  //   // const linkedNode0Points = getPoints(0);
  //   // const linkedNode1Points = getPoints(2);

  //   // const l1OutsideLineIdx = 1;
  //   // const l2OutsideLineIdx = 0;

  //   // const l1p1 = linkedNode0Points[0][l1OutsideLineIdx];
  //   // const l1p2 = linkedNode0Points[1][l1OutsideLineIdx];

  //   // const l2p1 = linkedNode1Points[0][l2OutsideLineIdx];
  //   // const l2p2 = linkedNode1Points[1][l2OutsideLineIdx];


  //   // const m1 = (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x);
  //   // const m2 = (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x);

  //   // const b1 = l1p1.y - m1 * l1p1.x;
  //   // const b2 = l2p1.y - m2 * l2p1.x;

  //   // //y = m1 * x + b1
  //   // //y = m2 * x + b2
    
  //   // //m1 * x + b1 = m2 * x + b2
  //   // //m1 * x - m2 * x = b2 - b1
  //   // //m1 * x - m2 * x = b2 - b1
  //   // //x (m1 - m2) = b2 - b1
  //   // const x = (b2 - b1) / (m1 - m2);
  //   // const y = m1 * x + b1;






  //   // dispatch(setTestPoints([
  //   //   // new Point(v4(), linkedNode0Points[0][0].x, linkedNode0Points[0][0].y),
  //   //   new Point(v4(), linkedNode0Points[0][l1OutsideLineIdx].x, linkedNode0Points[0][l1OutsideLineIdx].y),
      
  //   //   // new Point(v4(), linkedNode0Points[1][0].x, linkedNode0Points[1][0].y),
  //   //   new Point(v4(), linkedNode0Points[1][l1OutsideLineIdx].x, linkedNode0Points[1][l1OutsideLineIdx].y),
 
  //   //   new Point(v4(), linkedNode1Points[0][l2OutsideLineIdx].x, linkedNode1Points[0][l2OutsideLineIdx].y),
  //   //   // new Point(v4(), linkedNode1Points[0][1].x, linkedNode1Points[0][1].y),

  //   //   new Point(v4(), linkedNode1Points[1][l2OutsideLineIdx].x, linkedNode1Points[1][l2OutsideLineIdx].y),
  //   //   // new Point(v4(), linkedNode1Points[1][1].x, linkedNode1Points[1][1].y),

  //   //   new Point(v4(), x, y)
  //   // ]));

    

  // }, [dispatch, joinedWalls.nodes, node]);

  return (
    <Group>
      <Circle
          x = {node.position.x}
          y = {node.position.y}
          radius = {node.radius * 1 / planProps.scale}
          fill="#428BCA"
          opacity={visible || addWallSession && addWallSession.draggingNode.id === node.id ? 1 : 0} //(addWallSession && addWallSession.wall.nodes[1].id === node.id) condition is just a fix
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
        listening = {!addWallSession}
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
          // console.log("point onPointerUp")
          e.cancelBubble = true;
          setVisible(true);
        //   handleOnPointerUp();
          dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));



          //REPETITION OF CODE IN WALL COMPONENT

          if(planMode === PlanMode.AddWall){
            const pointerPos = e.target.getPosition();
            const addedWall = joinedWalls.addWallFromNode(node, pointerPos);
            const draggingNode = 
            addedWall.nodes[0].id === node.id ?
            addedWall.nodes[1] : addedWall.nodes[0];

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
          console.log("point onPointerUp")
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

            dispatch(setMagnetData(
              {
                activeOnAxes: magnetData.activeOnAxes,
                node: nodeOrWall && nodeOrWall.id.length > 36? null: nodeOrWall as WallNode, //36 is uuid length, Wall id is 36*2
                wall: nodeOrWall && nodeOrWall.id.length > 36? nodeOrWall as Wall: null,

              }
            ))


            updateNodePosition(getMovingNodePositionWithMagnet(node, e.target.position(), magnetData));






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
              joinedWalls.joinDraggedNodeAndCreatedNode(node, magnetData.wall);
            }
            dispatch(setMagnetData({activeOnAxes:magnetData.activeOnAxes, node:null, wall:null}));

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