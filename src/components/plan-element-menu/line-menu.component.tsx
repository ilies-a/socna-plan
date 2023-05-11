import { Line, LinePointMode, PlanElement, PlanMode, Point, Position } from "@/entities";
import { setPlanMode, setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanMode } from "@/redux/plan/plan.selectors";
import { useCallback, useEffect } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import styles from './line-menu.module.scss';
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";

type Props = {
    line: Line,
  };

const LineMenu: React.FC<Props> = ({line}) => {
    const planMode: PlanMode = useSelector(selectPlanMode);
  const dispatch = useDispatch();

//   const setLineModeToRemovePointThenJoin = useCallback(()=>{
//     line.selectPointId(null);
//     let newLinePointMode: LinePointMode = line.linePointMode;
    
//     switch(line.linePointMode){
//         case LinePointMode.RemovePointThenJoin: {
//             newLinePointMode = line.memoizedMoveOrAddMode;
//             break;
//         }
//         case LinePointMode.MovePoint: 
//         case LinePointMode.AddPoint:
//         {
//             line.memoizedMoveOrAddMode = line.linePointMode;
//         }
//         default:{
//             newLinePointMode = LinePointMode.RemovePointThenJoin;
//             break;
//         }
//     }
//     line.linePointMode = newLinePointMode;
//     dispatch(updatePlanElement(line));
//     // line.linePointMode = newLinePointMode; line.linePointMode !== LinePointMode.RemovePointThenJoin ? LinePointMode.RemovePointThenJoin : line.memoizedMoveOrAddMode;

//     // if(line.linePointMode != LinePointMode.RemovePointThenJoin && line.linePointMode != LinePointMode.RemovePointNoJoin){
//     //     line.memoizedMoveOrAddMode = line.linePointMode;
//     // }

//   },[dispatch, line]);
//   const setLineModeToRemovePointNoJoin = useCallback(()=>{
//     line.selectPointId(null);
//     let newLinePointMode: LinePointMode = line.linePointMode;
    
//     switch(line.linePointMode){
//         case LinePointMode.RemovePointNoJoin: {
//             newLinePointMode = line.memoizedMoveOrAddMode;
//             break;
//         }
//         case LinePointMode.MovePoint: 
//         case LinePointMode.AddPoint:
//         {
//             line.memoizedMoveOrAddMode = line.linePointMode;
//         }
//         default:{
//             newLinePointMode = LinePointMode.RemovePointNoJoin;
//             break;
//         }
//     }
//     line.linePointMode = newLinePointMode;
//     dispatch(updatePlanElement(line));
//   },[dispatch, line]);


  const setPlanModeToRemovePointThenJoin = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.RemovePointThenJoin));
  }, [dispatch])
  const setPlanModeToRemovePointNoJoin = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.RemovePointNoJoin));
  }, [dispatch])

  return (
    <div className={styles['main']}>
        {/* <PlanMenuButton name="-" handleOnClick={setPlanModeToRemovePointThenJoin} active={planMode === PlanMode.RemovePointThenJoin}/>
        <PlanMenuButton name="/-/" handleOnClick={setPlanModeToRemovePointNoJoin} active={planMode === PlanMode.RemovePointNoJoin}/> */}
        {/* <button className={styles['remove']}
            onClick={setLineModeToRemovePointThenJoin}
        >&#10060;
        </button>
        <button className={styles['remove']}
            onClick={setLineModeToRemovePointNoJoin}
        ><hr/>&#10060;</button> */}
    </div>
  )
};

export default LineMenu;
