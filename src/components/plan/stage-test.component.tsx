import { Group, Layer, Path, Rect, Shape, Stage } from "react-konva";
import styles from './plan.module.scss';
import { v4 } from 'uuid';
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Line, LinePointMode, PlanElement, Point, Position, Rectangle } from "@/entities";
import LinePoint from "../line-point/line-point.component";
import { useDispatch, useSelector } from "react-redux";
import { setPlanElements, setSelectingPlanElement, setUnselectAllOnPlanMouseUp, updatePlanElement } from "@/redux/plan/plan.actions";
import { selectPlanElements, selectSelectingPlanElement, selectUnselectAllOnPlanMouseUp } from "@/redux/plan/plan.selectors";
import LineAddPoint from "../line-add-point/line-add-point.component";


const StageTest: React.FC = () => {
    const stageRef = useRef<any>();
    const [stageScale, setStageScale] = useState<{ x: number; y: number; }>({x:1, y:1});
    const [stagePosition, setStagePosition] = useState<{ x: number; y: number; }>({x:1, y:1});

    const [lastCenter, setLastCenter] = useState<{ x: number; y: number; } | null>(null);
    const [lastDist, setLastDist] = useState<number>(0);

    const [msg, setMsg] = useState("");
    const [counter, setCounter] = useState(0);


    const [draggable, setDraggable] = useState<boolean>(true);


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

        var touch1 = touches[0];
        var touch2 = touches[1];

        // setCounter(counter+1);
        // setMsg(counter.toString());

        // setMsg("touches.length = "+touches.length+", touch2 = "+touch2);

        if (touch1 && touch2) {
          setDraggable(false);

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
            let center = getCenter(p1, p2);
            setLastCenter(center);
            lastCenterLocalVar = center;
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



        //   stage.scaleX(scale);
        //   stage.scaleY(scale);

          // calculate new position of the stage
          var dx = newCenter.x - lastCenterLocalVar.x;
          var dy = newCenter.y - lastCenterLocalVar.y;

          var newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
          };

          setStageScale({x:scale, y:scale});

          // setStagePosition(newPos);
          //stage.position(newPos);
          setLastDist(dist);
          // setLastCenter(newCenter);
          setMsg("scale = "+ scale);

        }
    },[lastCenter, lastDist]);

    const handlePinchTouchEnd = useCallback(()=>{
        setLastDist(0);
        setLastCenter(null);
        setDraggable(true);
    }, []);

    return (
      <>
        <Stage
            ref={stageRef}
            // container= 'container'
            width={window.innerWidth * 0.8}
            height={window.innerHeight * 0.75}
            scale={stageScale}
            position={stagePosition}
            style={{'border':'1px solid black', 'backgroundColor':'white'}}
            hitOnDragEnabled
            // draggable = {draggable}
            // onTouchMove={e => {


            //   handlePinchTouchMove(e.evt.touches);
            //   // let touches = e.evt.changedTouches;
            //   // var touch1 = touches[0];
            //   // var touch2 = touches[1];
            //   // setMsg("touches.length = "+touches.length+", touch2 = "+touch2);
        
            // }}
            // onTouchEnd={handlePinchTouchEnd}
            draggable = {false}
            onClick={e => {
              alert("parent click")

            }}
            onPointerDown={e => {
              console.log("parent down")
              setMsg("parent down");
              } }
              onPointerUp={e => {
                console.log("parent up")
                // alert("parent up")
                setMsg("parent up");
              } }
              onPointerMove={e => {
                console.log("parent move")
                setMsg("parent move");
              } }
              // onPointerMove={e => {
              //   console.log("parent move")
              //   setMsg("parent move");
              // } }
              onDragStart={e =>{
                console.log("parent dragstart")
                setMsg("parent dragstart");
              }}
              onDragMove={e =>{
                console.log("parent dragmove")
                setMsg("parent dragmove");
              }}
              onDragEnd={e =>{
                console.log("parent dragend")
                setMsg("parent dragend");
              }}
            >
            <Layer>
              <Rect
                    x={50}
                    y={50}
                    width={100}
                    height={100}
                    fill="red"                  
                    onPointerDown={e => {
                      console.log("child down")
                      setMsg("child down");
                    } }
                    onPointerMove={e => {
                      console.log("child move")
                      setMsg("child move");
                    } }
                />
                <Rect
                    x={50}
                    y={50}
                    width={100}
                    height={100}
                    fill="blue"
                    draggable
                    onClick={e => {
                      e.cancelBubble = true;
                      console.log("child click")
                    }}
                    onPointerDown={e => {
                      e.cancelBubble = true;
                      console.log("child down")
                      setMsg("child down");
                    } }
                    onPointerMove={e => {
                      e.cancelBubble = true;
                      console.log("child move")
                      setMsg("child move");
                    } }
                    onPointerUp={e => {
                      e.cancelBubble = true;
                      e.evt.stopPropagation();
                      console.log("child up")
                      setMsg("child up");
                    } }
                    onDragStart={e =>{
                      e.cancelBubble = true;
                      console.log("child dragstart")
                      setMsg("child dragstart");
                    }}
                    onDragMove={e =>{
                      e.cancelBubble = true;
                      console.log("child dragmove")
                      setMsg("child dragmove");
                    }}
                    onDragEnd={e =>{
                      e.cancelBubble = true;
                      console.log("child dragend")
                      setMsg("child dragend");
                    }}
                />
            </Layer>
        </Stage>
        <div>{msg}</div>
        {/* <div>stageScale.x = {stageScale.x}, stageScale.y = {stageScale.y}</div> */}
      </>
    )
};

export default StageTest;


