
import { MouseEventHandler, ReactNode, useCallback } from "react";
import styles from './plan-element-button.module.scss';
import Image from "next/image";
import { Dimensions, iconDataArr } from "@/entities";

type Props = {
    name: string,
    onClick: any,
  };


const PlanElementButton: React.FC<Props> = ({name, onClick}) => {

  return (
    <button className={`${styles['button']}`} onClick={onClick}>
        {name}
    </button>
  )
};

export default PlanElementButton;
