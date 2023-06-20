import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { PlanMode, PlanElement, PlanProps, Point, Position, PlanElementsHelper, PlanElementsRecordsHandler, Vector2D, SegNode, TestPoint, AddSegSession, PlanElementSheetData, MagnetData, Seg, JointSegs, SegOnCreationData, AppDynamicProps } from "@/entities";
import { NODE_RADIUS, SELECTED_ITEM_COLOR } from "@/global";
import { setAddSegSession, setAddingPointLineIdPointId, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanElementsSnapshot, setPlanMode, setSelectingPlanElement, setTestPoints, setUnselectAllOnPlanMouseUp, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectAddSegSession, selectAddingPointLineIdPointId, selectAppDynamicProps, selectMagnetData, selectPlanCursorPos, selectPlanElementSheetData, selectPlanElements, selectPlanElementsRecords, selectPlanElementsSnapshot, selectPlanIsDragging, selectPlanMode, selectPlanPointerUpActionsHandler, selectSegOnCreationData, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import { calculateAngle, cloneArray, doSegmentsIntersect, getDistance, getMovingNodePositionWithMagnet, getOrthogonalPoints, getOrthogonalProjection, getPositionOnSegment, radiansToDegrees } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Circle, Group, Text } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from 'uuid';

type Props = {
  jointSegs: JointSegs,
  node: SegNode,
  pointingOnSeg: boolean
};
 
