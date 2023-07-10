
import { MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from './plan-element-sheet.module.scss';
import Image from "next/image";
import { A, AllJointSegs, Diameter, Dimensions, EditableHelper, JointSegs, JointWalls, PlanElement, PlanElementSheetData, PlanElementsHelper, PlanElementsRecordsHandler, PlanMode, Res, ResArrowStatus, Seg, SegClassName, SegOnCreationData, SheetData, SheetDataA, SheetDataADJ, SheetDataAEP, SheetDataAgrDrain, SheetDataCAEP, SheetDataCR, SheetDataCompass, SheetDataDEP, SheetDataDoor, SheetDataEditable, SheetDataFS, SheetDataGate, SheetDataGutter, SheetDataPool, SheetDataPoolSymbol, SheetDataRB, SheetDataREP, SheetDataREU, SheetDataRVEP, SheetDataRVEU, SheetDataRes, SheetDataRoadDrain, SheetDataSeg, SheetDataSymbol, SheetDataVAAEP, SheetDataWall, SymbolPlanElement, Test, Wall, iconDataArr } from "@/entities";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setSegOnCreationData, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectSegOnCreationData } from "@/redux/plan/plan.selectors";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import { NAME_TEXT_DEFAULT_FONT_SIZE } from "@/global";
import { v4 } from 'uuid';
import CameraButton from "../camera-button/camera-button.component";

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
  // const [editable, setEditable] = useState<SheetDataEditable | undefined>(undefined);

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

  // useEffect(()=>{
  //   setEditable(getEditable());
  // },[getEditable]);


  const updateAllRecords = useCallback((f:any) =>{
    const editable = getEditable();
    if(!editable || !sheetData.planElementId) return;

      for(const planElementsRecord of planElementsRecords.records){
        const elIdx = PlanElementsHelper.findElementIndexById(planElementsRecord, sheetData.planElementId);
        if(elIdx === -1) continue;
        const editableInPlanElementRecord = sheetData instanceof SheetDataSeg ?
          getRightJointSegs(planElementsRecord[elIdx] as AllJointSegs)!.segs[editable.id]
          :
          PlanElementsHelper.findElementById(planElementsRecord, sheetData.planElementId) as SymbolPlanElement;
        if(editableInPlanElementRecord){
          f(editableInPlanElementRecord);
        }
      }
      dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
    }, [dispatch, getEditable, getRightJointSegs, planElements, planElementsRecords.records, sheetData]);

  

  const handleNumeroInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const newNumero = e.currentTarget.value;
    const editable = getEditable();
    if(!editable) return;
    editable.numero = newNumero;
    updateAllRecords(
      (editable: SheetDataEditable)=>{
        editable.numero = newNumero;
      }
     );  
  },[getEditable, updateAllRecords]);

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
      
      if(sheetData instanceof SheetDataA){
        PlanElementsHelper.removeAnomalyIdFromAllElements(planElements, sheetData.planElementId);
      }
    }


    // if(!sheetDataPlanElement) return; //theorically not possible but just in case
    // dispatch(updatePlanElement(sheetDataPlanElement));
    // dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));

    const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
    savePlan(currentPlanElementsClone, nextPlanElementsClone);
    dispatch(setPlanElementSheetData(null));
  }, [planElements, sheetData, savePlan, dispatch, getRightJointSegs]);


  const handleShowArrowInputChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const editable = getEditable();
    const showArrow = e.currentTarget.checked;
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    (editable as Res).arrowStatus = showArrow ? ResArrowStatus.Forwards : ResArrowStatus.None;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleShowNameInputChange= useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const showName = e.currentTarget.checked;
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    if(!showName){
      editable.nameTextVisibility = false;
    }else{
      editable.nameTextPosition = (editable as Seg | SymbolPlanElement).getDefaultNameTextPosition();
      editable.nameTextVisibility = true;
    }
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const nameIsVisible = useCallback(():boolean=>{
    const editable = getEditable();
    return editable? editable.nameTextVisibility:false;
  },[getEditable]);

  const reverseArrow = useCallback(()=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    const editableAsRes = (editable as Res);
    editableAsRes.arrowStatus = editableAsRes.arrowStatus === ResArrowStatus.Backwards ? ResArrowStatus.Forwards : ResArrowStatus.Backwards;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const arrowIsVisible = ():boolean=>{
    const editable = getEditable();
    if(!editable) return false;
    const editableAsRes = (editable as Res);
    return editableAsRes? editableAsRes.arrowStatus != ResArrowStatus.None : false;
  }

  const getNumero = useCallback((hideMinusOne:boolean):string=>{
    const editable = getEditable();
    return editable? editable.numero == "0" && hideMinusOne ? "":editable.numero:"";
  }, [getEditable]);


  const getTextSize = useCallback(():string=>{
    const editable = getEditable();
    return editable? editable.nameTextFontSize.toString():"";
  }, [getEditable]);


  const handleTextSizeInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const editable = getEditable();
    if(!editable) return;
    const newValueStr = e.currentTarget.value;
    const newValue = parseFloat(newValueStr);
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    editable.nameTextFontSize = newValue;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);




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
    const editable = getEditable();
    if(!editable) return;
    const newValue = e.currentTarget.checked;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    (editable as Wall).sinister = newValue;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);
  
  const handleSymbolScaleInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    const editable = getEditable();
    if(!editable) return;
    const newValue = e.currentTarget.value;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    (editable as SymbolPlanElement).scale = parseFloat(newValue);
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  
  const getSinister = useCallback(():boolean=>{
    const editable = getEditable();
    return editable? (editable as Wall).sinister:false;
  }, [getEditable]);

  const getSymbolScale = useCallback(():string=>{    
    const editable = getEditable();
    return editable? (editable as SymbolPlanElement).scale.toString():"";
  }, [getEditable]);


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

    //DIAMETERS
    if(editable.availableDiameters.length){
      result.push(
        <>
          <label htmlFor="diameter-select">Diamètre:</label>
          <select name="diameters" id="diameter-select" value={EditableHelper.diameterNumberToDiameterKey(editable.diameter, editable.availableDiameters)} onChange={handleDiameterSelectOnChange}>
            {
              editable.availableDiameters.map((diameter, i) => 
                <option 
                key={"diam-option"+i} 
                value={diameter}
                > 
                  {EditableHelper.diameterKeyToDiameterNumber(diameter)}
                </option>)
            }
          </select>
          
          <input
            value={editable.diameter ? editable.diameter : ""}
            type="number"
            min="0"
            onChange={handleDiameterInputOnChange} 
              />
        </>
      );
    }

    //MATERIALS
    if(editable.availableMaterials.length){
      result.push(
        <>
          <label htmlFor="material-select">Matériau:</label>
          <select name="materials" id="material-select" 
          value={EditableHelper.materialStringToMaterialKey(editable.material, editable.availableMaterials)} 
          onChange={handleMaterialSelectOnChange}>
            {
              editable.availableMaterials.map((material, i) => 
                <option 
                key={"mat-option"+i} 
                value={material}
                > 
                  {EditableHelper.materialKeyToMaterialString(material)}
                </option>)
            }
          </select>
        </>
      );
    }

    //TESTS
    if(editable.availableTests.length){
      result.push(
        <>
          <span>Tests:</span>
          {
            editable.availableTests.map((test, i) =>
            <div
            key={"test"+i} 
            >
              <input
                id={"test-input"+i} 
                key={"test-input"+i} 
                type="checkbox" 
                className={styles["checkbox"]}
                onChange={handleTestInputOnChange}
                value={test}
                checked={editable!.tests.find(t => t === test) != undefined}
              />
              <label htmlFor={"test-input"+i}>{EditableHelper.testKeyToTestString(test)}</label>
            </div>
            )
          }
        </>
      );
    }

    //COMMENTS
    if(editable.availableComments.length){
      result.push(
        <>
          <label htmlFor="comment-select">Commentaire:</label>
          <select name="comments" 
          id="comment-select" 
          value={EditableHelper.commentStringToCommentKey(editable.comment, editable.availableComments)} 
          onChange={handleCommentSelectOnChange}>
            {
              editable.availableComments.map((comment, i) => 
                <option 
                key={"com-option"+i} 
                value={comment}
                > 
                  {EditableHelper.commentKeyToCommentString(comment, true)}
                </option>)
            }
          </select>
          
          <input
            value={editable.comment ? editable.comment : ""}
            type="text"
            onChange={handleCommentInputOnChange} 
              />
        </>
      );
    }


    //ANOMALIES
    if(!(editable instanceof A)){
      const anomalies = PlanElementsHelper.getAnomalies(planElements);
      if(anomalies.length){
        result.push(
          <>
            <span>Anomalies:</span>
            {
              anomalies.map((anomaly, i) =>
              <div
              key={"test"+i} 
              >
                <input
                  id={"anomaly-input"+i} 
                  key={"anomaly-input"+i} 
                  type="checkbox" 
                  className={styles["checkbox"]}
                  onChange={handleAnomalyInputOnChange}
                  value={anomaly.id}
                  checked={editable!.anomaliesIds.find(id => id === anomaly.id) != undefined}
                />
                <label htmlFor={"anomaly-input"+i}>{anomaly.getRef()}</label>
              </div>
              )
            }
          </>
        );
      }
    }

    //PHOTOS
    if(editable.photoURLs.length){
      result.push(
        <>
          <span>Photos:</span>
          {
            editable.photoURLs.map((base64Data, i) =>
              <div
              key={"photo"+i} 
              >
              <Image src={base64Data} alt="Preview" width={300} height={300} />
            </div>
            )
          }
        </>
      );
    }

    if(!result) return null;
    return result.map((reactNode, i) => <div key={"result"+i}>{reactNode}</div>);
  };
  
  const handleDiameterOnChange = useCallback((diameter:number)=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    editable.diameter = diameter;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleDiameterSelectOnChange = useCallback((e:React.FormEvent<HTMLSelectElement>)=>{
    handleDiameterOnChange(EditableHelper.diameterKeyToDiameterNumber(parseFloat(e.currentTarget.value)) as number);
  },[handleDiameterOnChange]);

  const handleDiameterInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    handleDiameterOnChange(parseFloat(e.currentTarget.value? e.currentTarget.value:"0"));
  },[handleDiameterOnChange]);

  const handleMaterialOnChange = useCallback((material:string)=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    editable.material = material;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleMaterialSelectOnChange = useCallback((e:React.FormEvent<HTMLSelectElement>)=>{
    handleMaterialOnChange(EditableHelper.materialKeyToMaterialString(parseInt(e.currentTarget.value)));
  },[handleMaterialOnChange]);


  const handleTestOnChange = useCallback((test:Test, testIsChecked: boolean)=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    if(testIsChecked){
      if(editable.tests.find(t => t === test) === undefined){ //adding the test
        editable.tests.push(test);
      }
    }
    else{
      const testIdx = editable.tests.findIndex(t => t === test);
      if(testIdx > -1){ //removing the test
        editable.tests.splice(testIdx, 1);
      }
    }
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleTestInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    handleTestOnChange(parseInt(e.currentTarget.value), e.currentTarget.checked);
  },[handleTestOnChange]);


  const handleCommentOnChange = useCallback((comment:string)=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    editable.comment = comment;
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleCommentSelectOnChange = useCallback((e:React.FormEvent<HTMLSelectElement>)=>{
    handleCommentOnChange(EditableHelper.commentKeyToCommentString(parseInt(e.currentTarget.value), false));
  },[handleCommentOnChange]);

  const handleCommentInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    handleCommentOnChange(e.currentTarget.value);
  },[handleCommentOnChange]);


  const handleAnomalyOnChange = useCallback((anomalyId:string, anomalyIsChecked: boolean)=>{
    const editable = getEditable();
    if(!editable) return;
    const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
    if(anomalyIsChecked){
      if(editable.anomaliesIds.find(id => id === anomalyId) === undefined){ //adding the anomaly
        editable.anomaliesIds.push(anomalyId);
      }
    }
    else{
      const anomalyIdx = editable.anomaliesIds.findIndex(id => id === anomalyId);
      if(anomalyIdx > -1){ //removing the anomaly
        editable.anomaliesIds.splice(anomalyIdx, 1);
      }
    }
    savePlan(currentPlanElementsClone, PlanElementsHelper.clone(planElements));
  },[getEditable, planElements, savePlan]);

  const handleAnomalyInputOnChange = useCallback((e:React.FormEvent<HTMLInputElement>)=>{
    handleAnomalyOnChange(e.currentTarget.value, e.currentTarget.checked);
  },[handleAnomalyOnChange]);


  const setCameraButton = useCallback(()=>{
    const editable = getEditable();
    return editable? <CameraButton editable={editable}/> : null
  },[getEditable]);

  return (
    <div className={`${styles['main']}`} >
      <div className={styles['sheet-header']}>{getSheetTitle()}</div>
      {!segOnCreationData?
        <>

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
            min="0"
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
            min="0.5" max="2" step={0.1}/>
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
      {
        <>
          {setCameraButton()}
        </>
      }

        <button className={styles['del-btn']}
          onClick={deleteElement}
        >
          <div className={styles['del-cross']}>
            +</div> Supprimer
        </button>
        </>
        :
        <div style={{textAlign:"center"}}>...</div>
        }
    </div>
  )
};

export default PlanElementSheet;