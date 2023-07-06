
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { AllJointSegs, Diameter, Dimensions, EditableHelper, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, Res, ResArrowStatus, Seg, SegClassName, SegOnCreationData, SheetData, SheetDataA, SheetDataADJ, SheetDataAEP, SheetDataAgrDrain, SheetDataCAEP, SheetDataCR, SheetDataCompass, SheetDataDEP, SheetDataDoor, SheetDataEditable, SheetDataFS, SheetDataGate, SheetDataGutter, SheetDataPool, SheetDataPoolSymbol, SheetDataRB, SheetDataREP, SheetDataREU, SheetDataRVEP, SheetDataRVEU, SheetDataRes, SheetDataRoadDrain, SheetDataSeg, SheetDataSymbol, SheetDataVAAEP, SheetDataWall, SymbolPlanElement, Wall, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setSegOnCreationData, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { NAME_TEXT_DEFAULT_FONT_SIZE } from "@/global";
import { v4 } from 'uuid';

type Props = {
    sheetData: SheetData,
  };


const PlanElementSheet: React.FC<Props> = ({sheetData}) => {
  const dispatch = useDispatch();
  const planElements: PlanElement[] = useSelector(selectPlanElements);
  const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);
  const planMode: PlanMode = useSelector(selectPlanMode);
  // const [inputNumero, setInputNumero] = useState<string>("");
  const savePlan = useSavePlan();
  const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);
  const [editable, setEditable] = useState<SheetDataEditable | undefined>(undefined);

  // const [sheetDataPlanElement, setSheetDataPlanElement] = useState<PlanElement | undefined>();

  // useEffect(()=>{
  //   if(!sheetData.planElementId) return;

  //   setSheetDataPlanElement()
  // },[planElements]);



    // useEffect(()=>{
  //   setInputNumero("");
  // },[sheetData])

  const getRightJointSegs = useCallback((allJointSegs:AllJointSegs):JointSegs | undefined=>{
    if(sheetData instanceof SheetDataWall){
      return allJointSegs.jointWalls;
    } else if(sheetData instanceof SheetDataREP){
      return allJointSegs.jointREPs;
    } else if(sheetData instanceof SheetDataREU){
      return allJointSegs.jointREUs;
    } else if(sheetData instanceof SheetDataAEP){
      return allJointSegs.jointAEPs;
    } else if(sheetData instanceof SheetDataGutter){
      return allJointSegs.jointGutters;
    } else if(sheetData instanceof SheetDataPool){
      return allJointSegs.jointPools;
    } else if(sheetData instanceof SheetDataRoadDrain){
      return allJointSegs.jointRoadDrains;
    } else if(sheetData instanceof SheetDataAgrDrain){
      return allJointSegs.jointAgrDrains;
    }
  }, [sheetData]);

  const getEditable = useCallback((): SheetDataEditable | undefined =>{
    const segIsOnCreation = segOnCreationData != null;
    let editable: SheetDataEditable | undefined;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;
      if(segIsOnCreation){

      }
      else if(sheetData.planElementId != undefined){
        editable= getRightJointSegs(PlanElementsHelper.getAllJointSegs(planElements))!.segs[segId];
      }
    }else if(sheetData instanceof SheetDataSymbol && sheetData.planElementId != undefined){
      editable = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
    }
    return editable;
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);

  useEffect(()=>{
    setEditable(getEditable());
  },[getEditable])

  const handleNumeroInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newNumero = e.currentTarget.value;
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        segOnCreationData!.numero = newNumero;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: newNumero, 
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: segOnCreationData.nameTextFontSize,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: segOnCreationData.sinister
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        seg.numero = newNumero;
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
          if(elIdx === -1) continue;
          const segInPlanElementsRecord = getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[segId];
          if(segInPlanElementsRecord){
            segInPlanElementsRecord.numero = newNumero;
          }
        }

      }
  
    }else if(sheetData.planElementId != undefined){
      sheetDataPlanElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId);
      (sheetDataPlanElement as SymbolPlanElement).numero = newNumero;
      for(const planElementsRecord of planElementsRecords.records){
        const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
        if(elIdx === -1) continue;
        const symbolInPlanElementsRecord = PlanElementsHelper.findElementById(planElementsRecord, sheetData.planElementId);
        if(symbolInPlanElementsRecord){
          (symbolInPlanElementsRecord as SymbolPlanElement).numero = newNumero;
        }
      }
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, planElementsRecords.records, segOnCreationData, sheetData]);

  const convertTypeNameToString = useCallback(()=>{
    if(sheetData instanceof SheetDataWall){
      return "Mur";
    }else if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else if(sheetData instanceof SheetDataAEP){
      return "RAEP";
    }else if(sheetData instanceof SheetDataGutter){
      return "G";
    }else if(sheetData instanceof SheetDataPool){
      return "RP";
    }else if(sheetData instanceof SheetDataRoadDrain){
      return "DR";
    }else if(sheetData instanceof SheetDataAgrDrain){
      return "DA";
    }else if(sheetData instanceof SheetDataA){
      return "A";
    }else if(sheetData instanceof SheetDataDEP){
      return "DEP";
    }else if(sheetData instanceof SheetDataRVEP){
      return "RVEP";
    }else if(sheetData instanceof SheetDataRVEU){
      return "RVEU";
    }else if(sheetData instanceof SheetDataRB){
      return "RB";
    }else if(sheetData instanceof SheetDataFS){
      return "FS";
    }else if(sheetData instanceof SheetDataCR){
      return "CR";
    }else if(sheetData instanceof SheetDataVAAEP){
      return "VAAEP";
    }else if(sheetData instanceof SheetDataCAEP){
      return "CAEP";
    }else if(sheetData instanceof SheetDataCompass){
      return "Compass";
    }else if(sheetData instanceof SheetDataPoolSymbol){
      return "PoolSymbol";
    }else if(sheetData instanceof SheetDataGate){
      return "Gate";
    }else if(sheetData instanceof SheetDataDoor){
      return "Door";
    }else if(sheetData instanceof SheetDataADJ){
      return "ADJ";
    }
  },[sheetData]);

  const deleteElement = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    if(sheetData instanceof SheetDataSeg){
      const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.deleteSeg((sheetData as SheetDataSeg).segId!);
    }else if(sheetData.planElementId != undefined){
      PlanElementsHelper.deleteSymbol(planElements, sheetData.planElementId);
    }

    // if(!sheetDataPlanElement) return; //theorically not possible but just in case
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, dispatch, savePlan, getRightJointSegs]);


  const handleShowArrowInputChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const showArrow = e.currentTarget.checked;
    if(segOnCreationData != null){
      segOnCreationData.resArrowStatus = showArrow ? ResArrowStatus.Forwards : ResArrowStatus.None;
      dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, 
        numero: segOnCreationData.numero, 
        nameTextVisibility: segOnCreationData.nameTextVisibility, 
        resArrowStatus: segOnCreationData.resArrowStatus,
        nameTextFontSize: segOnCreationData.nameTextFontSize,
        nameTextRotation: segOnCreationData.nameTextRotation,
        sinister: segOnCreationData.sinister
      }));
    }else{
      const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const res:Res = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Res;

      res.arrowStatus = showArrow ? ResArrowStatus.Forwards : ResArrowStatus.None;

      const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
      savePlan(currentPlanElementsClone, nextPlanElementsClone);
      // dispatch(updatePlanElement(sheetDataPlanElement));
      // dispatch(setPlanElementsRecords(planElementsRecords.clone()));

    }
  },[dispatch, getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);

  const handleShowNameInputChange= useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const showName = e.currentTarget.checked;

    if(segOnCreationData != null){
      segOnCreationData.nameTextVisibility = showName;
      dispatch(setSegOnCreationData({segClassName: segOnCreationData.segClassName, 
        numero: segOnCreationData.numero, 
        nameTextVisibility: segOnCreationData.nameTextVisibility, 
        resArrowStatus: segOnCreationData.resArrowStatus,
        nameTextFontSize: segOnCreationData.nameTextFontSize,
        nameTextRotation: segOnCreationData.nameTextRotation,
        sinister: segOnCreationData.sinister
      }));
      return segOnCreationData.nameTextVisibility;
    }else{

      const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
      let editableElement: Seg | SymbolPlanElement | undefined; 
      if(sheetData instanceof SheetDataSeg){
        const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
        const segId = (sheetData as SheetDataSeg).segId!;
        editableElement = getRightJointSegs(sheetDataPlanElement)!.segs[segId] as Seg;
  
      }else if(sheetData.planElementId != undefined){
        editableElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
      }
      if(!editableElement) return; //should throw error
      if(!showName){
        editableElement.nameTextVisibility = false;
      }else{
        editableElement.nameTextPosition = editableElement.getDefaultNameTextPosition();
        editableElement.nameTextFontSize = editableElement.nameTextFontSize;
        editableElement.nameTextRotation = editableElement.nameTextRotation;
        editableElement.nameTextVisibility = true;
      }

      const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
      savePlan(currentPlanElementsClone, nextPlanElementsClone);
      // dispatch(updatePlanElement(sheetDataPlanElement));
      // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
      return editableElement.nameTextVisibility;
    }

  },[dispatch, getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);

  const nameIsVisible = useCallback(():boolean=>{
    if(sheetData instanceof SheetDataSeg){
      if(segOnCreationData != null){
        return segOnCreationData.nameTextVisibility;
      }else if(sheetData.planElementId != undefined){
          const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
          const segId = (sheetData as SheetDataSeg).segId!;
          const seg:Seg = getRightJointSegs(sheetDataPlanElement)!.segs[segId];
          return seg? seg.nameTextVisibility:false;
      }
    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId);
      return sheetDataPlanElement? (sheetDataPlanElement as SymbolPlanElement).nameTextVisibility:false;
    }
  
    return false;
  },[getRightJointSegs, planElements, segOnCreationData, sheetData]);

  const reverseArrow = useCallback(()=>{
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
    const segId = (sheetData as SheetDataSeg).segId!;
    const res:Res = getRightJointSegs(sheetDataPlanElement)!.segs[segId] as Res;

    res.arrowStatus = res.arrowStatus === ResArrowStatus.Backwards ? ResArrowStatus.Forwards : ResArrowStatus.Backwards;

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  },[getRightJointSegs, planElements, savePlan, sheetData]);

  const arrowIsVisible = ():boolean=>{
    if(segOnCreationData != null){
      return segOnCreationData.resArrowStatus != ResArrowStatus.None;
    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement:AllJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
      const segId = (sheetData as SheetDataSeg).segId!;
      const res:Res = getRightJointSegs(sheetDataPlanElement)!.segs[segId] as Res;
  
      return res? res.arrowStatus != ResArrowStatus.None : false;
    }
    return false;

  }

  const getNumero = useCallback((hideMinusOne:boolean):string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.numero;
      }
      else if(sheetData.planElementId != undefined){
        const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        return seg? seg.numero == "-1" && hideMinusOne ? "":seg.numero:"";
      }
    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId);
      if(!sheetDataPlanElement) return "";
      const symbol = sheetDataPlanElement as SymbolPlanElement;
      return symbol? symbol.numero == "-1" && hideMinusOne ? "":symbol.numero:"";
    }

    return "";
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);


  const getTextSize = useCallback(():string=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        return segOnCreationData!.nameTextFontSize.toString();
      }
      else if(sheetData.planElementId != undefined){

        const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        return seg.nameTextFontSize.toString();
        
      }

    }else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId);
      return (sheetDataPlanElement as SymbolPlanElement).nameTextFontSize.toString();
    }
    return "";
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);



  const handleTextSizeInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newSize = e.currentTarget.value;
    const newSizeNumber = parseFloat(newSize);
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        // segOnCreationData!.nameTextFontSize = newSizeNumber;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: segOnCreationData.numero, 
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: newSizeNumber,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: segOnCreationData.sinister
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;

        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId];
        seg.nameTextFontSize = newSizeNumber;
        for(const planElementsRecord of planElementsRecords.records){
          const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
          if(elIdx === -1) continue;
          const segInPlanElementsRecord = getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[segId];
          if(segInPlanElementsRecord){
            segInPlanElementsRecord.nameTextFontSize = newSizeNumber;
          }
        }
      }
    }else if(sheetData.planElementId != undefined){
      sheetDataPlanElement = PlanElementsHelper.findElementById(planElements, sheetData.planElementId);
      (sheetDataPlanElement as SymbolPlanElement).nameTextFontSize = newSizeNumber;
      for(const planElementsRecord of planElementsRecords.records){
        const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
        if(elIdx === -1) continue;
        const symbolInPlanElementsRecord = PlanElementsHelper.findElementById(planElementsRecord, sheetData.planElementId);
        if(symbolInPlanElementsRecord){
          (symbolInPlanElementsRecord as SymbolPlanElement).nameTextFontSize = newSizeNumber;
        }
      }
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    // dispatch(updatePlanElement(sheetDataPlanElement));
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, planElementsRecords.records, segOnCreationData, sheetData]);




  const getSheetTitle = ():string=>{
    let preTitle = segOnCreationData != null? " en création": "";
    if(segOnCreationData){
      switch(segOnCreationData.segClassName){
        case(SegClassName.Wall):{
          return "Mur"+preTitle;
        }
        case(SegClassName.REP):{
          return "REP"+preTitle;
        }
        case(SegClassName.REU):{
          return "REU"+preTitle;
        }
        case(SegClassName.AEP):{
          return "AEP"+preTitle;
        }
        case(SegClassName.Gutter):{
          return "Gouttière"+preTitle;
        }
        case(SegClassName.Pool):{
          return "Rés. Piscine"+preTitle;
        }
        case(SegClassName.RoadDrain):{
          return "Drain Routier"+preTitle;
        }
        case(SegClassName.AgrDrain):{
          return "Drain Agricole"+preTitle;
        }
        default:{
          return "";
        }
      }
    }
    if(sheetData instanceof SheetDataWall){
      return "Mur";
    }else if(sheetData instanceof SheetDataREP){
      return "REP";
    }else if(sheetData instanceof SheetDataREU){
      return "REU";
    }else if(sheetData instanceof SheetDataAEP){
      return "AEP";
    }else if(sheetData instanceof SheetDataGutter){
      return "Gouttière";
    }else if(sheetData instanceof SheetDataPool){
      return "Réseau piscine";
    }else if(sheetData instanceof SheetDataRoadDrain){
      return "Drain Routier";
    }else if(sheetData instanceof SheetDataAgrDrain){
      return "Drain Agricole";
    }else if(sheetData instanceof SheetDataA){
      return "Anomalie";
    }else if(sheetData instanceof SheetDataDEP){
      return "Descente d'eau pluviale";
    }else if(sheetData instanceof SheetDataRVEP){
      return "Regard de visite d'eaux pluviales";
    }else if(sheetData instanceof SheetDataRVEU){
      return "Regard de visite d'eaux usées";
    }else if(sheetData instanceof SheetDataRB){
      return "Regard borgne";
    }else if(sheetData instanceof SheetDataFS){
      return "Fosse sceptique";
    }else if(sheetData instanceof SheetDataCR){
      return "Cuve récupération eau pluviale";
    }else if(sheetData instanceof SheetDataVAAEP){
      return "Vanne d'arrêt AEP";
    }else if(sheetData instanceof SheetDataCAEP){
      return "Cuve récupération eau pluviale";
    }else if(sheetData instanceof SheetDataCompass){
      return "Boussole";
    }else if(sheetData instanceof SheetDataPoolSymbol){
      return "Piscine";
    }else if(sheetData instanceof SheetDataGate){
      return "Portail";
    }else if(sheetData instanceof SheetDataDoor){
      return "Porte";
    }else if(sheetData instanceof SheetDataADJ){
      return "Abri de jardin";
    }
    return "";
  }



  const handleSinisterInputChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newValue = e.currentTarget.checked;
    // setInputNumero(newNumero);
    let sheetDataPlanElement:PlanElement | undefined;

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    if(sheetData instanceof SheetDataWall){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){
        segOnCreationData!.sinister = newValue;
        dispatch(setSegOnCreationData({
          segClassName: segOnCreationData.segClassName, 
          numero: segOnCreationData.numero,
          nameTextVisibility: segOnCreationData.nameTextVisibility, 
          resArrowStatus: segOnCreationData.resArrowStatus,
          nameTextFontSize: segOnCreationData.nameTextFontSize,
          nameTextRotation: segOnCreationData.nameTextRotation,
          sinister: newValue,
        }));
      }
      else if(sheetData.planElementId != undefined){
        // let segId:string | undefined;
        sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
        const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Wall;
        const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
        seg.sinister = newValue;
        savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
      }
    }
    
    if(segIsOnCreation || !sheetDataPlanElement) return;
    dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[dispatch, getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);

  
  const handleSymbolScaleInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newValue = e.currentTarget.value;
    if(!(sheetData instanceof SheetDataSymbol && sheetData.planElementId != undefined)) return;
    const symbol = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    symbol.scale = parseFloat(newValue);
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[planElements, savePlan, sheetData]);

  
  const getSinister = useCallback(():boolean=>{
    const segIsOnCreation= segOnCreationData != null;
    
    if(!(sheetData instanceof SheetDataWall)) return false;

    const segId = (sheetData as SheetDataSeg).segId!;

    if(segIsOnCreation){
      return segOnCreationData!.sinister;
    }
    else if(sheetData.planElementId != undefined){
      const sheetDataPlanElement = PlanElementsHelper.getAllJointSegs(planElements);
      const seg = getRightJointSegs(sheetDataPlanElement as AllJointSegs)!.segs[segId] as Wall;
      if(!seg) return false; //otherwise bug if wall is deleted
      return seg.sinister;
    }
    return false;
  }, [getRightJointSegs, planElements, segOnCreationData, sheetData]);

  const getSymbolScale = useCallback(():string=>{    
    if(!(sheetData instanceof SheetDataSymbol && sheetData.planElementId != undefined)) return "";
    const symbol = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
    if(!symbol) return "";
    return symbol.scale.toString();
  }, [planElements, sheetData]);


  const getAdditionalProperties = () : ReactNode => {
    const segIsOnCreation = segOnCreationData != null;
    let editable: SheetDataEditable | undefined;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;
      if(segIsOnCreation){

      }
      else if(sheetData.planElementId != undefined){
        editable= getRightJointSegs(PlanElementsHelper.getAllJointSegs(planElements))!.segs[segId];
      }
    }else if(sheetData instanceof SheetDataSymbol && sheetData.planElementId != undefined){
      editable = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
    }

    const result = [];
    if(!editable) return null;

    if(editable.availableDiameters.length){
      result.push(
        <div>
          <label htmlFor="diameter-select">Diamètre:</label>
          <select name="diameters" id="diameter-select" value={EditableHelper.diameterNumberToDiameterKey(editable.diameter, editable.availableDiameters)} onChange={handleDiameterSelectOnChange}>
            {
              editable.availableDiameters.map(diameter => 
                <option 
                key={v4()} 
                value={diameter}
                > 
                  {EditableHelper.diameterKeyToDiameterNumber(diameter)}
                </option>)
            }
          </select>
          


        </div>
      );
    }
    if(!result) return null;
    return result.map(reactNode => <div key={v4()}>{reactNode}</div>);
  };
  
  const handleDiameterOnChange = useCallback((diameter:number)=>{
    const newValue = diameter;

    // setInputNumero(newNumero);
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);

    //(only a seg can be on creation because a symbol element is created instantly)
    const segIsOnCreation = segOnCreationData != null;

    let editable: SheetDataEditable | undefined;

    if(sheetData instanceof SheetDataSeg){
      const segId = (sheetData as SheetDataSeg).segId!;

      if(segIsOnCreation){

      }
      else if(sheetData.planElementId != undefined){
        const allJointSegs = PlanElementsHelper.getAllJointSegs(planElements);
        editable = getRightJointSegs(allJointSegs)!.segs[segId];

      }
    }else if(sheetData.planElementId != undefined){
      editable = PlanElementsHelper.findElementById(planElements, sheetData.planElementId) as SymbolPlanElement;
    }

    if(!editable) return;
    editable.diameter = newValue;

    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));

    // if(segIsOnCreation || !sheetDataPlanElement) return;
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    // dispatch(setPlanElementsRecords(planElementsRecords.clone()));
  
  },[getRightJointSegs, planElements, savePlan, segOnCreationData, sheetData]);


  const handleDiameterSelectOnChange = useCallback((e:React.FormEvent<HTMLSelectElement>)=>{
    handleDiameterOnChange(EditableHelper.diameterKeyToDiameterNumber(parseFloat(e.currentTarget.value)) as number);
  },[handleDiameterOnChange]);


  const handleDiameterInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    handleDiameterOnChange(parseFloat(e.currentTarget.value? e.currentTarget.value:"0"));
  },[handleDiameterOnChange]);

  return (
    <div className={`${styles['main']}`} >
      <div className={styles['sheet-header']}>{getSheetTitle()}</div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>Ref</div>
        <div className={`${styles['content']}`}>{convertTypeNameToString() + getNumero(true)}</div>
      </div>
      <div className={`${styles['table']}`}>
        <div className={`${styles['label']}`}>N°</div>
        <input
            className={`${styles['content']}`}
            value={getNumero(false)}
            type="number"
            min="-1"
            onChange={(e) => {handleNumeroInputOnChange(e)}} 
        />
      </div>
      
      <div>
          <input 
            type="checkbox" 
            id="show-name" 
            className={styles["checkbox"]}
            onChange={handleShowNameInputChange}
            checked={nameIsVisible()}
          />
          <label htmlFor="show-name">Afficher le nom</label>
        </div>
      {/* <button className={styles['toggle-name-visibility-btn']}
        onClick={toggleNameVisibility}
      > */}
        {/* {nameIsVisible()?"Cacher":"Afficher"} le nom
      </button> */}
      {nameIsVisible()?
        <div>
          <input type="range" id="text-size" name="text-size" value={getTextSize()} onChange={handleTextSizeInputOnChange}
          min="16" max="22"/>
          <label htmlFor="text-size">Taille du texte</label>
          {/* <input type="range" id="rotation" name="rotation" value={getTextRotation()} onChange={(e)=>{handleRotationInputOnChange(e)}}
          min="0" max="360"/>
          <label htmlFor="volume">Angle</label> */}
        </div>
        :null
      }

      {sheetData instanceof SheetDataRes?
        <div>
          {/* <button
            className={styles['toggle-arrow-visibility-btn']}
            onClick={toggleArrowVisibility}
          >{arrowIsVisible()?"Cacher":"Afficher"} la flèche</button> */}

          <input 
            type="checkbox" 
            id="show-arrow"
            className={styles["checkbox"]}
            onChange={handleShowArrowInputChange}
            checked={arrowIsVisible()}
          />
          <label htmlFor="show-arrow">Afficher la flèche</label>
          {
            segOnCreationData === null && arrowIsVisible()?
            <button
              className={styles['reverse-arrow-btn']}
              onClick={reverseArrow}
            >Inverser la flèche</button>
            :null
          }

        </div>
        :null
      }
      {
        sheetData instanceof SheetDataWall?
        <div>
          <input 
            type="checkbox"
            id="sinister"
            className={styles["checkbox"]}
            onChange={handleSinisterInputChange}
            checked={getSinister()}
          />
          <label htmlFor="sinister">Sinistre</label>
        </div>
        :null
      }
      {sheetData instanceof SheetDataSymbol?
        <div>
          <input type="range" id="symbol-scale" name="symbol-scale" value={getSymbolScale()} onChange={handleSymbolScaleInputOnChange}
            min="0" max="2" step={0.1}/>
          <label htmlFor="symbol-scale">Taille du symbole</label>
          {/* <input type="range" id="rotation" name="rotation" value={getTextRotation()} onChange={(e)=>{handleRotationInputOnChange(e)}}
          min="0" max="360"/>
          <label htmlFor="volume">Angle</label> */}
        </div>
        :null
      }
      {
        <>
          {getAdditionalProperties()}
        </>
      }
      {editable?
        <input
            value={editable.diameter ? editable.diameter : ""}
            type="number"
            min="0"
            onChange={handleDiameterInputOnChange} 
              /> : null}
      {!segOnCreationData?
        <button className={styles['del-btn']}
          onClick={deleteElement}
        >
          <div className={styles['del-cross']}>
            +</div> Supprimer
        </button>
        :null
      }
    </div>
  )
};

export default PlanElementSheet;