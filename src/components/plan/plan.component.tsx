import { Group, Layer, Path, Rect, Shape, Stage, Line as KonvaLine, Circle, Text } from "react-konva";
import styles from './plan.module.scss';
import { v4 } from 'uuid';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Wall, PlanMode, PlanElement, PlanElementTypeName, PlanProps, Point, Position, Rectangle, Vector2D, DblClick, PlanElementsRecordsHandler, PlanElementsHelper, PlanPointerUpActionsHandler, Line, JoinedWalls, TestPoint, WallNode, AddWallSession, MagnetData, PlanElementSheetData } from "@/entities";
import { cloneArray, getMovingNodePositionWithMagnet, objToArr } from "@/utils";
import LinePoint from "../line-point/line-point.component";
import { useDispatch, useSelector } from "react-redux";
import { addPlanElement, setAddWallSession, setAddingPointLineIdPointId, setLineToAdd, setMagnetData, setPlanCursorPos, setPlanElementSheetData, setPlanElements, setPlanElementsRecords, setPlanElementsSnapshot, setPlanIsDragging, setPlanMode, setPlanPointerUpActionsHandler, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement, updatePlanProps } from "@/redux/plan/plan.actions";
import { selectAddWallSession, selectAddingPointLineIdPointId, selectLineToAdd, selectMagnetData, selectPlanCursorPos, selectPlanElementSheetData, selectPlanElements, selectPlanElementsRecords, selectPlanElementsSnapshot, selectPlanIsDragging, selectPlanMode, selectPlanPointerUpActionsHandler, selectPlanProps, selectSelectingPlanElement, selectTestPoints, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import LineAddPoint from "../line-add-point/line-add-point.component";
import { LEFT_MENU_WIDTH, PLAN_HEIGHT_SCREEN_RATIO, PLAN_HORIZONTAL_MARGIN, PLAN_MARGIN_BOTTOM, PLAN_MARGIN_TOP, PLAN_VERTICAL_MARGIN, PLAN_WIDTH_SCREEN_RATIO, TOP_MENU_HEIGHT } from "@/global";
import { useAddPoint } from "@/custom-hooks/use-add-point.hook";
import { useRemLine } from "@/custom-hooks/use-rem-line.hook";
import { useSavePlan } from "@/custom-hooks/use-save-plan.hook";
import WallNodeComponent from "../wall-node/wall-node.component";
import WallComponent from "../wall-component/wall-component.component";


export interface JoinedWallsAndWallNodes{
    joinedWalls:JoinedWalls,
    wallNodes: [WallNode, WallNode],
    startingNodesPos: [Position, Position]
}

const Plan: React.FC = () => {
    const minPlanDim: Dimensions = new Dimensions(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const [planDim, setPlanDim] = useState<Dimensions>(minPlanDim);
    // const [planScale, setPlanScale] = useState<number>(1);
    const [planPos, setPlanPos] = useState<Point>(new Point(v4(), 0,0));
    const [cursorPos, setCursorPos] = useState<Point>(new Point(v4(), 0,0));
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);

    const planProps:PlanProps = useSelector(selectPlanProps);
    const planMode: PlanMode = useSelector(selectPlanMode);

    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);

    const selectingPlanElement = useSelector(selectSelectingPlanElement);
    const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
    const lineToAdd:Line | null = useSelector(selectLineToAdd);
    const [dragging, setDragging] = useState<boolean>(false);
    const planIsDragging:boolean = useSelector(selectPlanIsDragging);
    const [scaling, setScaling] = useState<boolean>(false);
    const scaleMax = 2;
    const scaleMin = 1/9;

    const stageRef = useRef<any>();

    // const [stageScale, setStageScale] = useState<{ x: number; y: number; }>({x:1, y:1});
    // const [stagePosition, setStagePosition] = useState<{ x: number; y: number; }>({x:1, y:1});

    const [lastCenter, setLastCenter] = useState<{ x: number; y: number; } | null>(null);
    const [lastDist, setLastDist] = useState<number>(0);


    const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
    const [pointerStartPos, setPointerStartPos] = useState<Position | null>(null);
    // const [dragDxy, setDragDxy] = useState<Vector2D>(new Vector2D(0,0));

    const [msg, setMsg] = useState("");

    const dispatch = useDispatch();
    const planPointerUpActionsHandler: PlanPointerUpActionsHandler = useSelector(selectPlanPointerUpActionsHandler);
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);

    const [planElementsAtDragStart, setPlanElementsAtDragStart] = useState<PlanElement[] | null>(null);

    const [movingWall, setMovingWall] = useState<JoinedWallsAndWallNodes | null>(null);
    const [pointingOnWall, setPointingOnWall] = useState<boolean>(false);


    const addPoint = useAddPoint();
    const savePlan = useSavePlan();
    const removeLineIfNoPoints = useRemLine();
    const testPoints: TestPoint[] = useSelector(selectTestPoints);
    const [preventUnselectAllElements, setPreventUnselectAllElements] = useState<boolean>(false);
    const addWallSession: AddWallSession | null = useSelector(selectAddWallSession);
    const magnetData: MagnetData = useSelector(selectMagnetData);
    const planElementsSnapshot: PlanElement[] | null = useSelector(selectPlanElementsSnapshot);
    const sheetData: PlanElementSheetData | null = useSelector(selectPlanElementSheetData);


    // const [preventPointerUpOnPlan, setPreventPointerUpOnPlan] = useState<boolean>(false);

    // const [dblCick, setDblClick] = useState<DblClick>(new DblClick());

    // const [msg, setMsg] = useState("");
    // const [counter, setCounter] = useState(0);

    // const [draggable, setDraggable] = useState<boolean>(true);
    
    const dblClick: DblClick = useMemo(() =>{
        return new DblClick();
    }, []);

    const addLineAndSetToAddMode = useCallback((e:any) => {
        if(planMode != PlanMode.AddPlanElement || !lineToAdd) return;

        const pX = planCursorPos.x;
        const pY = planCursorPos.y;
    
        const newLine: Line = lineToAdd;
        lineToAdd.path.push(new Point(v4(), pX, pY));

        const firstPointId = newLine.path[0].id;
        newLine.setSelected(true);
        newLine.selectPointId(firstPointId);

        dispatch(addPlanElement(newLine));

        // newLine.startAddPointSession(firstPointId);
        // newLine.pointIdCursorIsOver = firstPointId;
        // const planElementsClone = PlanElementsHelper.clone(planElements);
        // planElementsClone.push(newLine);
        // savePlan(planElementsClone);



        // console.log("--> newLine.path.length", newLine.path.length);
        dispatch(setPlanMode(PlanMode.AddPoint));
        dispatch(setAddingPointLineIdPointId([newLine.id, firstPointId]));
        dispatch(setLineToAdd(null));
        // dispatch(setUnselectAllOnPlanMouseUp(false));

    }, [planMode, planCursorPos.x, planCursorPos.y, lineToAdd, dispatch]);

    const handleDblClick = useCallback((e:any, f:any) =>{
        if(dblClick.click === 0){
            dblClick.start();
        }else{
            dblClick.end();
            f(e);
        }
    }, [dblClick]);    


    // useEffect(()=>{    
    //     if(!planWrapperRef) return;
    
    //     // dispatch(setPlanStateSpace( 
    //     //   new StateSpace(
    //     //     screenSize[0] * KONVA_WIDTH_SCALE, 
    //     //     screenSize[1] * KONVA_HEIGHT_SCALE, 
    //     //     planWrapperRef.getBoundingClientRect().left, 
    //     //     planWrapperRef.getBoundingClientRect().top,
    //     //   )
    //     // ));

    //     const newPlanProps = new PlanProps();
    //     console.log("planWrapperRef.getBoundingClientRect().width", planWrapperRef.getBoundingClientRect().width);
    //     console.log("planWrapperRef.getBoundingClientRect().height", planWrapperRef.getBoundingClientRect().height);

    //     newPlanProps.dimensions = new Dimensions(planWrapperRef.getBoundingClientRect().width, planWrapperRef.getBoundingClientRect().height);
    //     dispatch(updatePlanProps(newPlanProps));

    //   },[dispatch, planWrapperRef])

    useEffect(()=>{
        const handleResize = ()=>{
            console.log("resize")
            const newPlanProps = new PlanProps();
            // newPlanProps.dimensions = new Dimensions(planWrapperRef.getBoundingClientRect().width, planWrapperRef.getBoundingClientRect().height);

            newPlanProps.dimensions = new Dimensions(window.innerWidth - LEFT_MENU_WIDTH, window.innerHeight - TOP_MENU_HEIGHT);
            dispatch(updatePlanProps(newPlanProps));
        }
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
        
    },[dispatch]);

    
    // useEffect(()=>{
    //     console.log("planElements.length", planElements.length);
    // },[planElements]);

    // const setPlanScaleCallback = useCallback(()=> {
    //     setPlanScale(planScale+0.5);
    // },[planScale]);

    const selectPlanElement = useCallback((el:PlanElement)=>{
        el.setSelected(true);
        dispatch(updatePlanElement(el));
    }, [dispatch]);

    const moveUpPlanElement = useCallback((el:PlanElement)=>{
        const newPlanElements = planElements.slice();
        const planElement = newPlanElements.find(iterEl => iterEl.id === el.id);
        if(!planElement) return;
        const index = planElements.indexOf(planElement);
        newPlanElements.splice(index, 1);
        newPlanElements.push(planElement);
        dispatch(setPlanElements(newPlanElements));
    }, [dispatch, planElements]);

    const toggleSelectPlanElement = useCallback((el:PlanElement)=>{
        el.setSelected(!el.getSelected());
        dispatch(updatePlanElement(el));
    }, [dispatch]); 

    const saveIfMovingWall = useCallback(()=>{
        const MIN_SHIFT_TO_ALLOW_SAVE = 1;
        if(movingWall){
            const d = Math.sqrt(Math.pow((movingWall.wallNodes[0].position.x - movingWall.startingNodesPos[0].x), 2) + Math.pow((movingWall.wallNodes[0].position.y - movingWall.startingNodesPos[0].y), 2));
            if(d>MIN_SHIFT_TO_ALLOW_SAVE)
            {
                const currentPlanElementsClone = PlanElementsHelper.clone(planElements);
                const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
                const jwIdx = PlanElementsHelper.findElementIndexById(currentPlanElementsClone, movingWall.joinedWalls.id);
                currentPlanElementsClone[jwIdx] = movingWall.joinedWalls.clone();
                savePlan(currentPlanElementsClone, nextPlanElementsClone);
            }
            setMovingWall(null);
        }
    },[movingWall, planElements, savePlan]);

    const getPlanElement = useCallback((el:PlanElement)=> {
        switch(el.typeName){
            // case(PlanElementTypeName.Wall): {
            //     const l = el as Wall;
            //     const path = l.path;
            //     // return <Path
            //     //     key={el.id}
            //     //     x= {50}
            //     //     y= {40}
            //     //     data= 'M213.1,6.7c-32.4-14.4-73.7,0-88.1,30.6C110.6,4.9,67.5-9.5,36.9,6.7C2.8,22.9-13.4,62.4,13.5,110.9C33.3,145.1,67.5,170.3,125,217c59.3-46.7,93.5-71.9,111.5-106.1C263.4,64.2,247.2,22.9,213.1,6.7z'
            //     //     fill= 'green'
            //     //     scaleX= {0.5}
            //     //     scaleY= {0.5}
            //     // />
            //     return  (
            //         <Group key={l.id}>
            //         <Path
            //             data= {
            //                 (():string => {
            //                     let s:string = "";
            //                     s += "M";
            //                     for(const point of path){
            //                         s += " " + point.x + " " + point.y + " ";
            //                     }
            //                     s += l.pathIsClose ? "Z":"";
            //                     return s
            //                 })()
            //             }
            //             fillEnabled = {false}
            //             stroke="grey"
            //             // dash={[33, 10]}
            //             strokeWidth={l.width}
            //             onClick={e => {
            //                 e.cancelBubble = true;
            //                 console.log("selectPlanElement");
            //                 toggleSelectPlanElement(el);
            //                 moveUpPlanElement(el);
            //             }}
            //             onTap={_ => {
            //                 console.log("selectPlanElement");
            //                 toggleSelectPlanElement(el);
            //                 moveUpPlanElement(el);
            //             }}
            //         />
            //         {                    
            //             path.map((p, _) => {
            //                 return <LinePoint key={p.id} line={l} id={p.id} position={p as Position} selected={l.selectedPointId === p.id && !planIsDragging && !scaling}/>
            //             })
            //         }
            //         </Group>
            //     );
            // };
            case(PlanElementTypeName.JoinedWalls): {
                const w = el as JoinedWalls;
                w.setWalls();
                w.setWallsPoints();
                const colorsForTesting = ["green","orange","blue","violet"];

                // console.log("pointsBySegment.length", pointsBySegment.length)

                // const nodesPos = nodes.map(node => node.position);
                // return <Path
                //     key={el.id}
                //     x= {50}
                //     y= {40}
                //     data= 'M213.1,6.7c-32.4-14.4-73.7,0-88.1,30.6C110.6,4.9,67.5-9.5,36.9,6.7C2.8,22.9-13.4,62.4,13.5,110.9C33.3,145.1,67.5,170.3,125,217c59.3-46.7,93.5-71.9,111.5-106.1C263.4,64.2,247.2,22.9,213.1,6.7z'
                //     fill= 'green'
                //     scaleX= {0.5}
                //     scaleY= {0.5}
                // />
                return  (
                    <Group key={w.id}>
                    {    
                        objToArr(w.walls).map((wall:Wall, _) => {
                            const wallIsSelected = w.wallIsSelected(wall.id);
                            return <WallComponent 
                                key={v4()}
                                id={wall.id}
                                wall={wall}
                                numero={wall.numero}
                                w={w}
                                points={wall.points}
                                wallIsSelected={wallIsSelected}
                                nodes={wall.nodes}
                                pointerStartPos={pointerStartPos}
                                movingWall={movingWall} 
                                setMovingWall={setMovingWall}
                                setPointingOnWall= {setPointingOnWall}
                                />
                        })
                    }
                    {
                        magnetData.wall?
                        <Path
                            stroke="green"
                            strokeWidth={1}
                            dash={[10, 5]}
                            dashEnabled={true}
                            listening={false}
                            data={"M"+magnetData.wall.nodes[0].position.x.toString()+" "+
                                magnetData.wall.nodes[0].position.y.toString()+" "+
                                magnetData.wall.nodes[1].position.x.toString()+" "+
                                magnetData.wall.nodes[1].position.y.toString()}
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
                        Object.values(w.nodes).map((node, _) => {
                            return (
                                <WallNodeComponent
                                    key={node.id}
                                    node={node}
                                    joinedWalls={w}
                                    pointingOnWall= {pointingOnWall}
                                />
                            );
                        })
                    }
                    {/* {
                        w.farthestNodes?.map((node, _) => {
                            return(
                                <Group
                                key={node.id}
                                >
                                    <Circle
                                        radius = {5}
                                        x = {node.position.x}
                                        y = {node.position.y}
                                        fill={"red"}
                                        stroke="black"
                                        strokeWidth={0}
                                    />
                                </Group>
                            );
                        })
                    } */}
                    </Group>
                );
            };
            // default: {
            //     const r = el as Rectangle;
            //     return(
            //         <Rect
            //             key={el.id}
            //             x={r.getX()}
            //             y={r.getY()}
            //             width={r.getW()}
            //             height={r.getH()}
            //             fill="blue"
            //             draggable
            //             onDragEnd={e => {
            //                 r.setPos(e.target.getPosition().x, e.target.getPosition().y)

            //                 // console.log("r.x = ",r.x)
            //                 // const rindex = planElements.findIndex((value) => value.id === el.id);
            //                 // (planElements[rindex] as Rectangle).x = r.x;
            //                 // (planElements[rindex] as Rectangle).x1 = r.x;
            //                 const newPlanElements = {...planElements};
            //                 setPlanElements(newPlanElements);
            //             }}
            //         />
            //     )
            // }
        }
    },[magnetData.wall, magnetData.linePoints, pointerStartPos, movingWall, pointingOnWall]);

    const unselectAllPlanElements = useCallback(() => {
        //doesnt work well on desktop:
        // const planElementsCopy = PlanElementsHelper.clone(planElements);
        // for(const el of planElementsCopy){
        //     el.unselect();
        // }
        if(!preventUnselectAllElements){
            PlanElementsHelper.unselectAllElements(planElements);
            dispatch(setPlanElements(PlanElementsHelper.clone(planElements)));
            dispatch(setPlanElementSheetData(null));
        }else{
            setPreventUnselectAllElements(false);
        }


        // if(!preventPointerUpOnPlan){
        //     const planElementsCopy = PlanElementsHelper.clone(planElements);
        //     for(const el of planElementsCopy){
        //         el.unselect();
        //     }
        //     dispatch(setPlanElements(planElementsCopy));
        // }else{
        //     setPreventPointerUpOnPlan(false);
        //     console.log("unselectAllPlanElements OK NOW FALSE")

        // }

    }, [dispatch, planElements, preventUnselectAllElements]);
    
    const handleClick = useCallback(()=>{
        // if(!preventUnselectAllElements){
        //     unselectAllPlanElements();
        // }else{
        //     setPreventUnselectAllElements(false);
        // }
        unselectAllPlanElements();
    }, [unselectAllPlanElements]);

    const getPlanElements = () => {
        // const planElementsSBS: [PlanElement[], PlanElement[]] = [[], []];
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
                        //     if(!(el.typeName === PlanElementTypeName.Wall)) continue;
                        //     const l = el as Wall;
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
                    <LineAddPoint line={PlanElementsHelper.findElementById(planElements, addingPointLineIdPointId[0]) as Wall} position={planCursorPos}/>
                    :null
                } */}
            </>
    }


    function getDistance(p1:{ x: number; y: number; }, p2:{ x: number; y: number; }) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      }

    function getCenter(p1:{ x: number; y: number; }, p2:{ x: number; y: number; }) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
    }
    const handlePinchTouchMove = useCallback((touches:TouchList)=>{
        // setMsg("")

        var touch1 = touches[0];
        var touch2 = touches[1];

        // setCounter(counter+1);
        // setMsg(counter.toString());

        // setMsg("touches.length = "+touches.length+", touch2 = "+touch2);

        if (touch1 && touch2) {
          setScaling(true);

          //if were adding a point while scaling, cancel adding
          if(addingPointLineIdPointId){
            const lineIndex = PlanElementsHelper.findElementIndexById(planElements, addingPointLineIdPointId[0]);
            if(lineIndex > -1){
                // const line = planElements[lineIndex] as Wall;
                // // removeLineIfNoPoints(lineIndex)
                // if(line.path.length < 2){ //if line has only one point we remove the line
                //     const clone = PlanElementsHelper.clone(planElements);
                //     clone.splice(lineIndex, 1);
                //     dispatch(setPlanElements(clone));
                // }
            }
            dispatch(setAddingPointLineIdPointId(null));
          }

          // if the stage was under Konva's drag&drop
          // we need to stop it, and implement our own pan logic with two pointers
          let stage = stageRef.current;
          if(!stage) return;

          // if (stage.isDragging()) {
          //   // stage.stopDrag();
          //   setDraggable(false);
          //   setMsg(msg+" and draggable false");

          // }

          var p1 = {
            x: touch1.clientX,
            y: touch1.clientY,
          };
          var p2 = {
            x: touch2.clientX,
            y: touch2.clientY,
          };

          let lastCenterLocalVar = lastCenter;

          if (!lastCenterLocalVar) {
            setLastCenter(getCenter(p1, p2));
            return;
          }
          var newCenter = getCenter(p1, p2);

          // alert("newCenter x = "+ newCenter.x + ", y = "+ newCenter.y);


          var dist = getDistance(p1, p2);
          let lastDistLocalVar = lastDist;

          if (!lastDistLocalVar) {
            // setLastDist(dist);
            lastDistLocalVar = dist;
          }

          // local coordinates of center point
          var pointTo = {
            x: (newCenter.x - stage.x()) / stage.scaleX(),
            y: (newCenter.y - stage.y()) / stage.scaleX(),
          };

          var scale = stage.scaleX() * (dist / lastDistLocalVar);
          scale = scale > scaleMax ? scaleMax : scale < scaleMin ? scaleMin : scale;

          planProps.scale = scale;
        //   stage.scaleX(scale);
        //   stage.scaleY(scale);

        //   calculate new position of the stage
          var dx = newCenter.x - lastCenterLocalVar.x;
          var dy = newCenter.y - lastCenterLocalVar.y;

          var newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
          };

          planProps.position = newPos;
        //   dispatch(updatePlanProps(planProps));
        //   setStagePosition(newPos);

          //stage.position(newPos);
          setLastDist(dist);
          setLastCenter(newCenter);
        //   setMsg("scale = "+ scale);

        }
    },[addingPointLineIdPointId, dispatch, lastCenter, lastDist, planElements, planProps, scaleMin]);

    const handlePinchTouchEnd = useCallback(()=>{
        // setMsg("handlePinchTouchMove")
        setScaling(false);
        setLastDist(0);
        setLastCenter(null);
        dispatch(updatePlanProps(planProps));
    }, [dispatch, planProps]);


    const handleOnPointerUp = useCallback(()=>{
        if(addingPointLineIdPointId){
            addPoint(null);
        }
        setPointerStartPos(null);
        if(movingWall){
            (planElements[0] as JoinedWalls).cleanWalls();
            saveIfMovingWall();
        }
        if(pointingOnWall){
            setPointingOnWall(false);
            setPreventUnselectAllElements(true);
        }
        // //pointerUp on node but just in in case
        // if(addWallSession){
        //     dispatch(setAddWallSession(null));
        // }

        else if(addWallSession){

            if(magnetData.node){
                addWallSession.joinedWalls.joinNodes(addWallSession.draggingNode, magnetData.node);              
              }else if(magnetData.wall){
                addWallSession.joinedWalls.joinDraggedNodeAndCreatedNodeOnWall(addWallSession.draggingNode, magnetData.wall);
              }
              dispatch(setMagnetData({
                  activeOnAxes: magnetData.activeOnAxes, node: null, wall: null,
                  linePoints: null
              }));



            addWallSession.joinedWalls.selectWall(addWallSession.wall.id);
            // dispatch(updatePlanElement(addWallSession.joinedWalls));
            if(!planElementsSnapshot) return; //should throw error

            (planElements[0] as JoinedWalls).cleanWalls();
            //if sheetData is opened, cleanWalls may have deleted the wall opened in sheetData, which can cause error
            //so we check if sheetData is opened with wall data, then if this wall still exists, if not, we close sheetData
            if(sheetData && sheetData.wallId){
                if(!(planElements[0] as JoinedWalls).walls.hasOwnProperty(sheetData.wallId)){
                  dispatch(setPlanElementSheetData(null));
                }
              }
              
            const nextPlanElementsClone = PlanElementsHelper.clone(planElements);
            savePlan(planElementsSnapshot, nextPlanElementsClone);
            dispatch(setPlanElementsSnapshot(null));
            
            dispatch(setAddWallSession(null));
            dispatch(setPlanMode(PlanMode.Move));
            setPreventUnselectAllElements(true);
          }else{
            setPreventUnselectAllElements(false);
          }
    }, [addPoint, addWallSession, addingPointLineIdPointId, dispatch, magnetData.activeOnAxes, magnetData.node, magnetData.wall, movingWall, planElements, planElementsSnapshot, pointingOnWall, saveIfMovingWall, savePlan, sheetData]);
    

    const getCursorPosWithEventPos = useCallback((e:any, touch:boolean): Position =>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
        // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
        return new Position((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale);
    
    },[planProps.scale]); 

    // const setCursorPosWithEventPos = useCallback((e:any, touch:boolean)=>{
    //     const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
    //     // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
    //     dispatch(setPlanCursorPos(new Vector2D((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale)))
    
    // },[dispatch, planProps.scale]);

    const handleMovingWall = useCallback((newCursorPos: Position) => {
        if(!movingWall || !pointerStartPos) return;
        const cursorOffset = new Position(
            newCursorPos.x - pointerStartPos.x,
            newCursorPos.y - pointerStartPos.y
        );
        for(let i=0; i<2; i++){
            movingWall.wallNodes[i].position.x = movingWall.startingNodesPos[i].x + cursorOffset.x;
            movingWall.wallNodes[i].position.y = movingWall.startingNodesPos[i].y + cursorOffset.y;
        }
        dispatch(updatePlanElement(movingWall.joinedWalls));
    }, [dispatch, movingWall, pointerStartPos]);


    const handleAddWallSessionAndMovingWall = useCallback((newCursorPos: Position) => {
        if(addWallSession){
            const node = addWallSession.draggingNode;
            
            // if(!magnetData){
            //     node.position = new Position(newCursorPos.x, newCursorPos.y);
            //     dispatch(updatePlanElement(addWallSession.joinedWalls));
            //     return;
            // }

            const nodeOrWall: Wall | WallNode | null = addWallSession.joinedWalls.getNodeOrWallPenetratedByPoint(newCursorPos, node);
            // console.log("nodeOrWall",nodeOrWall)

            const [movingNodePosWithMagnet, linePoints] = getMovingNodePositionWithMagnet(node, newCursorPos, magnetData);

            // updateNodePosition(movingNodePosWithMagnet);

            dispatch(setMagnetData(
              {
                activeOnAxes: magnetData.activeOnAxes,
                node: nodeOrWall && nodeOrWall.id.length > 36? null: nodeOrWall as WallNode, //36 is uuid length, Wall id is 36*2
                wall: nodeOrWall && nodeOrWall.id.length > 36? nodeOrWall as Wall: null,
                linePoints
              }
            ))

            node.position = movingNodePosWithMagnet;

            // node.position = getMovingNodePositionWithMagnet(node, newCursorPos, magnetData);              
            dispatch(updatePlanElement(addWallSession.joinedWalls));
        }
        else{
            handleMovingWall(newCursorPos);
        }
    },[addWallSession, dispatch, handleMovingWall, magnetData])

    return (
        // <div onClick={e =>{console.log("Click on parent")}}>Parent
        //     <div onClick={e =>{console.log("Click on child")}}>Child</div>
        // </div>
        <>
            <Stage
                className={styles['plan']}
                hitOnDragEnabled
                ref={stageRef}
                width={planProps.dimensions.w} 
                height={planProps.dimensions.h}
                position={planProps.position}
                scale={{x:planProps.scale, y:planProps.scale}}
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
                    handleDblClick(e, addLineAndSetToAddMode);
                    // alert("currentTarget x = "+e.currentTarget.getPosition().x + ", currentTarget y = "+e.currentTarget.getPosition().y);
                    // setCursorPosWithEventPos(e, false);
                    const newCursorPos = getCursorPosWithEventPos(e, false);
                    dispatch(setPlanCursorPos(newCursorPos));

                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                    // handleAddPoint();

                    setPointerStartPos(newCursorPos);




                    //ADD POINT:
                    if(planMode === PlanMode.AddWall){
                        dispatch(setPlanElementsSnapshot(PlanElementsHelper.clone(planElements)));
                        const jw = planElements[0] as JoinedWalls;
                        const [addedWall, endingNode] = jw.addWallFromVoid(newCursorPos, newCursorPos);
                        dispatch(setAddWallSession(
                            new AddWallSession(
                                jw,
                                addedWall,
                                endingNode 
                            )
                        ));
    
                        if(!sheetData) return; //should throw error
                        addedWall.numero = sheetData.numero;
                        dispatch(updatePlanElement(jw));
                        
                        const newSheetData:PlanElementSheetData = {
                            planElementId: jw.id, 
                            wallId:addedWall.id, 
                            typeName:sheetData.typeName, 
                            numero:sheetData.numero
                        };
                        dispatch(setPlanElementSheetData(newSheetData));
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

                    handleAddWallSessionAndMovingWall(newCursorPos);
                }}
                onTouchMove={e => {
                    // var touchPos = e.target.getStage()?.getPointerPosition();
                    // if(!touchPos) return;
                    // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                    const newCursorPos = getCursorPosWithEventPos(e, true);
                    dispatch(setPlanCursorPos(newCursorPos));
                    handleAddWallSessionAndMovingWall(newCursorPos);
                    e.evt.preventDefault(); //for pinch
                    handlePinchTouchMove(e.evt.touches);
                    dispatch(setUnselectAllOnPlanMouseUp(false));
                }}
                onTouchEnd={e => {
                    if(e.evt.touches.length === 0){
                        handlePinchTouchEnd(); 
                    }

                }}
                // onMouseUp={handleMouseUp}
                draggable = {!scaling && !pointingOnWall && !addingPointLineIdPointId && !addWallSession} //&& planMode !== PlanMode.AddPoint}
                onDragStart={e => {
                    dispatch(setPlanIsDragging(true));
                    // dispatch(setUnselectAllOnPlanMouseUp(false));
                } }
                onDragMove={e => {
                    // dispatch(setUnselectAllOnPlanMouseUp(false));
                } }
                onDragEnd={e => {
                    dispatch(setPlanIsDragging(false));
                    planProps.position = e.currentTarget.getPosition();
                    dispatch(updatePlanProps(planProps));
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




