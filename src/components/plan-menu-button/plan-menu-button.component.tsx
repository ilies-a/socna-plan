import { Line, LinePointMode, PlanElement, Point, Position } from "@/entities";
import { setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements } from "@/redux/plan/plan.selectors";
import { MouseEventHandler, useCallback, useEffect, useMemo } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import styles from './plan-menu-button.module.scss';
import { getSelectedPlanElement } from "@/utils";

type Props = {
    name: string,
    handleOnClick: MouseEventHandler<HTMLButtonElement> | undefined,
    active: boolean
  };

const PlanMenuButton: React.FC<Props> = ({name, handleOnClick, active}) => {

  return (
    <button
        className={`${styles['button']} ${active? styles['active'] : null}`} 
        onClick={handleOnClick}>
            {name}
        </button>
  )
};

export default PlanMenuButton;
