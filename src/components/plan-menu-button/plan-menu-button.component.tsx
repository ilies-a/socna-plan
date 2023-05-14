
import { MouseEventHandler, ReactNode, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { Dimensions, iconDataArr } from "@/entities";


type Props = {
    iconFileName: string,
    handleOnClick: MouseEventHandler<HTMLButtonElement> | undefined,
    active: boolean,
    available: boolean
  };

const PlanMenuButton: React.FC<Props> = ({iconFileName, handleOnClick, active, available}) => {

  const icon = useCallback(():ReactNode  =>{
    for(const iconData of iconDataArr){
      if(iconData.fileName === iconFileName){
        return(
          <div className={styles['icon-wrapper']} >
            <Image 
            src={`/img/${iconData.fileName}`} 
            alt={""} 
            priority 
            className={styles['icon']} 
            width={iconData.dimensions.w * 0.5}
            height={iconData.dimensions.h * 0.5}
            />
          </div>
        );
      }
    }
  },[iconFileName]);


  return (
    <button
        className={`${styles['button']} ${active? styles['active'] : null} ${available? styles['available'] : null}`} 
        onClick={handleOnClick}>
            {icon()}
        </button>
  )
};

export default PlanMenuButton;
