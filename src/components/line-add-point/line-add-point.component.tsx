import { Line, LinePointMode, PlanElement, PlanProps, Point, Position } from "@/entities";
import { setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanProps } from "@/redux/plan/plan.selectors";
import { useCallback, useEffect } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";


type Props = {
  line: Line,
  position: Position,
};
 
const LineAddPoint: React.FC<Props> = ({line, position}) => {
  const planProps:PlanProps = useSelector(selectPlanProps);
  const dispatch = useDispatch();

  // const endAddPointSession = useCallback(()=>{
  //   line.endAddPointSession();
  //   dispatch(updatePlanElement(line));
  // },[dispatch, line]);

  // const handleOnMouseDown = useCallback(()=>{
  // },[]);

  // const handleOnTouchStart = handleOnMouseDown;

  // const handleOnMouseUp = useCallback(()=>{
  // },[]);
  
  // const handleOnTouchEnd = handleOnMouseUp;

  return (
    <Circle
        x = {position.x}
        y = {position.y}
        radius = {20 * 1/planProps.scale}
        fill= 'red'
        stroke= 'black'
        strokeWidth = {line.pointIdCursorIsOver == null ?1:3}
        listening={false}
        // onTap={endAddPointSession}
        // onMouseDown = { handleOnMouseDown}
        // onTouchStart = {handleOnTouchStart}
        // onMouseUp={handleOnMouseUp}
        // onTouchEnd={handleOnTouchEnd}
        // onDblClick={switchLinePointMode}
        // onDblTap={switchLinePointMode}
        // draggable = {line.getSelected() && line.linePointMode === LinePointMode.MovePoint} 
        // onDragMove={e => {
        //   updateLinePoint(new Point(e.target.position().x, e.target.position().y));
        // }}
    />
  )
};

export default LineAddPoint;
