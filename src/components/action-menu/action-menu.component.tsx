import { MagnetData, PlanElement, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, PlanProps, Point, Position } from "@/entities";
import { addPlanElement, setMagnetData, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanMode, setSelectingPlanElement, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectMagnetData, selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectPlanProps } from "@/redux/plan/plan.selectors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Circle, Group } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import styles from './action-menu.module.scss';
import PlanMenuButton from "../plan-menu-button/plan-menu-button.component";
import { PLAN_HEIGHT_SCREEN_RATIO, PLAN_WIDTH_SCREEN_RATIO, TOP_MENU_HEIGHT } from "@/global";
import { cloneArray } from "@/utils";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
// import AddElementMenu from "../add-element-menu/add-element-menu.component";
const {v4} = require("uuid");

const ActionMenu: React.FC = () => {
  const planProps:PlanProps = useSelector(selectPlanProps);
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planMode: PlanMode = useSelector(selectPlanMode);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const magnetData: MagnetData = useSelector(selectMagnetData);
  const savePlan = useSavePlan();
  const dispatch = useDispatch();

  // const selectMenu = useCallback(() =>{
  //   const el = planElements.find(el => el.getSelected());
  //   if(!el) return null;
  //   switch(el.typeName){
  //     case(PlanElementTypeName.Line): {
  //       return <LineMenu line={el as Line}/>;
  //     }
  //     default: {
  //       return null
  //     }
  //   }
  // },[planElements]);

  // const addLine = useCallback(()=>{
  //   console.log("addLine")
  //   for(const elId in planElements){
  //     console.log("elId", elId)

  //   }
  //   const lineLenghtMaxWhenAdded = 100;
  //   let lineLength = planProps.dimensions.w * 0.3;
  //   lineLength = lineLength < lineLenghtMaxWhenAdded ? lineLength : lineLenghtMaxWhenAdded;

  //   const p1x = (planProps.dimensions.w * 0.5 - planProps.position.x) * 1/planProps.scale - lineLength * 0.5;
  //   const p1y = (planProps.dimensions.h * 0.5 - planProps.position.y) * 1/planProps.scale;
  //   const p2x = p1x + lineLength;
  //   const p2y = p1y;

  //   const newElement:PlanElement = new Line(v4(), [new Point(v4(), p1x,p1y), new Point(v4(), p2x, p2y)], 25);
  //   dispatch(addPlanElement(newElement));
  // },[dispatch, planElements, planProps.dimensions.h, planProps.dimensions.w, planProps.position.x, planProps.position.y, planProps.scale]);

  const setPlanModeToAddElement= useCallback(()=>{
    dispatch(setPlanMode(PlanMode.AddPlanElement));
  }, [dispatch]);
  const setPlanModeToMove = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.MovePoint));
  }, [dispatch]);
  const setPlanModeToAddPoint = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.AddPoint));
  }, [dispatch]);
  const setPlanModeToRemovePointThenJoin = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.RemovePointThenJoin));
  }, [dispatch]);
  const setPlanModeToRemovePointNoJoin = useCallback(()=>{
    dispatch(setPlanMode(PlanMode.RemovePointNoJoin));
  }, [dispatch]);

  const removeSelectedPlanElements = useCallback(()=>{
    let elementsRemoved: boolean = false; 
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    for(const el of planElements){
        if(!el.getSelected()) continue;
        elementsRemoved = true;
        const planElementToRemoveIndex = nextPlanElementsClone.findIndex((iterEl) => iterEl.id === el.id);
        if(planElementToRemoveIndex === -1) continue;
        nextPlanElementsClone.splice(planElementToRemoveIndex, 1);
    }
    if(!elementsRemoved) return;
    savePlan(currentPlanElementsClone, nextPlanElementsClone);

  }, [planElements, savePlan]);

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
