import { Group, Layer, Path, Rect, Shape, Stage } from "react-konva";
import styles from './plan.module.scss';
import { v4 } from 'uuid';
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Line, LinePointMode, PlanElement, PlanProps, Point, Position, Rectangle } from "@/entities";
import { initialPlanElements } from "@/utils";
import LinePoint from "../line-point/line-point.component";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElements, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement, updatePlanProps } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectPlanProps, selectSelectingPlanElement, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import LineAddPoint from "../line-add-point/line-add-point.component";
import { PLAN_HEIGHT_SCREEN_RATIO, PLAN_WIDTH_SCREEN_RATIO } from "@/global";


const Plan: React.FC = () => {
    const minPlanDim: Dimensions = new Dimensions(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const [planDim, setPlanDim] = useState<Dimensions>(minPlanDim);
    // const [planScale, setPlanScale] = useState<number>(1);
    const [planPos, setPlanPos] = useState<Point>(new Point(0,0));
    const [cursorPos, setCursorPos] = useState<Point>(new Point(0,0));

    const planProps:PlanProps = useSelector(selectPlanProps);
    const planElements:{ [key: string]: PlanElement } = useSelector(selectPlanElements);
    const selectingPlanElement = useSelector(selectSelectingPlanElement);
    const unselectAllOnPlanMouseUp = useSelector(selectUnselectAllOnPlanMouseUp);
    const [dragging, setDragging] = useState<boolean>(false);
    const [scaling, setScaling] = useState<boolean>(false);

    const stageRef = useRef<any>();
    // const [stageScale, setStageScale] = useState<{ x: number; y: number; }>({x:1, y:1});
    // const [stagePosition, setStagePosition] = useState<{ x: number; y: number; }>({x:1, y:1});

    const [lastCenter, setLastCenter] = useState<{ x: number; y: number; } | null>(null);
    const [lastDist, setLastDist] = useState<number>(0);

    const [msg, setMsg] = useState("");

    const dispatch = useDispatch();

    // const [msg, setMsg] = useState("");
    // const [counter, setCounter] = useState(0);

    // const [draggable, setDraggable] = useState<boolean>(true);
    
    useEffect(()=>{
        dispatch(setPlanElements(initialPlanElements));
    },[dispatch]);

    useEffect(()=>{
        const newPlanProps = new PlanProps();
        newPlanProps.dimensions = new Dimensions(window.innerWidth * PLAN_WIDTH_SCREEN_RATIO, window.innerHeight * PLAN_HEIGHT_SCREEN_RATIO);
        dispatch(updatePlanProps(newPlanProps));
    },[dispatch]);
    
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

    const getPlanElement = useCallback((el:PlanElement)=> {
        switch(el.constructor.name){
            case("Line"): {
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
                        stroke="grey"
                        strokeWidth={l.width}
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
                        onClick={_ => {
                            console.log("selectPlanElement");
                            selectPlanElement(el);
                            dispatch(setUnselectAllOnPlanMouseUp(false));
                        }}
                        onTap={_ => {
                            console.log("selectPlanElement");
                            selectPlanElement(el);
                            dispatch(setUnselectAllOnPlanMouseUp(false));
                        }}
                        onPointerDown={_ =>{
                            el.setOnPointerDown(true);
                        }}
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
                            return <LinePoint key={p.id} line={l} id={p.id} position={p as Position} selected={l.selectedPointId === p.id}/>
                        })
                    }
                    {   
                        //property l.addingPointFrom
                        //l.addingPoint ?
                        //<LineAddPoint line={l} position={cursorPosOnPlan}/>
                        l.addPointSession?
                        <LineAddPoint line={l} position={cursorPos}/>
                        :null
                    }
                </Group>
                )
            };
            case("Rectangle"): {
                const r = el as Rectangle;
                return(
                    <Rect
                        key={el.id}
                        x={r.getX()}
                        y={r.getY()}
                        width={r.getW()}
                        height={r.getH()}
                        fill="blue"
                        draggable
                        onDragEnd={e => {
                            r.setPos(e.target.getPosition().x, e.target.getPosition().y)

                            // console.log("r.x = ",r.x)
                            // const rindex = planElements.findIndex((value) => value.id === el.id);
                            // (planElements[rindex] as Rectangle).x = r.x;
                            // (planElements[rindex] as Rectangle).x1 = r.x;
                            const newPlanElements = {...planElements};
                            setPlanElements(newPlanElements);
                        }}
                    />
                )
            }
        }
    },[cursorPos, dispatch, planElements, selectPlanElement]);

    const unselectAllPlanElements = useCallback(() => {
        console.log("PRE unselectAllPlanElements");

        //if(selectingPlanElement) return;

        console.log("unselectAllPlanElements");
        for(const elId in planElements){
            planElements[elId].setSelected(false);
        }
        dispatch(setPlanElements(planElements));

    }, [dispatch, planElements]);
    
    const addingPoint = useCallback(()=>{
        for(const elId in planElements){
            const el = planElements[elId];
            switch(el.constructor.name){
                case("Line"): {
                    const l = el as Line;
                    if(l.addPointSession){
                        return true;
                    }
                }
            }
        }
        return false;
    },[planElements]);
    
    const handleAddPoint = useCallback(() => {
        //check if a linepoint is selected and has a selected point and is in AddPointMode and not already on addPointSession
        for(const elId in planElements){
            const el = planElements[elId];
            switch(el.constructor.name){
                case("Line"): {
                    const l = el as Line;
                    if(l.getSelected() && l.linePointMode === LinePointMode.AddPoint && l.selectedPointId!= null && !l.addPointSession && l.pointIdCursorIsOver){
                        console.log("ok startAddPointSession")
                        l.startAddPointSession(l.selectedPointId);
                        dispatch(updatePlanElement(l));
                        dispatch(setUnselectAllOnPlanMouseUp(false));
                        return;
                    }
                }
            }
        }        
    }, [dispatch, planElements]);
    
    // const endAddPointSession = useCallback(() => {
    //     //check if a linepoint is selected and has a selected point and is in AddPointMode
    //     for(const elId in planElements){
    //         const el = planElements[elId];
    //         switch(el.constructor.name){
    //             case("Line"): {
    //                 const l = el as Line;
    //                 if(l.addPointSession){
    //                     l.endAddPointSession();
    //                     dispatch(updatePlanElement(l));
    //                     return;
    //                 }
    //             }
    //         }
    //     }        
    // }, [dispatch, planElements]);

    const addPoint = useCallback(() => {
        //check if a linepoint is selected and has a selected point and is in AddPointMode
        for(const elId in planElements){
            const el = planElements[elId];
            switch(el.constructor.name){
                case("Line"): {
                    const l = el as Line;
                    if(l.addPointSession){
                        // l.endAddPointSession();
                        l.addPointAndEndAddPointSession(new Point(cursorPos.x, cursorPos.y), l.selectedPointId as string);
                        // l.selectPointIndex(l.selectedPointIndex as number + 1);
                        dispatch(updatePlanElement(l));
                        return;
                    }
                }
            }
        }        
    }, [cursorPos.x, cursorPos.y, dispatch, planElements]);

    const unselectAllOnPlanMouseUpAdditionalConditions = useCallback(() => {
        for(const elId in planElements){
            const el = planElements[elId];
            switch(el.constructor.name){
                case("Line"): {
                    const l = el as Line;
                    if(l.selectedPointId){
                        l.selectPointId(null);
                        dispatch(updatePlanElement(l));
                        return false;
                    }
                }
            }
        }
        return true;
    }, [dispatch, planElements]);

    const handleMouseUp = useCallback(()=>{
        let unselectElements = true;

        for(const elId in planElements){
            const el = planElements[elId];
            switch(el.constructor.name){
                case("Line"): {
                    const l = el as Line;
                    if(l.pointIdPointingDownOn){
                        unselectElements = false;
                        l.pointIdPointingDownOn = null;
                    }
                    if(l.onPointerDown){
                        unselectElements = false;
                        l.setOnPointerDown(false);
                    }
                    if(l.addPointSession){
                        l.addPointAndEndAddPointSession(new Point(cursorPos.x, cursorPos.y), l.selectedPointId as string);
                        dispatch(updatePlanElement(l));
                    }
                    if(l.selectedPointId){
                        if(l.pointOverJoinablePoint(l.selectedPointId, planProps.scale) && l.path.length > 3){
                            l.joinExtremePoints();
                        }
                        l.selectPointId(null);
                    }
                    dispatch(updatePlanElement(l));
                }
            }
        }
        if(dragging || scaling){
            unselectElements = false;
        }
        if(unselectElements){
            unselectAllPlanElements();
        }
        // dispatch(setUnselectAllOnPlanMouseUp(true));

        // if(unselectElements){
        //     unselectAllPlanElements();
        // }else{
        //     if(addingPoint()){
        //         addPoint();
        //     }
        //     // dispatch(setUnselectAllOnPlanMouseUp(true));
        // }

        // for(const elId in planElements){
        //     const el = planElements[elId];
        //     switch(el.constructor.name){
        //         case("Line"): {
        //             const l = el as Line;
        //             if(l.selectedPointId){
        //                 l.selectPointId(null);
        //             }
        //             dispatch(updatePlanElement(l));
        //         }
        //     }
        // }

        // for(const elId in planElements){
        //     const el = planElements[elId];
        //     switch(el.constructor.name){
        //         case("Line"): {
        //             const l = el as Line;
             
        //                 l.addPointSession = null;
        //                 // l.pointIdCursorIsOver = null; 
        //                 dispatch(updatePlanElement(l));

                    
        //         }
        //     }
        // }  
    },[cursorPos.x, cursorPos.y, dispatch, dragging, planElements, planProps.scale, scaling, unselectAllPlanElements]);

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
    },[dispatch, lastCenter, lastDist, planProps]);

    const handlePinchTouchEnd = useCallback(()=>{
        setMsg("handlePinchTouchMove")
        setLastDist(0);
        setLastCenter(null);
    }, []);
    

    const setCursorPosWithEventPos = useCallback((e:any, touch:boolean)=>{
        const ePos:{x:number, y:number} = touch? e.target.getStage()?.getPointerPosition() : {x:e.evt.offsetX, y:e.evt.offsetY};
        setCursorPos(new Point((ePos.x - e.currentTarget.getPosition().x) * 1/planProps.scale, (ePos.y - e.currentTarget.getPosition().y) * 1/planProps.scale));
    },[planProps.scale]);

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
                onMouseDown={e => {
                    // alert("currentTarget x = "+e.currentTarget.getPosition().x + ", currentTarget y = "+e.currentTarget.getPosition().y);
                    setCursorPosWithEventPos(e, false);
                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                    handleAddPoint();
                }}
                onTouchStart={e => {
                    // var touchPos = e.target.getStage()?.getPointerPosition();
                    // if(!touchPos) return;
                    // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                    setCursorPosWithEventPos(e, true);
                    handleAddPoint();
                }}
                onMouseMove={e => {
                    setCursorPosWithEventPos(e, false);
                    // setCursorPos(new Point(e.evt.offsetX - e.currentTarget.getPosition().x, e.evt.offsetY - e.currentTarget.getPosition().y));
                }}
                onTouchMove={e => {
                    // var touchPos = e.target.getStage()?.getPointerPosition();
                    // if(!touchPos) return;
                    // setCursorPos(new Point(touchPos.x - e.currentTarget.getPosition().x, touchPos.y - e.currentTarget.getPosition().y));
                    setCursorPosWithEventPos(e, true);
                    e.evt.preventDefault(); //for pinch
                    handlePinchTouchMove(e.evt.touches);
                }}
                onTouchEnd={e => {handlePinchTouchEnd(); 
                    if(e.evt.touches.length === 0){
                        setScaling(false);
                    }
                }}
                // onMouseUp={handleMouseUp}
                onPointerUp={handleMouseUp}
                draggable = {!scaling && !addingPoint()}
                onDragStart={_ => {setDragging(true); dispatch(setUnselectAllOnPlanMouseUp(false));} }
                onDragEnd={e => {setDragging(false);
                    planProps.position = e.currentTarget.getPosition();
                    dispatch(updatePlanProps(planProps));
                    dispatch(setUnselectAllOnPlanMouseUp(true));}}
                >
                <Layer>
                <Rect
                    x={0}
                    y={0}
                    width={100}
                    height={100}
                    fill="blue"
                    onClick={e =>{console.log("Click on child")}}
                />
                {/* {
                    Object.entries(planElements).map(([_, v]) => {
                    return getPlanElement(v)})
                } */}
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
//         switch(el.constructor.name){
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




