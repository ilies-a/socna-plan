import { Group, Layer, Path, Rect, Shape, Stage, Line as KonvaLine, Circle, Text } from "react-konva";
import styles from './plan.module.scss';
import { v4 } from 'uuid';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Seg, PlanMode, PlanElement, PlanProps, Point, Position, PlanElementsHelper, JointSegs, TestPoint, SegNode, AddSegSession, MagnetData, PlanElementSheetData, Vector2D, PlanElementsRecordsHandler, JointSegsClassName, AllJointSegs, SegOnCreationData, AppDynamicProps, SheetDataEditable, Size, CoordSize, SymbolPlanElement } from "@/entities";
import { cloneArray, getDistance, getMovingNodePositionWithMagnet, objToArr } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { addPlanElement, setAddSegSession, setAddingPointLineIdPointId, setAppDynamicProps, setMagnetData, setPlanCursorPos, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanElementsSnapshot, setPlanIsDragging, setPlanMode, setSegOnCreationData, setSelectingPlanElement, setStageRef, setUnselectAllOnPlanMouseUp, updatePlanElement, updatePlanProps } from "@/redux/plan/plan.actions";
import { selectAddSegSession, selectAddingPointLineIdPointId, selectAllElementsWrapperCoordSize, selectAppDynamicProps, selectLineToAdd, selectMagnetData, selectPlanCursorPos, selectPlanElementSheetData, selectPlanElements, selectPlanElementsRecords, selectPlanElementsSnapshot, selectPlanIsDragging, selectPlanMode, selectPlanPointerUpActionsHandler, selectSegOnCreationData, selectSelectingPlanElement, selectStageRef, selectTestPoints, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import { LEFT_MENU_WIDTH_LARGE_SCREEN, LEFT_MENU_WIDTH_MEDIUM_SCREEN, NON_DAZZLING_WHITE, PLAN_HEIGHT_SCREEN_RATIO, PLAN_HORIZONTAL_MARGIN, PLAN_MARGIN_BOTTOM, PLAN_MARGIN_TOP, PLAN_VERTICAL_MARGIN, PLAN_WIDTH_SCREEN_RATIO, SCALE_MAX, SCALE_MIN, TOP_MENU_HEIGHT } from "@/global";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import SegNodeComponent from "../seg-node/seg-node.component";
import SegComponent from "../seg-component/seg-component.component";
import { useAddSeg } from "@/custom-hooks/use-add-seg.hook";
import RefText from "../ref-text/ref-text.component";
import SymbolComponent from "../symbols/symbol.component";


export type JointSegsAndSegNodes ={
    jointSegs:JointSegs,
    segNodes: [SegNode, SegNode],
    startingNodesPos: [Position, Position],
}

type TouchPosition = {
    id: number;
    x: number;
    y: number;
  };

const Plan: React.FC = () => {
    const minPlanDim: Dimensions = new Dimensions(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const [planDim, setPlanDim] = useState<Dimensions>(minPlanDim);
    // const [planScale, setPlanScale] = useState<number>(1);
    const [planPos, setPlanPos] = useState<Point>(new Point(v4(), 0,0));
    const [cursorPos, setCursorPos] = useState<Point>(new Point(v4(), 0,0));
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);

    // const planProps:PlanProps = useSelector(selectPlanProps);
    const planMode: PlanMode = useSelector(selectPlanMode);

    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);

    const selectingPlanElement = useSelector(selectSelectingPlanElement);
    const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
    const [dragging, setDragging] = useState<boolean>(false);
    const planIsDragging:boolean = useSelector(selectPlanIsDragging);
    const [scaling, setScaling] = useState<boolean>(false);
    // const scaleMax = 2;
    // const scaleMin = 1/9;

    const stageRefRedux = useSelector(selectStageRef);
    const stageRef = useRef<any>();
    const stageToExportRef = useRef<any>();
    
    // const [stageScale, setStageScale] = useState<{ x: number; y: number; }>({x:1, y:1});
    // const [stagePosition, setStagePosition] = useState<{ x: number; y: number; }>({x:1, y:1});

    const [lastCenter, setLastCenter] = useState<{ x: number; y: number; } | null>(null);
    const [lastDist, setLastDist] = useState<number>(0);


    const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
    const [pointerStartPos, setPointerStartPos] = useState<Position | null>(null);
    // const [dragDxy, setDragDxy] = useState<Vector2D>(new Vector2D(0,0));

    const [msg, setMsg] = useState("");

    const dispatch = useDispatch();
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);

    const [planElementsAtDragStart, setPlanElementsAtDragStart] = useState<PlanElement[] | null>(null);

    const [movingSeg, setMovingSeg] = useState<JointSegsAndSegNodes | null>(null);
    const [pointingOnSeg, setPointingOnSeg] = useState<boolean>(false);


    const savePlan = useSavePlan();
    const addSeg = useAddSeg();

    const testPoints: TestPoint[] = useSelector(selectTestPoints);
    const [preventUnselectAllElements, setPreventUnselectAllElements] = useState<boolean>(false);
    const addSegSession: AddSegSession | null = useSelector(selectAddSegSession);
    const magnetData: MagnetData = useSelector(selectMagnetData);
    const planElementsSnapshot: PlanElement[] | null = useSelector(selectPlanElementsSnapshot);
    const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);
    const segOnCreationData: SegOnCreationData | null = useSelector(selectSegOnCreationData);

    const appDynamicProps: AppDynamicProps = useSelector(selectAppDynamicProps);
    const allElementsWrapperCoordSize: CoordSize = useSelector(selectAllElementsWrapperCoordSize);
    const [touches, setTouches] = useState<TouchList | null>(null);


    useEffect(()=>{
        const handleResize = ()=>{
            console.log("resize")
            // const newPlanProps = new PlanProps();
            // const newAppDynamicProps: AppDynamicProps = {
            //     planSize: { width: 0, height: 0 },
            //     leftMenuWidth: 0,
            //     planScale: 1,
            //     planPosition: {x:0, y:0}
            // };
            // newPlanProps.dimensions = new Dimensions(planWrapperRef.getBoundingClientRect().width, planWrapperRef.getBoundingClientRect().height);
            const newAppDynamicProps = {... appDynamicProps};

            newAppDynamicProps.leftMenuWidth = window.innerWidth > 1000 ? LEFT_MENU_WIDTH_LARGE_SCREEN : LEFT_MENU_WIDTH_MEDIUM_SCREEN;

            newAppDynamicProps.planSize = { width: window.innerWidth  - newAppDynamicProps.leftMenuWidth, height: window.innerHeight - TOP_MENU_HEIGHT };

            // newPlanProps.dimensions = new Dimensions(window.innerWidth - leftMenuWidth, window.innerHeight - TOP_MENU_HEIGHT);
            dispatch(setAppDynamicProps(newAppDynamicProps));
        }
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
        
    },[dispatch]);

    const downloadURI = (uri:string, name:string) =>{
        var link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    useEffect(()=>{
        if(!(planMode === PlanMode.Export)) return;
        if(!stageToExportRef) return;
        const uri = stageToExportRef.current.toDataURL({pixelRatio: 1});
        downloadURI(uri, 'plan.png');
        // console.log("stageRef.current.getSize()", stageRef.current.getSize());
        // console.log("stageRef.current.getPosition()", stageRef.current.getPosition());

        dispatch(setPlanMode(PlanMode.Move));
    },[dispatch, planMode])

    useEffect(()=>{
        if(stageRef && stageRefRedux) return;
        dispatch(setStageRef(stageRef));
    },[dispatch, stageRef, stageRefRedux])

    // useEffect(()=>{
    //     console.log("planElements.length", planElements.length);
    // },[planElements]);

    // const setPlanScaleCallback = useCallback(()=> {
    //     setPlanScale(planScale+0.5);
    // },[planScale]);

    // const selectPlanElement = useCallback((el:PlanElement)=>{
    //     el.setSelected(true);
    //     dispatch(updatePlanElement(el));
    // }, [dispatch]);

    const moveUpPlanElement = useCallback((el:PlanElement)=>{
        const newPlanElements = planElements.slice();
        const planElement = newPlanElements.find(iterEl => iterEl.id === el.id);
        if(!planElement) return;
        const index = planElements.indexOf(planElement);
        newPlanElements.splice(index, 1);
        newPlanElements.push(planElement);
        dispatch(setPlanElements(newPlanElements));
    }, [dispatch, planElements]);

    // const toggleSelectPlanElement = useCallback((el:PlanElement)=>{
    //     el.setSelected(!el.getSelected());
    //     dispatch(updatePlanElement(el));
    // }, [dispatch]); 

    const saveIfMovingSeg = useCallback(()=>{
        const MIN_SHIFT_TO_ALLOW_SAVE = 1;
        if(movingSeg){
            const d = Math.sqrt(Math.pow((movingSeg.segNodes[0].position.x - movingSeg.startingNodesPos[0].x), 2) + Math.pow((movingSeg.segNodes[0].position.y - movingSeg.startingNodesPos[0].y), 2));
            if(d>MIN_SHIFT_TO_ALLOW_SAVE)
            {
                if(!planElementsSnapshot) return; //should throw error
                movingSeg.jointSegs.cleanSegs(movingSeg.jointSegs.hasSelectedSeg());
                const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
                savePlan(planElementsSnapshot, nextPlanElementsClone);
                dispatch(setPlanElementsSnapshot(null));
            }
            setMovingSeg(null);
        }
    },[dispatch, movingSeg, planElements, planElementsSnapshot, savePlan]);

    const getJointSegsDrawings = useCallback((js:JointSegs, idx: number) => {
        js.setSegs();
        js.setSegsPoints();
        const colorsForTesting = ["green","orange","blue","violet"];
        return (
            <Group key={idx}>
            {    
                objToArr(js.segs).map((seg:Seg, _) => {
                    const segIsSelected = js.segIsSelected(seg.id);
                    return <SegComponent 
                        key={seg.id}
                        id={seg.id}
                        seg={seg}
                        numero={seg.numero}
                        jointSegs={js}
                        points={seg.points}
                        segIsSelected={segIsSelected}
                        nodes={seg.nodes}
                        pointerStartPos={pointerStartPos}
                        movingSeg={movingSeg} 
                        setMovingSeg={setMovingSeg}
                        setPointingOnSeg= {setPointingOnSeg}
                        />
                })
            }
            {
                magnetData.seg?
                <Path
                    stroke="green"
                    strokeWidth={1}
                    dash={[10, 5]}
                    dashEnabled={true}
                    listening={false}
                    data={"M"+magnetData.seg.nodes[0].position.x.toString()+" "+
                        magnetData.seg.nodes[0].position.y.toString()+" "+
                        magnetData.seg.nodes[1].position.x.toString()+" "+
                        magnetData.seg.nodes[1].position.y.toString()}
                >
                </Path>:null
            }
            {
                magnetData.linePoints?
                <Path
                    stroke="green"
                    strokeWidth={1}
                    dash={[10, 5]}
                    dashEnabled={true}
                    listening={false}
                    data={"M"+magnetData.linePoints.p1.x.toString()+" "+
                        magnetData.linePoints.p1.y.toString()+" "+
                        magnetData.linePoints.p2.x.toString()+" "+
                        magnetData.linePoints.p2.y.toString()}
                >
                </Path>:null
            }
            {    
                Object.values(js.nodes).map((node, _) => {
                    return (
                        <SegNodeComponent
                            key={node.id}
                            node={node}
                            jointSegs={js}
                            pointingOnSeg= {pointingOnSeg}
                        />
                    );
                })
            }
            {/* {
                w.nodesToPrint. map((nodes, i) => {
                    return nodes.map(node=>{
                        return(
                            <Circle
                                key={node.id}

                                radius = {5}
                                x = {node.position.x}
                                y = {node.position.y}
                                fill={colorsForTesting[i]}
                                stroke="black"
                                strokeWidth={0}
                            />
                        );
                    })
                })
            } */}
            </Group>
        );
    }, [magnetData.linePoints, magnetData.seg, movingSeg, pointerStartPos, pointingOnSeg]);

    const getPlanElement = useCallback((el:PlanElement)=> {
        if(el instanceof AllJointSegs){
            const ajs = el as AllJointSegs;
            return ajs.jointSegs.map((js, i)=>{
                return getJointSegsDrawings(js, i);
            });
        }else if (el instanceof SymbolPlanElement) { //its a symbol
            return <SymbolComponent 
            key={el.id} 
            symbol={el as SymbolPlanElement} 
            pointingOnStage={pointerStartPos != null}
            />
        }
        // switch(el.instantiatedClassName){
        //     case(PlanElementClassName.AllJointSegs): {
        //         const ajs = el as AllJointSegs;
        //         const jointSegs:JointSegs[] = new Array<JointSegs>(3);
        //         jointSegs.push(ajs.jointWalls);
        //         jointSegs.push(ajs.jointREPs);
        //         jointSegs.push(ajs.jointREUs);
        //         return jointSegs.map((js, i)=>{
        //             return getJointSegsDrawings(js, i);
        //         });
        //     };
        // }
    },[getJointSegsDrawings]);

    const unselectAllPlanElements = useCallback(() => {
        if(!preventUnselectAllElements){
            PlanElementsHelper.unselectAllElements(planElements);
            dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
            dispatch(setPlanElementSheetData(null));
        }else{
            setPreventUnselectAllElements(false);
        }

    }, [dispatch, planElements, preventUnselectAllElements]);
    
    const handleClick = useCallback(()=>{
        unselectAllPlanElements();
    }, [unselectAllPlanElements]);

    const getPlanElements = () => {
        const selectedElements: PlanElement[] = [];
        const unselectedElements: PlanElement[] = [];

        for(const el of planElements){
            if(el.getSelected()){
                selectedElements.push(el);
            }
            else{
                unselectedElements.push(el);
            }
        }
        return <>
                <Group>
                {
                    unselectedElements.map((el, _) => {
                        return getPlanElement(el)
                    })
                }
                </Group>
                <Group
                    // draggable = {addingPoint()}
                    draggable = {planMode === PlanMode.MovePoint}
                    onDragStart={e => {
                        setDragStartPos(new Position(e.currentTarget.getPosition().x, e.currentTarget.getPosition().y));
                        setPlanElementsAtDragStart(PlanElementsHelper.clone(planElements));
                        // console.log("e.evt.offsetX", e.evt.)
                    }}
                    onDragEnd={e => {
                        if(!dragStartPos) return;
                        const dragDxy = new Position(e.currentTarget.getPosition().x - dragStartPos.x, e.currentTarget.getPosition().y - dragStartPos.y);
                        // for(const el of selectedElements){
                        //     if(!(el.typeName === PlanElementTypeName.Seg)) continue;
                        //     const l = el as Seg;
                        //         for(const p of l.path){
                        //             p.x += dragDxy.x;
                        //             p.y += dragDxy.y;
                        //         }
                        // }

                        const currentPlanElementsClone = planElementsAtDragStart as PlanElement[];
                        const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
                    
                        savePlan(currentPlanElementsClone, nextPlanElementsClone);

                        setDragStartPos(null);
                        setPlanElementsAtDragStart(null);
                        e.currentTarget.setPosition(new Position(0,0));
                    }}
                >
                {
                    selectedElements.map((el, _) => {
                        return getPlanElement(el)
                    })
                }
                </Group>
                {/* {   
                    //property l.addingPointFrom
                    //l.addingPoint ?
                    //<LineAddPoint line={l} position={cursorPosOnPlan}/>
                    addingPointLineIdPointId?
                    <LineAddPoint line={PlanElementsHelper.findElementById(planElements, addingPointLineIdPointId[0]) as Seg} position={planCursorPos}/>
                    :null
                } */}
            </>
    }

    const getPlanElementsNameTexts = useCallback(()=>{
        const editableElements:[PlanElement, SheetDataEditable][] = PlanElementsHelper.getEditableElements(planElements);
        return editableElements.map((editableElement, i) => {            
            return <RefText 
                        key={i}
                        planElement={editableElement[0]}
                        editableElement = {editableElement[1]}
                        setPointingOnSeg= {setPointingOnSeg}
                    />
            }
        )
    
    },[planElements]);


    // function getDistance(p1:{ x: number; y: number; }, p2:{ x: number; y: number; }) {
    //     return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    //   }

    function getCenter(p1:{ x: number; y: number; }, p2:{ x: number; y: number; }) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
    }
    const handlePinchTouchMove = useCallback((touches:Vector2D[])=>{


        // setCounter(counter+1);
        // setMsg(counter.toString());

        // setMsg("touches.length = "+touches.length+", touch2 = "+touch2);


        if (touches && touches.length === 2 && touches[0] && touches[1]) {
            setScaling(true);

            const touch1 = touches[0];
            const touch2 = touches[1];
    
            var p1 = {
                x: touch1.x,
                y: touch1.y,
            };
            var p2 = {
                x: touch2.x,
                y: touch2.y,
            };
    
            // let lastCenterLocalVar = lastCenter;
    
    
            // let lastCenterLocalVar = lastCenter;



            // alert("newCenter x = "+ newCenter.x + ", y = "+ newCenter.y);


            var dist = getDistance(p1, p2);
            let lastDistLocalVar = lastDist;

            if (!lastDistLocalVar) {
                // setLastDist(dist);
                lastDistLocalVar = dist;
            }


            
            const newAppDynamicProps = {... appDynamicProps};

            // same in x & y so either will work
            // let inc = 0.01;
            let oldScale = newAppDynamicProps.planScale;
        
            let zoomBefore = oldScale;
        
            let zoomPoint = getCenter(p1, p2);


        
            var mousePointTo = {
                x: (zoomPoint.x - appDynamicProps.planPosition.x) / oldScale,
                y: (zoomPoint.y - appDynamicProps.planPosition.y) / oldScale
            };
            
            var newScale = appDynamicProps.planScale * (dist/lastDistLocalVar);
            newScale = newScale > SCALE_MAX ? SCALE_MAX : newScale < SCALE_MIN ? SCALE_MIN : newScale;
            
            let zoomAfter = newScale;

            
            newAppDynamicProps.planScale =zoomAfter;

            var newPos = {
                x: zoomPoint.x - mousePointTo.x * zoomAfter,
                y: zoomPoint.y - mousePointTo.y * zoomAfter
            };
        
            newAppDynamicProps.planPosition = newPos;
            dispatch(setAppDynamicProps(newAppDynamicProps));

            setLastDist(dist);

        }
    },[appDynamicProps, dispatch, lastDist]);

    const handlePinchTouchEnd = useCallback(()=>{
        // setMsg("handlePinchTouchMove")
        setLastDist(0);
        setTouches(null);
        setScaling(false);
        // dispatch(updatePlanProps(planProps));
        dispatch(setAppDynamicProps({...appDynamicProps}));
    }, [appDynamicProps, dispatch]);


    const handleOnPointerUp = useCallback(()=>{
        setPointerStartPos(null);

        if(movingSeg){
            saveIfMovingSeg();
        }
        if(pointingOnSeg){
            setPointingOnSeg(false);
            setPreventUnselectAllElements(true);
        }
        // //pointerUp on node but just in in case
        // if(addSegSession){
        //     dispatch(setAddSegSession(null));
        // }

        else if(addSegSession){

            if(magnetData.node){
                addSegSession.jointSegs.joinNodes(addSegSession.draggingNode, magnetData.node);              
              }else if(magnetData.seg){
                addSegSession.jointSegs.joinDraggedNodeAndCreatedNodeOnSeg(addSegSession.draggingNode, magnetData.seg);
              }
              dispatch(setMagnetData({
                  activeOnAxes: magnetData.activeOnAxes, node: null, seg: null,
                  linePoints: null
              }));



            addSegSession.jointSegs.selectSeg(addSegSession.seg.id);
            // dispatch(updatePlanElement(addSegSession.jointSegs));
            if(!planElementsSnapshot) return; //should throw error

            addSegSession.jointSegs.cleanSegs(true);

            
            //if sheetData is opened, cleanSegs may have deleted the seg opened in sheetData, which can cause error
            //so we check if sheetData is opened with seg data, then if this seg still exists, if not, we close sheetData
            // if(sheetData && sheetData.segId){
            //     if(!addSegSession.jointSegs.segs.hasOwnProperty(sheetData.segId)){
            //       dispatch(setPlanElementSheetData(null));
            //     }
            //   }
            // dispatch(setPlanElementSheetData(null));
            const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
            savePlan(planElementsSnapshot, nextPlanElementsClone);
            dispatch(setPlanElementsSnapshot(null));
            
            dispatch(setAddSegSession(null));
            dispatch(setPlanMode(PlanMode.Move));
            dispatch(setSegOnCreationData(null));
            
            setPreventUnselectAllElements(true);
          }else{
            setPreventUnselectAllElements(false);
          }
    }, [addSegSession, dispatch, magnetData.activeOnAxes, magnetData.node, magnetData.seg, movingSeg, planElements, planElementsSnapshot, pointingOnSeg, saveIfMovingSeg, savePlan]);
    

    const getCursorPosWithEventPos = useCallback((e:any, touch:boolean): Position =>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointersPositions()[e.target.getStage()?.getPointersPositions().length-1] : {x:e.evt.offsetX, y:e.evt.offsetY};
        // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
        return new Position((ePos.x - appDynamicProps.planPosition.x) * 1/appDynamicProps.planScale, (ePos.y - appDynamicProps.planPosition.y) * 1/appDynamicProps.planScale);
    
    },[appDynamicProps.planPosition.x, appDynamicProps.planPosition.y, appDynamicProps.planScale]); 

    // const setCursorPosWithEventPos = useCallback((e:any, touch:boolean)=>{
    //     const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
    //     // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
    //     dispatch(setPlanCursorPos(new Vector2D((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale)))
    
    // },[dispatch, planProps.scale]);

    const handleMovingSeg = useCallback((newCursorPos: Position) => {
        if(!movingSeg || !pointerStartPos) return;
        const jointSegsBeforeMoveClone = movingSeg.jointSegs.clone();

        const cursorOffset = new Position(
            newCursorPos.x - pointerStartPos.x,
            newCursorPos.y - pointerStartPos.y
        );
        for(let i=0; i<2; i++){
            movingSeg.segNodes[i].position.x = movingSeg.startingNodesPos[i].x + cursorOffset.x;
            movingSeg.segNodes[i].position.y = movingSeg.startingNodesPos[i].y + cursorOffset.y;
        }

        movingSeg.jointSegs.updateAllNameTextPositionsAndAngles(jointSegsBeforeMoveClone, movingSeg.jointSegs);


        dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
    }, [dispatch, movingSeg, planElements, pointerStartPos]);


    const handleAddSegSessionAndMovingSeg = useCallback((newCursorPos: Position) => {
        if(addSegSession){
            const node = addSegSession.draggingNode;
            
            // if(!magnetData){
            //     node.position = new Position(newCursorPos.x, newCursorPos.y);
            //     dispatch(updatePlanElement(addSegSession.jointSegs));
            //     return;
            // }

            const nodeOrSeg: Seg | SegNode | null = addSegSession.jointSegs.getNodeOrSegPenetratedByPoint(newCursorPos, node);
            // console.log("nodeOrSeg",nodeOrSeg)

            const [movingNodePosWithMagnet, linePoints] = getMovingNodePositionWithMagnet(node, newCursorPos, magnetData);

            const jointSegsBeforeMoveClone = addSegSession.jointSegs.clone();

            // updateNodePosition(movingNodePosWithMagnet);

            node.position = movingNodePosWithMagnet;

            addSegSession.jointSegs.updateAllNameTextPositionsAndAngles(jointSegsBeforeMoveClone, addSegSession.jointSegs);

            // node.position = getMovingNodePositionWithMagnet(node, newCursorPos, magnetData);              
            dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));

            
            dispatch(setMagnetData(
                {
                  activeOnAxes: magnetData.activeOnAxes,
                  node: nodeOrSeg && nodeOrSeg.id.length > 36? null: nodeOrSeg as SegNode, //36 is uuid length, Seg id is 36*2
                  seg: nodeOrSeg && nodeOrSeg.id.length > 36? nodeOrSeg as Seg: null,
                  linePoints
                }
              ))
        }
        else{
            handleMovingSeg(newCursorPos);
        }
    },[addSegSession, dispatch, handleMovingSeg, magnetData, planElements]);

    // const addSegFunc = useCallback((jointSegs:JointSegs, pointerPos: Vector2D, node?:SegNode, seg?:Seg)=>{
    //     addSeg(jointSegs, pointerPos, node, seg);
    // }, [addSeg]);


    return (
        // <div onClick={e =>{console.log("Click on parent")}}>Parent
        //     <div onClick={e =>{console.log("Click on child")}}>Child</div>
        // </div>
        <>
            <Stage
                className={styles['plan']}
                hitOnDragEnabled
                ref={stageRef}
                width={appDynamicProps.planSize.width} 
                height={appDynamicProps.planSize.height}
                position={{x:appDynamicProps.planPosition.x, y:appDynamicProps.planPosition.y}}
                scale={{x:appDynamicProps.planScale, y:appDynamicProps.planScale}}
                // style={{"marginTop":""+PLAN_MARGIN_TOP+"px"}}
                // style={{"width":"inherit", "height":"100vm"}}
                onClick={handleClick}
                // style={{"backgroundColor":"rgb(250, 250, 250)"}}
                // onClick={_ => {
                //     console.log("click on plan")
                //     endAddPointSession();
                //     unselectAllPlanElements(); 
                // }}
                // onMouseUp={_ => {
                //     console.log("mouseup on plan")
                //     endAddPointSession();

                //     unselectAllPlanElements(); 
                // }}
                // onTap={_ => {
                //     unselectAllPlanElements(); 
                //     endAddPointSession();
                // }}
                //onDoubleClick={setPlanScaleCallback}
                //onDblTap={setPlanScaleCallback}
                onPointerDown={e => {
                    // handleDblClick(e, addLineAndSetToAddMode);
                    // alert("currentTarget x = "+e.currentTarget.getPosition().x + ", currentTarget y = "+e.currentTarget.getPosition().y);
                    // setCursorPosWithEventPos(e, false);

                    const newCursorPos = getCursorPosWithEventPos(e, false);
                    dispatch(setPlanCursorPos(newCursorPos));

                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                    // handleAddPoint();

                    setPointerStartPos(newCursorPos);




                    //ADD SEG:
                    if(planMode === PlanMode.AddSeg){
                        //TODO : here addSeg means addWall but there are also other segs
                        addSeg(newCursorPos);
                        // dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));
                        // const jw = PlanElementsHelper.getAllJointSegs(planElements).jointWalls;
                        // const [addedSeg, endingNode] = jw.addSegFromVoid(newCursorPos, newCursorPos);
                        // dispatch(setAddSegSession(
                        //     new AddSegSession(
                        //         jw,
                        //         addedSeg,
                        //         endingNode 
                        //     )
                        // ));
    
                        // // if(!sheetData) return; //should throw error
                        // // addedSeg.numero = sheetData.numero;
                        // if(!segOnCreationData) return; //should throw error
                        // addedSeg.numero = segOnCreationData.numero;

                        // dispatch(updatePlanElement(PlanElementsHelper.getAllJointSegs(planElements)));
                        
                        // // const newSheetData:PlanElementSheetData = {
                        // //     planElementId: PlanElementsHelper.getAllJointSegs(planElements).id,
                        // //     segId:addedSeg.id, 
                        // //     typeName:sheetData.typeName, 
                        // //     numero:sheetData.numero
                        // // };
                        // // dispatch(setPlanElementSheetData(newSheetData));
                    }

                }}
                // onTouchStart={e => {
                //     // handleDblClick(e, addLineAndSetToAddMode);
                //     // var touchPos = e.target.getStage()?.getPointerPosition();
                //     // if(!touchPos) return;
                //     // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                //     setCursorPosWithEventPos(e, true);
                //     handleAddPoint();
                // }}
                onPointerUp={handleOnPointerUp}
                onMouseMove={e => { //and not onPointerMove to make it work only on desktop and avoid duplicate with onTouchMove needed here for pinch

                    const newCursorPos = getCursorPosWithEventPos(e, false);
                    // dispatch(setPlanCursorPos(newCursorPos));

                    handleAddSegSessionAndMovingSeg(newCursorPos);
                }}
                onTouchMove={e => {
                    // var touchPos = e.target.getStage()?.getPointerPosition();
                    // if(!touchPos) return;
                    // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                    if(e.target.getStage()?.getPointersPositions().length===1){
                        const newCursorPos = getCursorPosWithEventPos(e, true);
                        dispatch(setPlanCursorPos(newCursorPos));
                        handleAddSegSessionAndMovingSeg(newCursorPos);
                    }
                    

                    e.evt.preventDefault(); //for pinch
                    // setTouches(e.evt.touches);
                    // const stagePointerPos = e.currentTarget.getStage()!.getPointerPosition();
                    // if(stagePointerPos){
                    //     handlePinchTouchMove(stagePointerPos);
                    // }

                    dispatch(setUnselectAllOnPlanMouseUp(false));


                    // const stagePointerPos = e.currentTarget.getStage()!.getPointerPosition();


                    // const stage = e.target.getStage();
                    // const touchList = Array.from(e.evt.changedTouches);
      
                    // const pointerPositions = touchList.map((touch) => {
                    //     const id = touch.identifier;
                    //     const position = stage!.getPointerPosition() as { x: number; y: number };
                    //     return { id, ...position };
                    //   });
                    // setTouches(pointerPositions);
                    if(!pointingOnSeg){
                        handlePinchTouchMove(e.target.getStage()!.getPointersPositions());
                    }

                    // setMsg(""+touches.length);
                }}
                onTouchEnd={e => {
                    if(e.evt.touches.length === 0){
                        handlePinchTouchEnd(); 
                    }

                }}
                // onMouseUp={handleMouseUp}
                draggable = {!scaling && !pointingOnSeg && !addingPointLineIdPointId && !addSegSession} //&& planMode !== PlanMode.AddPoint}
                onDragStart={e => {
                    e.cancelBubble = true;
                    dispatch(setPlanIsDragging(true));
                    // dispatch(setUnselectAllOnPlanMouseUp(false));
                } }
                onDragMove={e => {
                    e.cancelBubble = true;

                    // dispatch(setUnselectAllOnPlanMouseUp(false));

                    appDynamicProps.planPosition = {
                        x:e.target.getPosition().x,
                        y:e.target.getPosition().y
                    };
                    // stageRef.current.setPosition({x:1000, y:1000});
                    
                    // console.log("stageRef.current.getPosition()",  stageRef.current.getPosition())
                    dispatch(setAppDynamicProps({...appDynamicProps}));

                } }
                onDragEnd={e => {
                    e.cancelBubble = true;

                    dispatch(setPlanIsDragging(false));
                    // appDynamicProps.planPosition = {
                    //     x:stageRef.current.getPosition().x / appDynamicProps.planScale, 
                    //     y:stageRef.current.getPosition().y / appDynamicProps.planScale
                    // };
                    // // stageRef.current.setPosition({x:1000, y:1000});
                    
                    // console.log("stageRef.current.getPosition()",  stageRef.current.getPosition())
                    // dispatch(setAppDynamicProps({...appDynamicProps}));
                    // dispatch(setUnselectAllOnPlanMouseUp(true));
                }}
                >
                <Layer>
                {/* <Group key={123}>
                <Rect
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    fill="blue"
                    onClick={e =>{console.log("Click on child")}}
                />
                </Group> */}
                {
                    getPlanElements()
                    // PlanElementsHelper.planElementsSeparatedBySelection(planElements).map((planElements, _) => {
                    //     return getPlanElement(el);
                    // })
                }
                {
                    getPlanElementsNameTexts()
                }
                {                 

                    testPoints.map((p, _) => {
                        return(
                            <Group
                            key={p.id}
                            >
                                <Circle
                                    radius = {5}
                                    x = {p.x}
                                    y = {p.y}
                                    fill={p.color}
                                    stroke="black"
                                    strokeWidth={0}
                                />
                                <Text
                                    text={p.id}
                                    x = {p.x}
                                    y = {p.y}
                                />
                            </Group>
                        );
                    })
                }
                </Layer>
            </Stage>
            {planMode === PlanMode.Export?
            <div className={styles['to-export-wrapper']}>
                <Stage
                className={styles['plan']}
                ref={stageToExportRef}
                offsetX={allElementsWrapperCoordSize.x1}
                offsetY={allElementsWrapperCoordSize.y1}
                width={Math.abs(allElementsWrapperCoordSize.x2 - allElementsWrapperCoordSize.x1)} 
                height={Math.abs(allElementsWrapperCoordSize.y2 - allElementsWrapperCoordSize.y1)}
                // position={{x:0, y:0}}
                // position={{x:500, y:545}}

                // position={appDynamicProps.planPosition}
                // scale={{x:appDynamicProps.planScale, y:appDynamicProps.planScale}}
                listening={false}
                >
                    <Layer>
                        <Rect
                            x={allElementsWrapperCoordSize.x1}
                            y={allElementsWrapperCoordSize.y1}
                            fill={NON_DAZZLING_WHITE}
                            width={Math.abs(allElementsWrapperCoordSize.x2 - allElementsWrapperCoordSize.x1)} 
                            height={Math.abs(allElementsWrapperCoordSize.y2 - allElementsWrapperCoordSize.y1)}
                        />
                        {
                            getPlanElements()
                            // PlanElementsHelper.planElementsSeparatedBySelection(planElements).map((planElements, _) => {
                            //     return getPlanElement(el);
                            // })
                        }
                        {
                            getPlanElementsNameTexts()
                        }

                    </Layer>
                </Stage>
            </div>
            :null
            }
        {/* <div style={{"position":"absolute"}}>{msg}</div> */}
        </>

    )
};

