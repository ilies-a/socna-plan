import { useAddPoint } from "@/custom-hooks/use-add-point.hook";
import { useRemLine } from "@/custom-hooks/use-rem-line.hook";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { Line, PlanMode, PlanElement, PlanProps, Point, Position, PlanElementsHelper, PlanElementsRecordsHandler, PlanPointerUpActionsHandler, Vector2D } from "@/entities";
import { setAddingPointLineIdPointId, setPlanElements, setPlanElementsRecords, setPlanMode, setPlanPointerUpActionsHandler, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectAddingPointLineIdPointId, selectPlanCursorPos, selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectPlanPointerUpActionsHandler, selectPlanProps, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import { cloneArray } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from 'uuid';

type Props = {
  line: Line,
  id: string,
  position: Position,
  selected: boolean
};
 
const LinePoint: React.FC<Props> = ({line, id, position, selected}) => {
  const dispatch = useDispatch();
  const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planMode: PlanMode = useSelector(selectPlanMode)
  const planProps:PlanProps = useSelector(selectPlanProps);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const [dragged, setDragged] = useState<boolean>(false);
  const planPointerUpActionsHandler: PlanPointerUpActionsHandler = useSelector(selectPlanPointerUpActionsHandler);
  const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);
  const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);
  const [dragStartPos, setDragStartPos] = useState<Vector2D | null>(null);

  const addPoint = useAddPoint();
  const removeLineIfNoPoints = useRemLine();
  const savePlan = useSavePlan();

  // const [test, setTest] = useState(false);

  const updateLinePoint = useCallback((p:Point) =>{
    const linePath = line.path;
    line.updatePathPointPositionById(id, p);
    // linePath[pointIndex] = p;
    dispatch(updatePlanElement(line));
  }, [dispatch, id, line]);
  
  // useEffect(()=>{
  //   console.log("test before", test); 

  //   setTest(true);
  //   console.log("test after", test); 

  // },[])

  

  const switchLinePointModeMoveAdd = useCallback(()=>{
    if(planMode === PlanMode.MovePoint){
      dispatch(setPlanMode(PlanMode.AddPoint));
      line.selectPointId(null);
    }else if(planMode === PlanMode.AddPoint){
      dispatch(setPlanMode(PlanMode.MovePoint));
    }
    dispatch(updatePlanElement(line));
  },[dispatch, line, planMode]);

  // const selectPointIndex = useCallback(()=>{
  //   line.selectPointIndex(pointIndex);
  //   dispatch(updatePlanElement(line));
  // },[dispatch, line, pointIndex]);

  const handleOnPointerDown = useCallback(()=>{
    // dispatch(setUnselectAllOnPlanMouseUp(false));
    // line.pointIdPointingDownOn = id;
    // let newPlanPointerUpActionsHandler = new PlanPointerUpActionsHandler();
    // newPlanPointerUpActionsHandler = newPlanPointerUpActionsHandler.clone(planPointerUpActionsHandler);
    // newPlanPointerUpActionsHandler.lineIdPointIdOnPointerDown = [line.id, id];
    // // planPointerUpActionsHandler.lineIdPointIdOnPointerDown = [line.id, id];

    // dispatch(setPlanPointerUpActionsHandler(newPlanPointerUpActionsHandler))
    // console.log("handleOnMouseDown planPointerUpActionsHandler.lineIdPointIdOnPointerDown", planPointerUpActionsHandler.lineIdPointIdOnPointerDown)
    dispatch(setSelectingPlanElement(true));
    if(!line.getSelected()){
      line.setSelected(true);
    }else{
      line.selectPointId(id);
    }
    // if(line.addPointSession){
    //   line.addPointSession.pointIndexCursorIsOver = pointIndex;
    // }
    if(planMode === PlanMode.AddPoint){
      dispatch(setAddingPointLineIdPointId([line.id, id]));
    }
    dispatch(updatePlanElement(line));
  },[line, id, dispatch, planMode]);

  // const handleOnTouchStart = handleOnMouseDown;

