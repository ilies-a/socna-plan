import { AppDynamicProps, MagnetData, PlanElement, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, PlanProps, Point, Position } from "@/entities";
import { addPlanElement, setAllElementsWrapperCoordSize, setAppDynamicProps, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanMode, setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectAppDynamicProps, selectMagnetData, selectPlanElements, selectPlanElementsRecords, selectPlanMode } from "@/redux/plan/plan.selectors";
import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import styles from './action-menu.module.scss';
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { PLAN_HEIGHT_SCREEN_RATIO, PLAN_WIDTH_SCREEN_RATIO, SCALE_MAX, SCALE_MIN, TOP_MENU_HEIGHT } from "@/global";
import { cloneArray } from "@/utils";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import Link from "next/link";
// import AddElementMenu from "../add-element-menu/add-element-menu.component";
const {v4} = require("uuid");

const ActionMenu: React.FC = () => {
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const magnetData: MagnetData = useSelector(selectMagnetData);
  const savePlan = useSavePlan();
  const dispatch = useDispatch();
  const appDynamicProps: AppDynamicProps = useSelector(selectAppDynamicProps);

  const toPreviousRecord = useCallback(()=>{
    if(planElementsRecords.currentRecordIndex === 0 ) return;
    const newPlanElementsRecords:PlanElementsRecordsHandler = planElementsRecords.clone();
    newPlanElementsRecords.currentRecordIndex --;

    PlanElementsHelper.unselectAllElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]);
    dispatch(setPlanElementSheetData(null));

    dispatch(setPlanElementsRecords(newPlanElementsRecords));
    dispatch(setPlanElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]));
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n")
    console.log("record index = ",newPlanElementsRecords.currentRecordIndex);
    console.log("record last index = ",newPlanElementsRecords.records.length - 1);
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n")
  }, [dispatch, planElementsRecords]);

  const toNextRecord = useCallback(()=>{
    if(planElementsRecords.currentRecordIndex === planElementsRecords.records.length - 1) return;
    const newPlanElementsRecords:PlanElementsRecordsHandler = planElementsRecords.clone();

    newPlanElementsRecords.currentRecordIndex ++;

    PlanElementsHelper.unselectAllElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]);
    dispatch(setPlanElementSheetData(null));

    dispatch(setPlanElementsRecords(newPlanElementsRecords));
    dispatch(setPlanElements(newPlanElementsRecords.records[newPlanElementsRecords.currentRecordIndex]));

    console.log("\n\n\n\n\n\n\n\n\n\n\n\n")
    console.log("record index = ",newPlanElementsRecords.currentRecordIndex);
    console.log("record last index = ",newPlanElementsRecords.records.length - 1);
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n")
  }, [dispatch, planElementsRecords]);

  const hasPreviousRecords:boolean = useMemo(()=>{
    return planElementsRecords.currentRecordIndex > 0; 
  }, [planElementsRecords.currentRecordIndex]);

  const hasNextRecords:boolean = useMemo(()=>{
    // console.log("hasNextRecords planElementsRecords.currentRecordIndex",planElementsRecords.currentRecordIndex)
    // console.log("hasNextRecords planElementsRecords.records.length",planElementsRecords.records.length)
    return planElementsRecords.currentRecordIndex < planElementsRecords.records.length - 1; 
  }, [planElementsRecords.currentRecordIndex, planElementsRecords.records.length]);

  const toggleActivateMagnet = useCallback(()=>{
    let newMagnetData; 
    if(magnetData.activeOnAxes){
      newMagnetData = {activeOnAxes: false, node: magnetData.node, seg: magnetData.seg };
    }else{
      newMagnetData = {activeOnAxes: true, node: magnetData.node, seg: magnetData.seg };
    }
    dispatch(setMagnetData(newMagnetData as MagnetData));

  }, [dispatch, magnetData]);

  const downloadURI = (uri:string, name:string) =>{
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleExport = () => {
    const allElementsWrapperCoordSize = PlanElementsHelper.calculateAllElementsWrapperCoordSize(planElements);
    dispatch(setAllElementsWrapperCoordSize(allElementsWrapperCoordSize));
    dispatch(setPlanMode(PlanMode.Export));
  };

  const zoomIn = () => {
    const newAppDynamicProps = {... appDynamicProps};
    const newScale = newAppDynamicProps.planScale * 1.5;
    newAppDynamicProps.planScale = newScale > SCALE_MAX ? SCALE_MAX : newScale;
    dispatch(setAppDynamicProps(newAppDynamicProps));
  };

  const zoomOut = () => {
    const newAppDynamicProps = {... appDynamicProps};
    const newScale = newAppDynamicProps.planScale * 0.5;
    newAppDynamicProps.planScale = newScale < SCALE_MIN ? SCALE_MIN : newScale;
    dispatch(setAppDynamicProps(newAppDynamicProps));
  };

  return (
    <div className={styles['main']}
      style={{"height":""+TOP_MENU_HEIGHT+"px"}}
    >
      <div className={styles['mode-buttons']}>
        {/* <PlanMenuButton iconFileName="move.png" handleOnClick={setPlanModeToMove} active={planMode === PlanMode.MovePoint} available segStrokeWidth={null}/>
        <PlanMenuButton iconFileName="add-el.png" handleOnClick={setPlanModeToAddElement} active={planMode === PlanMode.AddPlanElement} available segStrokeWidth={null}/>
        <PlanMenuButton iconFileName="del-el.png" handleOnClick={removeSelectedPlanElements} active={false} available={PlanElementsHelper.hasSelectedElements(planElements)} segStrokeWidth={null}/>
        <PlanMenuButton iconFileName="add-point.png" handleOnClick={setPlanModeToAddPoint} active={planMode === PlanMode.AddPoint} available segStrokeWidth={null}/>
        <PlanMenuButton iconFileName="del-point.png" handleOnClick={setPlanModeToRemovePointThenJoin} active={planMode === PlanMode.RemovePointThenJoin} available segStrokeWidth={null}/>
        <PlanMenuButton iconFileName="del-seg.png" handleOnClick={setPlanModeToRemovePointNoJoin} active={planMode === PlanMode.RemovePointNoJoin} available segStrokeWidth={null}/> */}
        <PlanMenuButton iconFileName="arrow-prev.png" handleOnClick={toPreviousRecord} active={false} available={hasPreviousRecords}/>
        <PlanMenuButton iconFileName="arrow-next.png" handleOnClick={toNextRecord} active={false} available={hasNextRecords}/>
        <PlanMenuButton iconFileName="magnet.png" handleOnClick={toggleActivateMagnet} active={magnetData.activeOnAxes} available={true}/>
        <PlanMenuButton iconFileName="zoom-in.png" handleOnClick={zoomIn} active={false} available={true}/>
        <PlanMenuButton iconFileName="zoom-out.png" handleOnClick={zoomOut} active={false} available={true}/>
        <PlanMenuButton iconFileName="export.png" handleOnClick={handleExport} active={false} available={true}/>
      </div>
      {/* {
      planMode === PlanMode.AddPlanElement?
        <AddElementMenu/>
        :null
      } */}
    </div>
  )
};

export default ActionMenu;
