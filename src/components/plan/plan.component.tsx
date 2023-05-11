import { Group, Layer, Path, Rect, Shape, Stage } from "react-konva";
import styles from './plan.module.scss';
import { v4 } from 'uuid';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Line, PlanMode, PlanElement, PlanElementTypeName, PlanProps, Point, Position, Rectangle, Vector2D, DblClick, PlanElementsRecordsHandler, PlanElementsHelper, PlanPointerUpActionsHandler } from "@/entities";
import { cloneArray } from "@/utils";
import LinePoint from "../line-point/line-point.component";
import { useDispatch, useSelector } from "react-redux";
import { addPlanElement, setAddingPointLineIdPointId, setPlanCursorPos, setPlanElements, setPlanElementsRecords, setPlanMode, setPlanPointerUpActionsHandler, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement, updatePlanProps } from "@/redux/plan/plan.actions";
import { selectAddingPointLineIdPointId, selectPlanCursorPos, selectPlanElements, selectPlanElementsRecords, selectPlanMode, selectPlanPointerUpActionsHandler, selectPlanProps, selectSelectingPlanElement, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import LineAddPoint from "../line-add-point/line-add-point.component";
import { PLAN_HEIGHT_SCREEN_RATIO, PLAN_WIDTH_SCREEN_RATIO } from "@/global";
import { useAddPoint } from "@/custom-hooks/use-add-point.hook";
import { useRemLine } from "@/custom-hooks/use-rem-line.hook";

const Plan: React.FC = () => {
    const minPlanDim: Dimensions = new Dimensions(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const [planDim, setPlanDim] = useState<Dimensions>(minPlanDim);
    // const [planScale, setPlanScale] = useState<number>(1);
    const [planPos, setPlanPos] = useState<Point>(new Point(0,0));
    const [cursorPos, setCursorPos] = useState<Point>(new Point(0,0));
    const planCursorPos: Vector2D = useSelector(selectPlanCursorPos);

    const planProps:PlanProps = useSelector(selectPlanProps);
    const planMode: PlanMode = useSelector(selectPlanMode);

    const planElements: PlanElement[] = useSelector(selectPlanElements);
    const planElementsRecords: PlanElementsRecordsHandler = useSelector(selectPlanElementsRecords);

    const selectingPlanElement = useSelector(selectSelectingPlanElement);
    const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
    const [dragging, setDragging] = useState<boolean>(false);
    const [scaling, setScaling] = useState<boolean>(false);
    const scaleMax = 2;
    const scaleMin = 1/9;

    const stageRef = useRef<any>();
    // const [stageScale, setStageScale] = useState<{ x: number; y: number; }>({x:1, y:1});
    // const [stagePosition, setStagePosition] = useState<{ x: number; y: number; }>({x:1, y:1});

    const [lastCenter, setLastCenter] = useState<{ x: number; y: number; } | null>(null);
    const [lastDist, setLastDist] = useState<number>(0);


    const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
    // const [dragDxy, setDragDxy] = useState<Vector2D>(new Vector2D(0,0));

    const [msg, setMsg] = useState("");

    const dispatch = useDispatch();
    const planPointerUpActionsHandler: PlanPointerUpActionsHandler = useSelector(selectPlanPointerUpActionsHandler);
    const addingPointLineIdPointId: [string, string] | null = useSelector(selectAddingPointLineIdPointId);

    const addPoint = useAddPoint();
    const removeLineIfNoPoints = useRemLine();

    // const [dblCick, setDblClick] = useState<DblClick>(new DblClick());

    // const [msg, setMsg] = useState("");
    // const [counter, setCounter] = useState(0);

    // const [draggable, setDraggable] = useState<boolean>(true);
    
    const dblClick: DblClick = useMemo(() =>{
        return new DblClick();
    }, []);

    const addLineAndSetToAddMode = useCallback((e:any) => {
        if(planMode != PlanMode.AddPoint) return;

        const pX = planCursorPos.x;
        const pY = planCursorPos.y;
    
        const newLine:Line = new Line(v4(), [new Point(pX, pY)], 25);
        const firstPointId = newLine.path[0].id;
        newLine.setSelected(true);
        newLine.selectPointId(firstPointId);

        // newLine.startAddPointSession(firstPointId);
        // newLine.pointIdCursorIsOver = firstPointId;

        dispatch(setAddingPointLineIdPointId([newLine.id, firstPointId]));
        dispatch(addPlanElement(newLine));
        // console.log("--> newLine.path.length", newLine.path.length);
        
        dispatch(setPlanMode(PlanMode.AddPoint));
        // dispatch(setUnselectAllOnPlanMouseUp(false));

    }, [planCursorPos.x, planCursorPos.y, dispatch, planMode]);

    const handleDblClick = useCallback((e:any, f:any) =>{
        if(dblClick.click === 0){
            dblClick.start();
        }else{
            dblClick.end();
            f(e);
        }
    }, [dblClick]);    

    useEffect(()=>{
        const newPlanProps = new PlanProps();
        newPlanProps.dimensions = new Dimensions(window.innerWidth * PLAN_WIDTH_SCREEN_RATIO, window.innerHeight * PLAN_HEIGHT_SCREEN_RATIO);
        dispatch(updatePlanProps(newPlanProps));
    },[dispatch]);
    
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

    const getPlanElement = useCallback((el:PlanElement)=> {
        switch(el.typeName){
            case(PlanElementTypeName.Line): {
                const l = el as Line;
                const path = l.path;
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
                    <Group key={l.id}
                    // onMouseUp={_ => {
                    //     if(l.addPointSession){                    
                    //         l.endAddPointSession();
                    //         dispatch(updatePlanElement(l));
                    //     }
                    // }}
                        // onClick={_ => {
                        //     console.log("selectPlanElement");
                        //     toggleSelectPlanElement(el);
                        //     moveUpPlanElement(el);
                        //     dispatch(setUnselectAllOnPlanMouseUp(false));
                        // }}
                        // onTap={_ => {
                        //     console.log("selectPlanElement");
                        //     toggleSelectPlanElement(el);
                        //     moveUpPlanElement(el);
                        //     dispatch(setUnselectAllOnPlanMouseUp(false));
                        // }}
                        // onPointerDown={_ =>{
                        //     el.setOnPointerDown(true);
                        // }}
                    >
                    <Path
                        data= {
                            (():string => {
                                let s:string = "";
                                s += "M";
                                for(const point of path){
                                    s += " " + point.x + " " + point.y + " ";
                                }
                                // let iMax = path.length - 1;
                                // if(path[0].x === path[iMax].x && path[0].y === path[iMax].y){
                                //     s += "Z";
                                // }
                                s += l.pathIsClose ? "Z":"";
                                return s
                            })()
                        }
                        fillEnabled = {false}
                        stroke="grey"
                        // dash={[33, 10]}
                        strokeWidth={l.width}
                        onClick={e => {
                            e.cancelBubble = true;
                            console.log("selectPlanElement");
                            toggleSelectPlanElement(el);
                            moveUpPlanElement(el);
                            // dispatch(setUnselectAllOnPlanMouseUp(false));
                        }}
                        onTap={_ => {
                            console.log("selectPlanElement");
                            toggleSelectPlanElement(el);
                            moveUpPlanElement(el);
                            // dispatch(setUnselectAllOnPlanMouseUp(false));
                        }}
                        // onPointerDown={_ =>{
                        //     el.setOnPointerDown(true);
                        // }}
                        // onMouseDown={_ => {
                        //     dispatch(setSelectingPlanElement(true));
                        // }}
                        // onTouchStart={_ => {
                        //     dispatch(setSelectingPlanElement(true));
                        // }}
                        // onMouseUp={_ => {
                        //     // console.log("plan el mouseup")
                        //     // dispatch(setSelectingPlanElement(false));
                        //     // selectPlanElement(el);
                        //     //dispatch(setSelectingPlanElement(false));
                        // }}
                        // onTouchEnd={_ => {
                        //     dispatch(setSelectingPlanElement(false));
                        // }}
                        // onClick={_ => {
                        //     console.log("selectPlanElement");
                        //     selectPlanElement(el);
                        //     const newPlanElements = planElements.slice();
                        //     const planElement = newPlanElements.find(iterEl => iterEl.id === el.id);
                        //     if(!planElement) return;
                        //     const index = planElements.indexOf(planElement);
                        //     newPlanElements.splice(index, 1);
                        //     newPlanElements.push(planElement);
                        //     dispatch(setPlanElements(newPlanElements))
                        //     dispatch(setUnselectAllOnPlanMouseUp(false));
                        // }}
                        // onTap={_ => {
                        //     console.log("selectPlanElement");
                        //     selectPlanElement(el);
                        //     dispatch(setUnselectAllOnPlanMouseUp(false));
                        // }}
                        // onPointerDown={_ =>{
                        //     el.setOnPointerDown(true);
                        // }}
                        //CODE FOR SHAPE VERSION
                        // sceneFunc={(context, shape) => {
                        //     context.beginPath();
                        //     if(!path.length) return;

                        //     context.moveTo(path[0].x, path[0].y);
                        //     for(let i=1; i<path.length; i++){
                        //         context.lineTo(path[i].x, path[i].y);
                        //     }

                        // //   context.closePath();
                        // // (!) Konva specific method, it is very important
                        // context.fillStrokeShape(shape);
                        // }}
                    />
                    {                    
                        path.map((p, _) => {
                            return <LinePoint key={p.id} line={l} id={p.id} position={p as Position} selected={l.selectedPointId === p.id && !dragging && !scaling}/>
                        })
                    }
                </Group>
                )
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
    },[dragging, moveUpPlanElement, scaling, toggleSelectPlanElement]);

    const unselectAllPlanElements = useCallback(() => {
        for(const elId in planElements){
            planElements[elId].setSelected(false);
        }
        dispatch(setPlanElements(planElements));
    }, [dispatch, planElements]);
    
    const handleClick= useCallback(()=>{
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
                        // console.log("e.evt.offsetX", e.evt.)
                    }}
                    onDragEnd={e => {
                        if(!dragStartPos) return;
                        const dragDxy = new Vector2D(e.currentTarget.getPosition().x - dragStartPos.x, e.currentTarget.getPosition().y - dragStartPos.y);
                        for(const el of selectedElements){
                            if(!(el.typeName === PlanElementTypeName.Line)) continue;
                            const l = el as Line;
                                for(const p of l.path){
                                    p.x += dragDxy.x;
                                    p.y += dragDxy.y;
                                }
                        }
                        setDragStartPos(null);
                        e.currentTarget.setPosition(new Vector2D(0,0));
                    }}
                >
                {
                    selectedElements.map((el, _) => {
                        return getPlanElement(el)
                    })
                }
                </Group>
                {   
                    //property l.addingPointFrom
                    //l.addingPoint ?
                    //<LineAddPoint line={l} position={cursorPosOnPlan}/>
                    addingPointLineIdPointId?
                    <LineAddPoint line={PlanElementsHelper.findElementById(planElements, addingPointLineIdPointId[0]) as Line} position={planCursorPos}/>
                    :null
                }
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
        setMsg("")

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
                const line = planElements[lineIndex] as Line;
                // removeLineIfNoPoints(lineIndex)
                if(line.path.length < 2){ //if line has only one point we remove the line
                    const clone = PlanElementsHelper.clone(planElements);
                    clone.splice(lineIndex, 1);
                    dispatch(setPlanElements(clone));
                }
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
          dispatch(updatePlanProps(planProps));
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
          dispatch(updatePlanProps(planProps));
        //   setStagePosition(newPos);

          //stage.position(newPos);
          setLastDist(dist);
          setLastCenter(newCenter);
        //   setMsg("scale = "+ scale);

        }
    },[addingPointLineIdPointId, dispatch, lastCenter, lastDist, planElements, planProps, scaleMin]);

    const handlePinchTouchEnd = useCallback(()=>{
        setMsg("handlePinchTouchMove")
        setLastDist(0);
        setLastCenter(null);
    }, []);

    const handleOnPointerUp = useCallback(()=>{
        if(addingPointLineIdPointId){
            addPoint()
        }
    }, [addPoint, addingPointLineIdPointId]);
    
    const setCursorPosWithEventPos = useCallback((e:any, touch:boolean)=>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
        // setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
        dispatch(setPlanCursorPos(new Vector2D((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale)))
    },[dispatch, planProps.scale]);

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
                onClick={handleClick}
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
                    setCursorPosWithEventPos(e, false);
                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                    // handleAddPoint();
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
                onPointerMove={e => {
                    setCursorPosWithEventPos(e, false);
                    // console.log("PLAN ONEMOUSEMOVE")
                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                }}
                onTouchMove={e => {
                    // var touchPos = e.target.getStage()?.getPointerPosition();
                    // if(!touchPos) return;
                    // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                    setCursorPosWithEventPos(e, true);
                    e.evt.preventDefault(); //for pinch
                    handlePinchTouchMove(e.evt.touches);
                    dispatch(setUnselectAllOnPlanMouseUp(false));
                }}
                onTouchEnd={e => {handlePinchTouchEnd(); 
                    if(e.evt.touches.length === 0){
                        setScaling(false);
                    }
                }}
                // onMouseUp={handleMouseUp}
                draggable = {!scaling && !addingPointLineIdPointId} //&& planMode !== PlanMode.AddPoint}
                onDragStart={e => {
                    setDragging(true); 
                    // dispatch(setUnselectAllOnPlanMouseUp(false));
                } }
                onDragMove={e => {
                    // dispatch(setUnselectAllOnPlanMouseUp(false));
                } }
                onDragEnd={e => {
                    setDragging(false);
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