//   const addPoint = useCallback((addOnSeries: boolean) => {
//     const [lineId, pointId]  = addingPointLineIdPointId as [string, string];
//     const line = PlanElementsHelper.findElementById(planElements, lineId) as Line;
//     if(!line) return;
//     line.addPoint(new Point(planCursorPos.x, planCursorPos.y), pointId as string);
//     // l.selectPointIndex(l.selectedPointIndex as number + 1);
//     dispatch(updatePlanElement(line));
//     // if(addOnSeries) return;
//     dispatch(setAddingPointLineIdPointId(null));

// }, [addingPointLineIdPointId, dispatch, planCursorPos, planElements]);
  
  const handleOnPointerUp = useCallback(()=>{
    // // dispatch(setSelectingPlanElement(false));
    // dispatch(setUnselectAllOnPlanMouseUp(false));
    // console.log("p handleOnMouseUp unselectAllOnPlanMouseUp", unselectAllOnPlanMouseUp);
    // if(dragged){
    //   setDragged(false);
    //   const planElementsRecordsClone:PlanElementsRecordsHandler = planElementsRecords.clone();
    //   const planElementsClone = PlanElementsHelper.clone(planElements);
    //       planElementsRecordsClone.currentRecordIndex++;
    //   planElementsRecordsClone.records = planElementsRecordsClone.records.slice(0, planElementsRecordsClone.currentRecordIndex);
    //   planElementsRecordsClone.records.push(planElementsClone);
    //   dispatch(setPlanElementsRecords(planElementsRecordsClone));
    //   dispatch(setPlanElements(planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex]));
    // }

    if(selected){
      if((planMode === PlanMode.RemovePointNoJoin || planMode === PlanMode.RemovePointThenJoin)){
        const join:boolean = planMode === PlanMode.RemovePointThenJoin;
        if(!join && !line.pathIsClose) return;
  
        const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
        const nextPlanElementsClone = PlanElementsHelper.clone(planElements);

        const lineClone: Line | undefined = nextPlanElementsClone.find(el => el.id === line.id ) as Line | undefined;
        if(!lineClone) return;
        lineClone.removePoint(id, join);

        const lineIndex = PlanElementsHelper.findElementIndexById(nextPlanElementsClone, line.id);
        if(lineIndex > -1){
          if((nextPlanElementsClone[lineIndex] as Line).path.length === 1){
            nextPlanElementsClone.splice(lineIndex, 1);
          }
        }
        savePlan(currentPlanElementsClone, nextPlanElementsClone);

        // dispatch(setPlanElements(planElementsClone));

        // const planElementsRecordsClone:PlanElementsRecordsHandler = planElementsRecords.clone();
        // // const planElementsClone = PlanElementsHelper.clone(planElements);
        
        // planElementsRecordsClone.currentRecordIndex++;
        // planElementsRecordsClone.records = planElementsRecordsClone.records.slice(0, planElementsRecordsClone.currentRecordIndex);
        // planElementsRecordsClone.records.push(planElementsClone);
        // dispatch(setPlanElementsRecords(planElementsRecordsClone));
        // dispatch(setPlanElements(planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex]));


        // dispatch(updatePlanElement(line));
  
        // if(lineClone){
        //   lineClone.removePoint(id, join);
        //   if(lineClone.path.length < 2){
        //     const planElementToRemoveIndex = planElementsClone.findIndex((el) => el.id === lineClone.id);
        //     if(planElementToRemoveIndex === -1) return;
        //     planElementsClone.splice(planElementToRemoveIndex, 1);
        //   }
        //   // const lClone = l.clone();
        //   const newPlanElementsRecords:PlanElementsRecordsHandler = planElementsRecords.clone();
        //   newPlanElementsRecords.currentRecordIndex++;
        //   newPlanElementsRecords.records = newPlanElementsRecords.records.slice(0, newPlanElementsRecords.currentRecordIndex);
          
        //   newPlanElementsRecords.records.push(planElementsClone);
        //   dispatch(setPlanElementsRecords(newPlanElementsRecords));
  
  
        //   dispatch(setPlanElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]));
  
        // }
      }else{
        line.selectedPointId = null;
        dispatch(updatePlanElement(line));
      }
    }
    if(addingPointLineIdPointId){
      addPoint(id);
    }
    // if(line.pointOverJoinablePoint(id, planProps.scale) && line.path.length > 3){
    //   line.joinExtremePoints();
    // }
    // dispatch(updatePlanElement(line));   
  
    // if(selected && (planMode === PlanMode.RemovePointNoJoin || planMode === PlanMode.RemovePointThenJoin)){
    //   const join:boolean = planMode === PlanMode.RemovePointThenJoin;
    //   if(!join && !line.pathIsClose) return;

    //   const planElementsClone = PlanElementsHelper.clone(planElements);
    //   const lineClone: Line | undefined = planElementsClone.find(el => el.id === line.id ) as Line | undefined;
    //   if(!lineClone) return;
    //   lineClone.removePoint(id, join);

    //   const planElementsRecordsClone:PlanElementsRecordsHandler = planElementsRecords.clone();
    //   // const planElementsClone = PlanElementsHelper.clone(planElements);
      
    //   planElementsRecordsClone.currentRecordIndex++;
    //   planElementsRecordsClone.records = planElementsRecordsClone.records.slice(0, planElementsRecordsClone.currentRecordIndex);
    //   planElementsRecordsClone.records.push(planElementsClone);
    //   dispatch(setPlanElementsRecords(planElementsRecordsClone));
    //   dispatch(setPlanElements(planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex]));
      // dispatch(updatePlanElement(line));

      // if(lineClone){
      //   lineClone.removePoint(id, join);
      //   if(lineClone.path.length < 2){
      //     const planElementToRemoveIndex = planElementsClone.findIndex((el) => el.id === lineClone.id);
      //     if(planElementToRemoveIndex === -1) return;
      //     planElementsClone.splice(planElementToRemoveIndex, 1);
      //   }
      //   // const lClone = l.clone();
      //   const newPlanElementsRecords:PlanElementsRecordsHandler = planElementsRecords.clone();
      //   newPlanElementsRecords.currentRecordIndex++;
      //   newPlanElementsRecords.records = newPlanElementsRecords.records.slice(0, newPlanElementsRecords.currentRecordIndex);
        
      //   newPlanElementsRecords.records.push(planElementsClone);
      //   dispatch(setPlanElementsRecords(newPlanElementsRecords));


      //   dispatch(setPlanElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]));

      // }
    // }

      // if(line.path.length < 2){ //if line has 1 point, delete the line
      //   const planElementToRemoveIndex = planElements.findIndex((el) => el.id === line.id);
      //   if(planElementToRemoveIndex === -1) return;
      //   const planElementsClone = cloneArray(planElements);
      //   planElementsClone.splice(planElementToRemoveIndex, 1);
      //   dispatch(setPlanElements(planElementsClone));
      // }
    

  },[selected, addingPointLineIdPointId, planMode, line, planElements, id, savePlan, dispatch, addPoint]);

  // const handleOnTouchEnd = handleOnMouseUp;

  const handleOnMouseMove = useCallback(()=>{
    if(planMode !== PlanMode.AddPoint) return;
    line.pointIdCursorIsOver = id; 
    dispatch(updatePlanElement(line));
  },[planMode, line, id, dispatch]);
  
  const handleOnTouchMove = handleOnMouseMove;

  const handleOnMouseOut = useCallback(()=>{
    // dispatch(setUnselectAllOnPlanMouseUp(true));

    // dispatch(setSelectingPlanElement(false));
    // if(!line.addPointSession) return;
    // line.addPointSession.pointIndexCursorIsOver = null;
    if(planMode === PlanMode.AddPoint){
      line.pointIdCursorIsOver = null;
    }
    dispatch(updatePlanElement(line));
  },[dispatch, line, planMode]);
  

  const handlePointerLeave = useCallback(()=>{
    // dispatch(setUnselectAllOnPlanMouseUp(true));

    // dispatch(setSelectingPlanElement(false));
    // if(!line.addPointSession) return;
    // line.addPointSession.pointIndexCursorIsOver = null;
    if(planMode === PlanMode.AddPoint){
      dispatch(setAddingPointLineIdPointId(null));
    }
  },[dispatch, planMode]);

  // const handleOnClick = useCallback(()=>{
  //   if(!line.addPointSession) return;
  //   line.addPointSession.active = !line.addPointSession.active;
  //   dispatch(updatePlanElement(line));
  // },[dispatch, line]);

  // const handleOnDragEnd = useCallback(()=>{
  //   const planElementsRecordsClone:PlanElementsRecordsHandler = planElementsRecords.clone();
  //   const planElementsClone = PlanElementsHelper.clone(planElements);
  //       planElementsRecordsClone.currentRecordIndex++;
  //   planElementsRecordsClone.records = planElementsRecordsClone.records.slice(0, planElementsRecordsClone.currentRecordIndex);
  //   planElementsRecordsClone.records.push(planElementsClone);
  //   dispatch(setPlanElementsRecords(planElementsRecordsClone));
  //   dispatch(setPlanElements(planElementsRecordsClone.records[planElementsRecordsClone.currentRecordIndex]));
  //   console.log("point handleOnDragEnd aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  // },[dispatch, planElements, planElementsRecords]);

  const handleDragEnd = useCallback(() => {
    if(line.pointOverJoinablePoint(id, planProps.scale) && line.path.length > 3){
      line.joinExtremePoints();
    }
    line.selectedPointId = null;

    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);

    const currentLineClone: Line = currentPlanElementsClone[PlanElementsHelper.findElementIndexById(planElements, line.id)] as Line;

    const currentLinePointClone = currentLineClone.getPathPointById(id) as Point;
    if(!currentLinePointClone || !dragStartPos) return; //todo: throw error

    currentLinePointClone.x = dragStartPos.x;
    currentLinePointClone.y = dragStartPos.y;

    console.log("currentLinePointClone", currentLinePointClone)
    const nextLineClone: Line = nextPlanElementsClone[PlanElementsHelper.findElementIndexById(planElements, line.id)] as Line;
    const nextLinePointClone = nextLineClone.getPathPointById(id) as Point;
    console.log("nextLinePointClone", nextLinePointClone)

    savePlan(currentPlanElementsClone, nextPlanElementsClone);

    setDragStartPos(null);

  },[dragStartPos, id, line, planElements, planProps.scale, savePlan]);

  return (
    <Circle
        x = {position.x}
        y = {position.y}
        radius = {line.pointRadius * 1 / planProps.scale}
        fill= {
          planMode === PlanMode.MovePoint? 'blue' : 
          planMode === PlanMode.AddPoint? 'orange' : 
          planMode === PlanMode.RemovePointThenJoin? 'red':
          planMode === PlanMode.RemovePointNoJoin? '#8B0000':
          'white'
        }
        opacity = {line.getSelected()? selected? 1 : 0.5 : 0}
        stroke= 'black'
        strokeWidth = {selected? line.pointOverJoinablePoint(id, 1/planProps.scale) ? 3 : 2 : 0}
        // onClick={handleOnClick}
        
        // onMouseDown = { handleOnMouseDown}
        onPointerDown={handleOnPointerDown}
        // onTouchStart = {handleOnTouchStart}
        // onMouseUp={handleOnMouseUp}
        onClick={e => {
          e.cancelBubble = true;
        }}
        // onTap={
        //   e => {
        //   alert("ooksss")
        //   e.cancelBubble = true;
        // }}
        onPointerUp={e => {
          // console.log("point onPointerUp")
          e.cancelBubble = true;
          handleOnPointerUp();
        }}
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
        onMouseMove={handleOnMouseMove}
        onTouchMove={handleOnTouchMove}
        // onMouseOut={handleOnMouseOut}
        onPointerOut={handleOnMouseOut}
        draggable = {line.selectedPointId === id && planMode === PlanMode.MovePoint}
        onDragStart={e => {
          setDragStartPos(planCursorPos);
          // console.log("point dragstart")
          e.cancelBubble = true;
        }}
        onDragMove={e => {
          // console.log("point dragmove")
          e.cancelBubble = true;
          updateLinePoint(new Point(v4(), e.target.position().x, e.target.position().y));
        }}
        onDragEnd={e => {
          // console.log("point dragend")
          e.cancelBubble = true;
          handleDragEnd();
        }}

    />
  )
};

export default LinePoint;


// class PointKonvaProperties {
//   color: string;
//   position: Point;

//   constructor(){

//   }
// }