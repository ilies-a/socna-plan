import { Line, LinePointMode, PlanElement, PlanProps, Point, Position } from "@/entities";
import { addPlanElement, setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanProps } from "@/redux/plan/plan.selectors";
import { useCallback, useEffect, useMemo } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import styles from './plan-element-menu.module.scss';
import { getSelectedPlanElement } from "@/utils";
import LineMenu from "./line-menu.component";
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { PLAN_HEIGHT_SCREEN_RATIO, PLAN_WIDTH_SCREEN_RATIO } from "@/global";
const {v4} = require("uuid");

const PlanElementMenu: React.FC = () => {
  const planProps:PlanProps = useSelector(selectPlanProps);
  const planElements:{ [key: string]: PlanElement } = useSelector(selectPlanElements);
  const dispatch = useDispatch();

  const selectMenu = useCallback(() =>{
    const el = getSelectedPlanElement(planElements);
    if(!el) return null;
    switch(el.constructor.name){
      case("Line"): {
        return <LineMenu line={el as Line}/>;
      }
      default: {
        return null
      }
    }
  },[planElements]);

  const addLine = useCallback(()=>{
    console.log("addLine")
    for(const elId in planElements){
      console.log("elId", elId)

    }
    const lineLenghtMaxWhenAdded = 100;
    let lineLength = planProps.dimensions.w * 0.3;
    lineLength = lineLength < lineLenghtMaxWhenAdded ? lineLength : lineLenghtMaxWhenAdded;

    const p1x = (planProps.dimensions.w * 0.5 - planProps.position.x) * 1/planProps.scale - lineLength * 0.5;
    const p1y = (planProps.dimensions.h * 0.5 - planProps.position.y) * 1/planProps.scale;
    const p2x = p1x + lineLength;
    const p2y = p1y;

    const newElement:PlanElement = new Line(v4(), [new Point(p1x,p1y), new Point(p2x, p2y)], 25);
    dispatch(addPlanElement(newElement));
  },[dispatch, planProps.dimensions.h, planProps.dimensions.w, planProps.position.x, planProps.position.y, planProps.scale]);

  return (
    <div className={styles['main']}>
      <PlanMenuButton name="&#43;" handleOnClick={addLine} active={false}/>
      {selectMenu()}
    </div>
  )
};

export default PlanElementMenu;
