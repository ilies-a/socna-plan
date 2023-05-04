import { Line, LinePointMode, PlanElement, PlanProps, Point, Position } from "@/entities";
import { setPlanElements, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanProps, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import { useCallback, useEffect, useState } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";


type Props = {
  line: Line,
  id: string,
  position: Position,
  selected: boolean
};
 
const LinePoint: React.FC<Props> = ({line, id, position, selected}) => {
  const dispatch = useDispatch();
  const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
  const planElements:{ [key: string]: PlanElement } = useSelector(selectPlanElements);
  const planProps:PlanProps = useSelector(selectPlanProps);

  // const [test, setTest] = useState(false);

  const updateLinePoint = (p:Point) =>{
    const linePath = line.path;
    line.updatePathPointPositionById(id, p);
    // linePath[pointIndex] = p;
    dispatch(updatePlanElement(line));
  }
  
  // useEffect(()=>{
  //   console.log("test before", test); 

  //   setTest(true);
  //   console.log("test after", test); 

  // },[])

  

  const switchLinePointModeMoveAdd = useCallback(()=>{
    if(line.linePointMode === LinePointMode.MovePoint){
      line.linePointMode = LinePointMode.AddPoint;
      line.selectPointId(null);
    }else if(line.linePointMode === LinePointMode.AddPoint){
      line.linePointMode = LinePointMode.MovePoint;
    }
    dispatch(updatePlanElement(line));
  },[dispatch, line]);

  // const selectPointIndex = useCallback(()=>{
  //   line.selectPointIndex(pointIndex);
  //   dispatch(updatePlanElement(line));
  // },[dispatch, line, pointIndex]);

  const handleOnMouseDown = useCallback(()=>{
    // dispatch(setUnselectAllOnPlanMouseUp(false));
    line.pointIdPointingDownOn = id;

    // dispatch(setSelectingPlanElement(true));
    if(!line.getSelected()){
      line.setSelected(true);
    }else{
      line.selectPointId(id);
    }
    // if(line.addPointSession){
    //   line.addPointSession.pointIndexCursorIsOver = pointIndex;
    // }
    if(line.linePointMode === LinePointMode.AddPoint){
      line.pointIdCursorIsOver = id;
    }
    dispatch(updatePlanElement(line));
  },[dispatch, line, id]);

  const handleOnTouchStart = handleOnMouseDown;

  
  const handleOnMouseUp = useCallback(()=>{
    // // dispatch(setSelectingPlanElement(false));
    // dispatch(setUnselectAllOnPlanMouseUp(false));
    // console.log("p handleOnMouseUp unselectAllOnPlanMouseUp", unselectAllOnPlanMouseUp);
 
    if(line.linePointMode === LinePointMode.RemovePointNoJoin || line.linePointMode === LinePointMode.RemovePointThenJoin){
      const join:boolean = line.linePointMode === LinePointMode.RemovePointThenJoin;
      if(!join && !line.pathIsClose) return;
      line.removePoint(id, join);
      if(line.path.length < 2){ //if line has 1 point, delete the line
        delete planElements[line.id];
        dispatch(setPlanElements(planElements));
      }
    }

  },[line, id, planElements, dispatch]);

  const handleOnTouchEnd = handleOnMouseUp;

  const handleOnMouseMove = useCallback(()=>{
    if(line.linePointMode !== LinePointMode.AddPoint) return;
    line.pointIdCursorIsOver = id; 
    dispatch(updatePlanElement(line));
  },[dispatch, line, id]);
  
  const handleOnTouchMove = handleOnMouseMove;

  const handleOnMouseOut = useCallback(()=>{
    // dispatch(setUnselectAllOnPlanMouseUp(true));

    // dispatch(setSelectingPlanElement(false));
    // if(!line.addPointSession) return;
    // line.addPointSession.pointIndexCursorIsOver = null;
    if(line.linePointMode === LinePointMode.AddPoint){
      line.pointIdCursorIsOver = null;
    }
    dispatch(updatePlanElement(line));
  },[dispatch, line]);
  
  // const handleOnClick = useCallback(()=>{
  //   if(!line.addPointSession) return;
  //   line.addPointSession.active = !line.addPointSession.active;
  //   dispatch(updatePlanElement(line));
  // },[dispatch, line]);


  return (
    <Circle
        x = {position.x}
        y = {position.y}
        radius = {line.pointRadius * 1 / planProps.scale}
        fill= {
          line.linePointMode === LinePointMode.MovePoint? 'blue' : 
          line.linePointMode === LinePointMode.AddPoint? 'orange' : 
          line.linePointMode === LinePointMode.RemovePointThenJoin? 'red':
          line.linePointMode === LinePointMode.RemovePointNoJoin? '#8B0000':
          'white'
        }
        opacity = {line.getSelected()? selected? 1 : 0.5 : 0}
        stroke= 'black'
        strokeWidth = {selected? line.pointOverJoinablePoint(id, 1/planProps.scale) ? 3 : 2 : 0}
        // onClick={handleOnClick}
        
        onMouseDown = { handleOnMouseDown}
        onTouchStart = {handleOnTouchStart}
        // onMouseUp={handleOnMouseUp}
        onPointerUp={handleOnMouseUp}
        onTouchEnd={handleOnTouchEnd}
        onDblClick={switchLinePointModeMoveAdd}
        onDblTap={switchLinePointModeMoveAdd}
        onMouseMove={handleOnMouseMove}
        onTouchMove={handleOnTouchMove}
        // onMouseOut={handleOnMouseOut}
        onPointerOut={handleOnMouseOut}
        draggable = {line.selectedPointId === id && line.linePointMode === LinePointMode.MovePoint} 
        onDragMove={e => {
          updateLinePoint(new Point(e.target.position().x, e.target.position().y));
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