export default Plan;


// const getNewPlanDimWithMinOffsets = (planElements:PlanElement[], planDim:[number, number], initialPlanDim:[number, number]):[number, number] => {
//     const offsets = getPlanElementMinOffsets(planElements, planDim);

//     for(let i=0; i<4; i++){
//         switch(i){
//             case 0:
//                 let leftOffset = offsets[i];
//                 if(leftOffset < 0)
//             break;
//         }
//     }


//     const newPlanDim = [planDim[0] + planElementMinOffsets, 
// }

// const getPlanElementMinOffsets = (planElements:{[key:string]: PlanElement}, planDim:Dimensions): Offsets => {
//     let maxLeft = 0;
//     let maxRight = 0;
//     let maxTop = 0;
//     let maxBottom = 0;

//     for(const elId in planElements){
//         const el = planElements[elId];
//         switch(el.typeName){
//             case("Rectangle"): {
//                 const r = el as Rectangle;
//                 const rLeft = r.getX1();
//                 if(rLeft <= maxLeft){
//                     maxLeft = rLeft;
//                 }
//                 const rTop = r.getY1();
//                 if(rTop <= maxTop){
//                     maxTop = rTop;
//                 }
//                 const rRight = r.getX2();
//                 if(rRight >= maxRight){
//                     maxRight = rRight;
//                 }
//                 const rBottom = r.getY2();
//                 if(rBottom >= maxBottom){
//                     maxBottom = rBottom;
//                 }
//                 break;
//             }
//         }
//     }

//     const planPadding = 100;
//     const planW = planDim.w;
//     const planH = planDim.h;
//     const newPlanDim = new Dimensions(0,0);
//     if(maxLeft - planPadding <= 0){
//         const shift = maxLeft - planPadding;
//         newPlanDim.w += -shift;
//         //to do : move elements to the right by shift
//     }
//     else {
//         const shift = maxLeft - planPadding;
//         newPlanDim.w += shift;
//     }



//     return new Offsets(leftOffset, rightOffset, topOffset, bottomOffset);
// }




