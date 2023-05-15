
import { MouseEventHandler, ReactNode, useCallback } from "react";
import styles from './plan-menu-button.module.scss';
import Image from "next/image";
import { Dimensions, iconDataArr } from "@/entities";

type Props = {
    iconFileName: string,
    handleOnClick: MouseEventHandler<HTMLButtonElement> | undefined,
    active: boolean,
    available: boolean,
    wallStrokeWidth: number | null
  };


const PlanMenuButton: React.FC<Props> = ({iconFileName, handleOnClick, active, available, wallStrokeWidth}) => {

  const icon = useCallback(():ReactNode  =>{
    for(const iconData of iconDataArr){
      if(iconData.fileName === iconFileName){
        return(
          !wallStrokeWidth?
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
          :
          <div
            className={styles['wall-icon']}
            style={{"height":""+wallStrokeWidth+"px"}}
          >
          </div>
        );
      }
    }
  },[iconFileName, wallStrokeWidth]);


  return (
    <button
        className={`${styles['button']} ${active? styles['active'] : null} ${available? styles['available'] : null}`} 
        onClick={handleOnClick}>
            {icon()}
        </button>
  )
};

export default PlanMenuButton;