const SegNodeComponent: React.FC<Props> = ({jointSegs, node, pointingOnSeg}) => {
  const dispatch = useDispatch();
  const savePlan = useSavePlan();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  // const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  // const planProps:PlanProps = useSelector(selectPlanProps);
  const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
  const [visible, setVisible] = useState<boolean>(false); 
  const magnetData: MagnetData = useSelector(selectMagnetData);
  const addSegSession: AddSegSession = useSelector(selectAddSegSession);
  const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const planElementsSnapshot: PlanElement[] | null = useSelector(selectPlanElementsSnapshot);
  const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);
  const addSeg = useAddSeg();
  const appDynamicProps: AppDynamicProps = useSelector(selectAppDynamicProps);

  // const updateNodePosition = useCallback((p:Position) =>{
  //       node.position = p;
  //       dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
  //     }, [dispatch, node, planElements]);
      

  return (
    <Group>
      <Circle
        x = {node.position.x}
        y = {node.position.y}
        radius = {NODE_RADIUS / appDynamicProps.planScale}
        fill="#428BCA"
        opacity={(visible || addSegSession && addSegSession.draggingNode.id === node.id) && !pointingOnSeg? 1 : 0} //(addSegSession && addSegSession.seg.nodes[1].id === node.id) and !pointingOnSeg conditions are just a fix
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
        radius = {NODE_RADIUS / appDynamicProps.planScale}
        opacity={0}
        // stroke="black"
        // strokeWidth={1}
        listening = {!addSegSession && !pointingOnSeg}//!pointingOnSeg condition is just a fix
        draggable = {!addSegSession}
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

          if(planMode === PlanMode.AddSeg){
            addSeg(
              e.target.getPosition(), 
              node, 
              undefined);
            
            // const newSheetData:PlanElementSheetData = {
            //     planElementId: PlanElementsHelper.getAllJointSegs(planElements).id, 
            //     segId:addedSeg.id, 
            //     typeName:sheetData.typeName, 
            //     numero:sheetData.numero
            // };
            // dispatch(setPlanElementSheetData(newSheetData));
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
            const nodeOrSeg: Seg | SegNode | null = jointSegs.getNodeOrSegPenetratedByPoint(e.target.position(), node);
            // console.log("nodeOrSeg",nodeOrSeg)


            const [movingNodePosWithMagnet, linePoints] = getMovingNodePositionWithMagnet(node, e.target.position(), magnetData);

            // const nodePositionBeforeMove = {x:node.position.x, y:node.position.y};
            const jointSegsBeforeMoveClone = jointSegs.clone();

            node.position = movingNodePosWithMagnet;
            
            jointSegs.updateAllNameTextPositionsAndAngles(jointSegsBeforeMoveClone, jointSegs);









            // const testPoints:TestPoint[] = [];

            // for(const segId in jointSegs.segs){
            //   const seg = jointSegs.segs[segId];
            //   if(!seg.hasNode(node.id)) continue;
            //   let angle = radiansToDegrees(calculateAngle(seg.nodes[0].position, seg.nodes[1].position));  
            //   console.log("angle", angle)
            //   seg.nameTextRotation = angle > 90 && angle < 270 ? angle + 180 : angle;
  
            //   const nodeIdx = seg.getNodeIndex(node.id) ;
            //   const otherNodeIdx = nodeIdx === 0 ? 1 : 0;
            //   if(nodeIdx === -1) continue; //should throw error
  
            //   const orthogonalProjection = getOrthogonalProjection(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position,  seg.nameTextPosition);
            //   const d = getDistance(orthogonalProjection, seg.nameTextPosition);

            //   // const distanceTextNodeBeforeNodeMove = getDistance(orthogonalProjection, seg.nameTextPosition);
            //   testPoints.push(new TestPoint(v4(), seg.nameTextPosition.x, seg.nameTextPosition.y, "blue"))

            //   testPoints.push(new TestPoint(v4(), orthogonalProjection.x, orthogonalProjection.y, "red"))
            //   const segLengthBeforeNodeMove = getDistance(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position);
            //   const node1OrthogonalProjectionDistanceBeforeNodeMove = getDistance(nodePositionBeforeMove, orthogonalProjection);
  
            //   const node1OrthogonalProjectionDistanceRatioBeforeNodeMove = node1OrthogonalProjectionDistanceBeforeNodeMove / segLengthBeforeNodeMove;
            //   console.log("node1OrthogonalProjectionDistanceRatioBeforeNodeMove",node1OrthogonalProjectionDistanceRatioBeforeNodeMove);

            //   const segLengthAfterNodeMove = getDistance(seg.nodes[0].position, seg.nodes[1].position);
            //   const calculatedRatioOnSegLengthAfterNodeMoveLength = segLengthAfterNodeMove * node1OrthogonalProjectionDistanceRatioBeforeNodeMove;
            //   // console.log("calculatedRatioOnSegLengthAfterNodeMoveLength",calculatedRatioOnSegLengthAfterNodeMoveLength);
  
            //   const p = getPositionOnSegment({p1:seg.nodes[nodeIdx].position, p2:seg.nodes[otherNodeIdx].position}, seg.nodes[nodeIdx].position, calculatedRatioOnSegLengthAfterNodeMoveLength);
              

            //   if(!p) continue; //should throw error


            //   testPoints.push(new TestPoint(v4(), p.x, p.y, "green"))

            //   console.log("d",d)

            //   const orthogonalPoints = getOrthogonalPoints({p1:seg.nodes[0].position, p2:seg.nodes[1].position}, p, d);
            //   console.log("p",p)
  
            //   console.log("orthogonalPoints",orthogonalPoints)
            //   const newTextPosition = getDistance(orthogonalPoints[0], seg.nameTextPosition) < getDistance(orthogonalPoints[1], seg.nameTextPosition) ? 
            //       orthogonalPoints[0] : orthogonalPoints[1];
              
              
            //   seg.nameTextPosition = newTextPosition;
  
            //   // const orthogonalProjectionNode1Distance = getDistance(seg.nodes[0].position, orthogonalProjection);
            //   // const orthogonalProjectionNode2Distance = getDistance(seg.nodes[1].position, orthogonalProjection);
  
  
            // }

            // dispatch(setTestPoints(testPoints))









            // updateNodePosition(movingNodePosWithMagnet);
            dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));

            dispatch(setMagnetData(
              {
                activeOnAxes: magnetData.activeOnAxes,
                node: nodeOrSeg && nodeOrSeg.id.length > 36? null: nodeOrSeg as SegNode, //36 is uuid length, Seg id is 36*2
                seg: nodeOrSeg && nodeOrSeg.id.length > 36? nodeOrSeg as Seg: null,
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
            //     const node = jointSegs.nodes[id];
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
              jointSegs.joinNodes(node, magnetData.node);              
            }else if(magnetData.seg){
              jointSegs.joinDraggedNodeAndCreatedNodeOnSeg(node, magnetData.seg);
            }
            dispatch(setMagnetData({activeOnAxes:magnetData.activeOnAxes, node:null, seg:null, linePoints:null}));


            jointSegs.cleanSegs(jointSegs.hasSelectedSeg());

            //save
            // if(!dragStartPos) return;
            if(!planElementsSnapshot) return;
            // const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
            const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
            // const jwIdx = PlanElementsHelper.findElementIndexById(nextPlanElementsClone, jointSegs.id);
            // (currentPlanElementsClone[jwIdx] as JoinedSegs).nodes[node.id].position = new Position(dragStartPos.x, dragStartPos.y);
            
            savePlan(PlanElementsHelper.clone(planElementsSnapshot), nextPlanElementsClone);

            // setDragStartPos(null);
        }}
        />
      {/* <Text 
          x = {node.position.x}
          y = {node.position.y}
          text={node.id}
      /> */}
      {magnetData.node?.id === node.id?
        <Circle
          x = {node.position.x}
          y = {node.position.y}
          radius = {NODE_RADIUS / appDynamicProps.planScale}
          stroke = {SELECTED_ITEM_COLOR}
          strokeWidth={5}
          listening = {false}
        />:null
      }
    </Group>
  )
};

export default SegNodeComponent;


// class PointKonvaProperties {
//   color: string;
//   position: Point;

//   constructor(){

//   }
// }