import { v4 } from 'uuid';
import { cloneArray, doSegmentsIntersect, getDistance, isPointInPolygon, sortPointsClockwise } from './utils';
import { BIG_NUMBER, PRECISION, WALL_WIDTH } from './global';

export enum PlanElementTypeName {Line, Wall, JoinedWalls};


export class PlanProps {
    dimensions:Dimensions = new Dimensions(0,0);
    position:Position = new Position(0,0);
    scale: number = 1;
    
    // constructor(dimensions:Dimensions, position:Position){
    //     this.dimensions = dimensions;
    //     this.position = position;
    // } 
}

export enum PlanMode { Move, AddWall, AddPlanElement, MovePoint, AddPoint, RemovePointThenJoin, RemovePointNoJoin }

// export class PlanElementsHelper{
//     static planElementsSeparatedBySelection(planElements:PlanElement[]): [PlanElement[], PlanElement[]]{
//         const planElementsSBS: [PlanElement[], PlanElement[]] = [[], []];
//         for(const el of planElements){
//             planElementsSBS[el.getSelected()?0:1].push(el);
//         }
//         return planElementsSBS;
//     }
// }

export class PlanElementsHelper {
    static clone(planElements:PlanElement[]):PlanElement[]{
        const planElementsClone:PlanElement[] = [];
        for(const el of planElements){
            planElementsClone.push(el.clone());
        }
        return planElementsClone;
    }

    static findElementById(planElements:PlanElement[], planElementId:string): PlanElement | undefined{
        return planElements.find(el => el.id === planElementId)
    }

    static findElementIndexById(planElements:PlanElement[], planElementId:string): number{
        return planElements.findIndex(el => el.id === planElementId)
    }

    static hasSelectedElements(planElements:PlanElement[]):boolean{
        for(const el of planElements){
            if(el.getSelected()) return true;
        }
        return false;
    }

    static unselectAllElements(planElements:PlanElement[]){
        for(const el of planElements){
            el.unselect();
        }
    }
}




// export class PlanElements {
//     elements: PlanElement[];

//     constructor(elements: PlanElement[]){
//         this.elements = elements;
//     }

//     clone():PlanElements{
//         const planElements:PlanElement[] = [];

//         for(const el of this.elements){
//             planElements.push(el.clone());
//         }
//         return new PlanElements(planElements);
//     }
// }


// export class PlanElements {
//     unselectedElements: PlanElement[];
//     selectedElements: PlanElement[];

//     constructor(unselectedElements: PlanElement[], selectedElements: PlanElement[]){
//         this.unselectedElements = unselectedElements;
//         this.selectedElements = selectedElements;
//     } 
// }


export class Dimensions{
    w:number;
    h:number;

    constructor(w:number, h:number){
        this.w = w;
        this.h = h;
    } 
}

export class Point{
    id:string;
    x:number;
    y:number;

    constructor(id: string, x:number, y:number){
        this.id = id;
        this.x = x;
        this.y = y;
    } 
}


export interface Vector2D{
    x:number;
    y:number;
}


export class Position{
    x:number;
    y:number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    } 
}

// export class Scale{
//     x:number;
//     y:number;

//     constructor(x:number, y:number){
//         this.x = x;
//         this.y = y;
//     } 
// }

class Offsets{
    left:number;
    right:number;
    top:number;
    bottom:number;

    constructor(left:number, right:number, top:number, bottom:number){
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
}

export abstract class PlanElement {
    id:string;
    protected selected:boolean = false;
    onPointerDown:boolean = false;
    typeName:PlanElementTypeName;

    constructor(id:string, typeName:PlanElementTypeName){
        this.id = id;
        this.typeName = typeName;
    }

    getSelected():boolean {
        return this.selected;
    }

    setSelected(selected:boolean) {
        this.selected = selected;
    }

    setOnPointerDown(value: boolean) {
        this.onPointerDown = value;
    }

    clone():PlanElement{
        return this;
    }

    unselect(){
    }

    delete(wallId?:string){

    }
}

export class Rectangle extends PlanElement{
    private x:number;
    private y:number;
    private w:number;
    private h:number;
    private x1:number;
    private y1:number;
    private x2:number;
    private y2:number;

    constructor(id:string, typeName:PlanElementTypeName, x:number, y:number, w:number, h:number){
        super(id, typeName);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + w;
        this.y2 = y + h;
    }

    setX(x:number){
        this.x = x;
        this.x1 = x;
        this.x2 = x + this.w;
    }

    setY(y:number){
        this.y = y;
        this.y1 = y;
        this.y2 = y + this.h;
    }

    setPos(x:number, y:number){
        this.setX(x);
        this.setY(y);
    }

    getX():number{
        return this.x;
    }

    getX1():number{
        return this.x1;
    }

    getX2():number{
        return this.x2;
    }

    getY():number{
        return this.y;
    }

    getY1():number{
        return this.y1;
    }

    getY2():number{
        return this.y2;
    }

    getW():number{
        return this.w;
    }

    getH():number{
        return this.h;
    }
}

export enum LinePointMode {MovePoint, AddPoint, RemovePointThenJoin, RemovePointNoJoin}

export abstract class Line extends PlanElement {
    path:Point[];
    pathIsClose:boolean = false;
    defaultLinePointMode:LinePointMode = LinePointMode.MovePoint;
    linePointMode:LinePointMode = this.defaultLinePointMode;
    // selectedPointIndex:number | null = null;
    selectedPointId:string | null = null;
    addPointSession:AddPointSession | null = null;
    // pointIndexCursorIsOver:number | null = null;
    pointIdCursorIsOver:string | null = null;
    pointIdPointingDownOn:string | null = null;
    pointRadius = 20;
    memoizedMoveOrAddMode:LinePointMode = this.defaultLinePointMode;
    width:number;

    constructor(id:string, path:Point[], width:number){
        super(id, PlanElementTypeName.Line);
        this.path = path;
        this.width = width;
    }

    toggleMoveAddModes(){
        this.linePointMode = this.linePointMode === LinePointMode.MovePoint ? LinePointMode.AddPoint : LinePointMode.MovePoint;
    }

    // toNextLinePointMode(){
    //     const sortedModes = [LinePointMode.MovePoint, LinePointMode.AddPoint];
    //     for(let i=0; i<sortedModes.length; i++){
    //         const loopState = sortedModes[i];
    //         if(this.linePointMode === loopState){
    //             if(i<sortedModes.length-1){
    //                 this.linePointMode = sortedModes[i+1];
    //                 return;
    //             }
    //             this.linePointMode = sortedModes[0];
    //             return
    //         }
    //     }
    // }

    // selectPointIndex(pointIndex:number){
    //     this.selectedPointIndex = pointIndex;
    // }
    selectPointId(pointId:string | null){
        this.selectedPointId = pointId;
    }
    getPathPointById(pointId:string): Point | undefined {
        return this.path.find(p => p.id === pointId);
    }
    getPathPointIndexById(pointId:string): number {
        return this.path.findIndex(p => p.id === pointId);
    }
    updatePathPointPositionById(pointId:string, newPoint:Point) {
        let pointToUpdate = this.getPathPointById(pointId);
        if(!pointToUpdate) return;
        pointToUpdate.x = newPoint.x;
        pointToUpdate.y = newPoint.y;
    }
    // unselectPointIndex(){
    //     this.selectedPointIndex = null;
    // }

    // unselectPointId(){
    //     this.selectedPointId = null;
    // }

    startAddPointSession(startPointId:string){
        this.addPointSession = new AddPointSession(this.id, startPointId);
    }

    endAddPointSession(){
        this.addPointSession = null;
        this.pointIdCursorIsOver = null;
        // alert(this.pointIdCursorIsOver)
        // this.selectedPointIndex = null;
    }

    removePoint(id:string, join:boolean){
        const pIndex = this.getPathPointIndexById(id);
        if(join){
            this.path.splice(pIndex, 1);
            if(this.path.length == 2 && this.pathIsClose){
                this.pathIsClose = false;
            }
            return;
        }
        const newPath:Point[] = [];

        let offset = 1;
        let minimumValue = 0;
        let modulus = this.path.length;

        for(let i=0; i<this.path.length; i++){
            const index = (pIndex + i - 1 - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
            newPath.push(this.path[index]);
        }
        this.path = newPath;
        this.pathIsClose = false;
        this.path.splice(0, 1);
    }

    removeSubPath(idStart:string, idEnd:string){
        this.pathIsClose = false;
    }

    addPoint(point:Point, startingFromPointId:string, pointOverId:string | null):boolean{ //return true if point is added false otherwise
        // if(this.addPointSession?.pointIndexCursorIsOver !== null){
        const startingFromPointIndex = this.getPathPointIndexById(startingFromPointId);
        if(startingFromPointId === pointOverId){
            // this.endAddPointSession();
            return false;
        }
        else if(pointOverId !== null){
            const pointIndexCursorIsOver = this.getPathPointIndexById(pointOverId);
            //if starting point and target are extremity points we close the path
            if( (startingFromPointIndex === 0 && pointIndexCursorIsOver === this.path.length - 1) ||
                (pointIndexCursorIsOver === 0 && startingFromPointIndex === this.path.length - 1)){
                this.pathIsClose = true;
                this.selectedPointId = null;
                //if we close path we also remove the LinePointMode.AddPoint mode for a better user experience;
                if(this.linePointMode === LinePointMode.AddPoint){
                    this.linePointMode = LinePointMode.MovePoint;
                }
                // this.endAddPointSession();
                return true;
            }
            // this.endAddPointSession();
            // return;
        }
        
        let newPointIndex = -1;

        if(!this.pathIsClose && startingFromPointIndex === 0){
            newPointIndex = startingFromPointIndex;
        }else if(!this.pathIsClose && startingFromPointIndex === this.path.length - 1){
            newPointIndex = startingFromPointIndex + 1;
        }else{
            let offset = 1;
            let minimumValue = 0;
            let modulus = this.path.length;
            const previousPointIndex = (startingFromPointIndex - 1 - 1 - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
            const nextPointIndex = (startingFromPointIndex - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;

            //determining adding before or after startingFromPoint
            const pN = point;
            const pS = this.path[startingFromPointIndex];
            const pB = this.path[previousPointIndex];
            const pA = this.path[nextPointIndex];

            const pSpBAngle = Math.atan2(pB.y - pS.y, pB.x - pS.x);
            const pSpNAngle = Math.atan2(pN.y - pS.y, pN.x - pS.x);
            let diff1 = pSpNAngle - pSpBAngle;
            diff1 += (diff1>Math.PI) ? -Math.PI*2 : (diff1<-Math.PI) ? Math.PI*2 : 0;

            const pSpAAngle = Math.atan2(pA.y - pS.y, pA.x - pS.x);
            let diff2 = pSpNAngle - pSpAAngle;
            diff2 += (diff2>Math.PI) ? -Math.PI*2 : (diff2<-Math.PI) ? Math.PI*2 : 0;

            newPointIndex = Math.abs(diff1) < Math.abs(diff2) ? startingFromPointIndex : startingFromPointIndex + 1;
        }
        // const newPointIndex = startingFromPointIndex === 0 ? 0 : startingFromPointIndex + 1;
        // const newPointIndex = Math.abs(diff1) < Math.abs(diff2) ? startingFromPointIndex : startingFromPointIndex + 1;

        this.path.splice(newPointIndex, 0, point);
        this.selectPointId(null);
        // this.endAddPointSession();
        return true;
    }

    // updatePointIndexCursor(cursor:Point):boolean{
    //     const pointIndexCursorIsOverBefore = this.pointIndexCursorIsOver;
    //     for(let i=0; i<this.path.length; i++){
    //         if(Math.sqrt( Math.pow(cursor.x - this.path[i].x, 2) +  Math.pow(cursor.y - this.path[i].y, 2)) < this.pointRadius){
    //             this.pointIndexCursorIsOver = i;
    //             return (!(this.pointIndexCursorIsOver === pointIndexCursorIsOverBefore));
    //         }
    //     }
    //     this.pointIndexCursorIsOver = null;
    //     return (!(this.pointIndexCursorIsOver === pointIndexCursorIsOverBefore));
    // }

    pointOverJoinablePoint = (pointId:string, planScale:number):boolean => {
        const point = this.getPathPointById(pointId) as Point;
        if(!point) return false;

        const lastPoint = this.path[this.path.length-1];
        const firstPoint = this.path[0];
        const pointRadius = this.pointRadius * 1/planScale;
        if(firstPoint.id === pointId){
          const d = Math.sqrt( Math.pow(point.x - lastPoint.x, 2) +  Math.pow(point.y - lastPoint.y, 2))
          if(d < pointRadius){
            return true;
          }
        }
        else if(lastPoint.id === pointId){
          const d = Math.sqrt( Math.pow(point.x - firstPoint.x, 2) +  Math.pow(point.y - firstPoint.y, 2))
          if(d < pointRadius){
            return true;
          }
        }
        return false;
    }

    joinExtremePoints(){
        this.path.splice(this.path.length - 1, 1);
        this.pathIsClose = true;
        this.selectedPointId = null;
    }

    onRemovePointMode():boolean{
        return this.linePointMode === LinePointMode.RemovePointNoJoin || this.linePointMode === LinePointMode.RemovePointThenJoin;
    }

    toDefaultMode(){
        this.linePointMode = this.defaultLinePointMode;
    }
    
    override clone():Line{
        // path:Point[];
        // pathIsClose:boolean = false;
        // defaultLinePointMode:LinePointMode = LinePointMode.MovePoint;
        // linePointMode:LinePointMode = this.defaultLinePointMode;
        // // selectedPointIndex:number | null = null;
        // selectedPointId:string | null = null;
        // addPointSession:AddPointSession | null = null;
        // // pointIndexCursorIsOver:number | null = null;
        // pointIdCursorIsOver:string | null = null;
        // pointIdPointingDownOn:string | null = null;
        // pointRadius = 20;
        // memoizedMoveOrAddMode:LinePointMode = this.defaultLinePointMode;
        // width:number;

        return this;
    }

    cloneLinePath(): Point[]{
        return this.path.map(p => new Point(p.id, p.x, p.y));
    }

    override setSelected(selected:boolean){
        this.selected = selected;
        if(!selected){
            this.selectedPointId = null;
        //     if(this.linePointMode != LinePointMode.RemovePointNoJoin && this.linePointMode != LinePointMode.RemovePointThenJoin) return;
        //     this.linePointMode = this.defaultLinePointMode;
        }
    }
}

// export class Wall extends Line {
//     typeName: PlanElementTypeName = PlanElementTypeName.Wall;

//     override clone():Wall{
//         // path:Point[];
//         // pathIsClose:boolean = false;
//         // defaultLinePointMode:LinePointMode = LinePointMode.MovePoint;
//         // linePointMode:LinePointMode = this.defaultLinePointMode;
//         // // selectedPointIndex:number | null = null;
//         // selectedPointId:string | null = null;
//         // addPointSession:AddPointSession | null = null;
//         // // pointIndexCursorIsOver:number | null = null;
//         // pointIdCursorIsOver:string | null = null;
//         // pointIdPointingDownOn:string | null = null;
//         // pointRadius = 20;
//         // memoizedMoveOrAddMode:LinePointMode = this.defaultLinePointMode;
//         // width:number;


//         const lineClone:Wall = new Wall(this.id, this.cloneLinePath(), this.width);
//         lineClone.pathIsClose = this.pathIsClose;
//         lineClone.selected = this.selected;
//         // lineClone.linePointMode = this.linePointMode;
//         lineClone.selectedPointId = this.selectedPointId;
//         lineClone.pointIdCursorIsOver = this.pointIdCursorIsOver;
//         lineClone.pointIdPointingDownOn = this.pointIdPointingDownOn;
//         // lineClone.memoizedMoveOrAddMode = this.memoizedMoveOrAddMode;
//         return lineClone;
//     }
// }

class AddPointSession{
    lineId:string;
    startPointId:string;
    // pointIndexCursorIsOver:number | null = null;
    // active:boolean= false; //when cursor is over a point, the addPointSession becomes unactive so we can click on that point

    constructor(lineId:string, startPointId:string){
        this.lineId = lineId;
        this.startPointId = startPointId;
    }
}

export class DblClick {
    secondClickMaxDelay: number = 200;
    click: number = 0;

    start(){
        this.click = 1;
        setTimeout(()=>{
            this.end();
        },this.secondClickMaxDelay);
    }
    end(){
        this.click = 0;
    }
}


export class PlanElementsRecordsHandler{
    records: PlanElement[][] = [[]];
    currentRecordIndex: number = 0;
    clone():PlanElementsRecordsHandler {
        const planElementsRecordsHandlerClone = new PlanElementsRecordsHandler();
        planElementsRecordsHandlerClone.currentRecordIndex = this.currentRecordIndex;
        planElementsRecordsHandlerClone.records = this.records.map(planElements => PlanElementsHelper.clone(planElements));
        return planElementsRecordsHandlerClone;
    }
}

export class PlanPointerUpActionsHandler{
    elementIdOnPointerDown: string | null = null;
    lineIdPointIdOnPointerDown: [string, string] | null = null;
    dragEndLineIdPointId: [string, string] | null = null;
    addSessionLineId: string | null = null;
    
    // constructor(
    //     elementIdOnPointerDown:string | null,  
    //     lineIdPointIdOnPointerDown:[string, string] | null ,
    //     dragEndLineIdPointId:[string, string] | null,
    //     addSessionLineId:string | null,
    //     ){
    //     this.elementIdOnPointerDown = elementIdOnPointerDown;
    //     this.lineIdPointIdOnPointerDown = lineIdPointIdOnPointerDown;
    //     this.dragEndLineIdPointId = dragEndLineIdPointId;
    //     this.addSessionLineId = addSessionLineId;

    // }
    clone(planPointerUpActionsHandler:PlanPointerUpActionsHandler): PlanPointerUpActionsHandler{
        const planPointerUpActionsHandlerClone = new PlanPointerUpActionsHandler();
        planPointerUpActionsHandlerClone.elementIdOnPointerDown = planPointerUpActionsHandler.elementIdOnPointerDown;
        planPointerUpActionsHandlerClone.lineIdPointIdOnPointerDown = planPointerUpActionsHandler.lineIdPointIdOnPointerDown;
        planPointerUpActionsHandlerClone.dragEndLineIdPointId = planPointerUpActionsHandler.dragEndLineIdPointId;
        planPointerUpActionsHandlerClone.addSessionLineId = planPointerUpActionsHandler.addSessionLineId;
        return planPointerUpActionsHandlerClone;
    }
}


export class IconData{
    fileName:string;
    dimensions:Dimensions;
  
    constructor(fileName:string, dimensions:Dimensions){
      this.fileName = fileName;
      this.dimensions = dimensions;
    }
  }
  
export const iconDataArr:IconData[] = [
    new IconData("wall.png", new Dimensions(50,50)),
    new IconData("alim-eau-pot.png", new Dimensions(50,50)),
    new IconData("canal-eau-pluv.png", new Dimensions(50,50)),
    new IconData("canal-eau-use.png", new Dimensions(50,50)),
    new IconData("compass.png", new Dimensions(50,50)),
    new IconData("compt-eau.png", new Dimensions(50,50)),
    new IconData("add-el.png", new Dimensions(50,50)),
    new IconData("add-point.png", new Dimensions(50,50)),
    new IconData("del-el.png", new Dimensions(50,50)),
    new IconData("del-point.png", new Dimensions(50,50)),
    new IconData("del-seg.png", new Dimensions(50,50)),
    new IconData("eau-pluv.png", new Dimensions(50,50)),
    new IconData("fosse.png", new Dimensions(50,50)),
    new IconData("gout.png", new Dimensions(50,50)),
    new IconData("move.png", new Dimensions(50,50)),
    new IconData("puit.png", new Dimensions(50,50)),
    new IconData("regards.png", new Dimensions(50,50)),
    new IconData("text.png", new Dimensions(50,50)),
    new IconData("vanne-aep.png", new Dimensions(50,50)),
    new IconData("arrow-prev.png", new Dimensions(50,50)),
    new IconData("arrow-next.png", new Dimensions(50,50)),
    new IconData("magnet.png", new Dimensions(50,50)),

  ];

  export class JoinedWalls extends PlanElement {
    nodes: {[nodeId: string]: WallNode;};
    walls: {[id:string]:Wall;};
    width: number = WALL_WIDTH;
    color: string = "grey";
    selectedWallId:string | null = null;
    farthestNodes:WallNode[] = [];

    constructor(id: string, nodes: {[nodeId: string]: WallNode;}){
        super(id, PlanElementTypeName.JoinedWalls);
        this.nodes = nodes;
        this.walls = this.getWalls();
    }

    addNode(node:WallNode){
        for(const linkedNode of node.linkedNodes){
            if(linkedNode.linkedNodes.find(iterLinkedNode => iterLinkedNode.id === node.id)) continue;
            linkedNode.linkedNodes.push(node);
        }
        this.nodes[node.id] = node;
    }

    sortNodesByIdInAlphabeticOrder(nodes:[WallNode, WallNode]) {
        (nodes as [WallNode, WallNode]).sort((a, b) => { 
            const sortedIds = [a.id, b.id].sort();
            const aIdIndex = sortedIds.findIndex(id => id === a.id);
            const bIdIndex = sortedIds.findIndex(id => id === b.id);
            return aIdIndex - bIdIndex;
        });
    }

    getWalls(): {[id:string]:Wall;} {
        const walls: {[id:string]:Wall;} = {};
        const segmentsDone: {[id: string]: boolean;} = {};
        
        for(const nodeId in this.nodes){
            const node = this.nodes[nodeId];
            for(const linkedNode of node.linkedNodes){
                const sortedNodesById:[WallNode, WallNode] = [node, linkedNode];
                this.sortNodesByIdInAlphabeticOrder(sortedNodesById);
                const sortedConcatenatedIds = sortedNodesById[0].id + sortedNodesById[1].id;
                if(segmentsDone[sortedConcatenatedIds]) continue;
                walls[sortedConcatenatedIds] = (new Wall([sortedNodesById[0], sortedNodesById[1]]));
                segmentsDone[sortedConcatenatedIds] = true;
            }
        }





        //walls may have some data binded like a numero we need to copy it:
        for(const wallId in this.walls){
            if(walls.hasOwnProperty(wallId)){
                walls[wallId].numero = this.walls[wallId].numero;
            }
        }

        // //if a node is between two nodes and the three nodes are aligned (so two walls in total) then the node is useless
        // //we remove the node and simplify the two aligned walls into a single wall


        // //if two walls are aligned and share a node
        // //if true if this node has only two linked nodes (so one in each wall) then we remove it and join the two extreme nodes


        // const alignedWalls: Wall[][]= [];

        // const visitedWalls: {[wallId: string]: boolean;} = {};

        // for(const wallId in walls){
        //     if(visitedWalls.hasOwnProperty(wallId)) continue;
        //     const wall = walls[wallId];
        //     const wallNode1 = wall.nodes[0];
        //     const wallNode2 = wall.nodes[1];

            
        //     visitedWalls[wallId] = true;

        // }

        // //END CHATGPT

        return walls;
    }

    setWalls(){
        this.walls = this.getWalls();
    }

    cleanWalls(){
        this.setWalls();
        const walls = this.walls;


        // //CHATGPT




        interface Point {
            x: number;
            y: number;
          }
          
          interface Segment {
            node1: { point: Point };
            node2: { point: Point };
          }
          
          function calculateSlope(p1: Point, p2: Point): number {
            if (p1.x === p2.x) {
              // Handle vertical line case to avoid division by zero
              return Infinity;
            }
            // console.log("p2.y - p1.y", p2.y - p1.y)

            return (p2.y - p1.y) / (p2.x - p1.x);
          }


        function groupAlignedWalls(walls:Wall[]): Wall[][]{
            const alignedWalls: Wall[][] = [];

            const tolerance = 0.05;
            for (const wall of walls) {
                let foundNewGroup = false;
            
                for (const group of alignedWalls) {
                    const referenceWall = group[0];

                    const referenceWallSlope = calculateSlope(referenceWall.nodes[0].position, referenceWall.nodes[1].position);
                    const wallSlope = calculateSlope(wall.nodes[0].position, wall.nodes[1].position);
                    
                    // console.log("referenceWallSlope", referenceWallSlope)
                    // console.log("wallSlope", wallSlope)

                    if(
                        (referenceWallSlope === Infinity && wallSlope === Infinity)
                        ||
                        (Math.abs(Math.abs(wallSlope) - Math.abs(referenceWallSlope)) < tolerance)
                        ){
                        // console.log("foundNewGroup !!");
                        foundNewGroup = true;
                        group.push(wall);
                        break;
                    }
                }

                if (!foundNewGroup) {
                    alignedWalls.push([wall]);
                }
                // console.log("")

            }



            return alignedWalls;
        }
          

        let wallsArr: Wall[] = [];

        for(const wallId in walls){
            wallsArr.push(walls[wallId]);
        }


        const alignedWallsGroups = groupAlignedWalls(wallsArr);

        // console.log("")
        // console.log("")












        // function groupSegmentsByDirection(segments: Wall[]): Wall[][] {
        //     const groupedSegments: Wall[][] = [];
        //     const directions: { [key: string]: Wall[] } = {};
          
        //     for (const segment of segments) {
        //       const direction = calculateDirection(segment);
          
        //       if (direction in directions) {
        //         directions[direction].push(segment);
        //       } else {
        //         directions[direction] = [segment];
        //       }
        //     }
          
        //     for (const directionSegments of Object.values(directions)) {
        //       groupedSegments.push(directionSegments);
        //     }
          
        //     return groupedSegments;
        //   }
          
        //   function calculateDirection(segment: Wall): string {
        //     const node1 = segment.nodes[0];
        //     const node2 = segment.nodes[1];
          
        //     const deltaX = node2.position.x - node1.position.x;
        //     const deltaY = node2.position.y - node1.position.y;
          
        //     let slope: number;
        //     let direction: number;
          
        //     if (deltaX !== 0) {
        //       slope = deltaY / deltaX;
        //       direction = Math.atan2(deltaY, deltaX);
        //     } else {
        //       // Special case for vertical direction
        //       slope = Infinity;
        //       direction = Math.PI / 2; // 90 degrees
        //     }
          
        //     return `${slope}:${direction}`;
        //   }



        
        function findFarthestNodes(nodes: WallNode[]): [WallNode, WallNode] | null {
            if (nodes.length < 2) {
            return null; // Not enough points to find a pair
            }
        
            let maxDistance = 0;
            let farthestPoints: [WallNode, WallNode] | null = null;
        
            for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = getDistance(nodes[i].position, nodes[j].position);
                if (distance > maxDistance) {
                maxDistance = distance;
                farthestPoints = [nodes[i], nodes[j]];
                }
            }
            }
        
            return farthestPoints;
        }


        // type Segment = [string, string];
        // type Chain = Wall[];

        function findChainedWalls(walls: Wall[]): Wall[][] {
        const chains: Wall[][] = [];
        const visited: boolean[] = Array(walls.length).fill(false);

        function dfs(wall: Wall, chain: Wall[]): void {
            const nodeA = wall.nodes[0];
            const nodeB = wall.nodes[1];
            chain.push(wall);
            visited[walls.indexOf(wall)] = true;

            const nextSegments = walls.filter(
            (w) =>
                (w.nodes[0] === nodeA || w.nodes[1] === nodeA || w.nodes[0] === nodeB || w.nodes[1] === nodeB) &&
                !visited[walls.indexOf(w)]
            );

            for (const nextSegment of nextSegments) {
            dfs(nextSegment, chain);
            }
        }

        for (const wall of walls) {
            if (!visited[walls.indexOf(wall)]) {
            const chain: Wall[] = [];
            dfs(wall, chain);
            chains.push(chain);
            }
        }

        return chains;
        }

        this.farthestNodes = [];

        let updateWalls = false;

        // const chainedWallsGroupsInsideEachAlignedWallsGroup:Wall[][][] = []; 
        for(const alignedWallsGroup of alignedWallsGroups){
            // console.log("alignedWallsGroup.length", alignedWallsGroup.length)

            if(alignedWallsGroup.length>1){
                const alignedAndChainedWallsGroups = findChainedWalls(alignedWallsGroup);
                // console.log("chainedWallsGroups.length inside alignedWallsGroup", chainedWallsGroups.length)
                // chainedWallsGroupsInsideEachAlignedWallsGroup.push(chainedWallsGroups);


                // const wallsAlignedAndSameDirectionGroups:Wall[] = [];
                for(const alignedAndChainedWallsGroup of alignedAndChainedWallsGroups){
                    //final part: find walls with nodes in successive position
                    // console.log("alignedAndChainedWallsGroup", alignedAndChainedWallsGroup);
                    // console.log("alignedAndChainedAndSameDirectionGroups.length", alignedAndChainedAndSameDirectionGroups.length);

                    const nodesObj:{[nodeId:string]:WallNode;} = {};
                    for(const w of alignedAndChainedWallsGroup){
                        nodesObj[w.nodes[0].id] = w.nodes[0];
                        nodesObj[w.nodes[1].id] = w.nodes[1];
                    }

                    const nodes:WallNode[] = [];

                    for(const nodeId in nodesObj){
                        nodes.push(nodesObj[nodeId]);
                    }

                    const farthestNodes = findFarthestNodes(nodes);
                    // console.log("farthestNodes.length", farthestNodes?.length);
                    if(farthestNodes){
                        const nodesToDelete = nodes.filter(n =>{
                            if(!(n.id != farthestNodes[0].id && n.id != farthestNodes[1].id)) return false;
                            for(const linkedNode of n.linkedNodes){
                                const found = nodes.find(m => m.id === linkedNode.id);
                                if(!found) return false;
                            }

                            //at this point we know the node will be delete so we remove it from linkedNodes of farthestNodes
                            for(let i=0; i<2; i++){
                                const farthestNode = farthestNodes[i];
                                for(let j=0; j<farthestNode.linkedNodes.length; j++){
                                    if(farthestNode.linkedNodes[j].id === n.id){
                                        farthestNode.linkedNodes.splice(j, 1);
                                        // console.log('OK DELETE')
                                    }   
                                }
                            }
    
                            return true;
                            });
                        // this.farthestNodes = this.farthestNodes.concat(nodesToDelete);

                        if(nodesToDelete.length){
                            updateWalls = true;
                            for(let i=0; i<2; i++){
                                const farthestNode = farthestNodes[i];
                                const otherFarthestNode = farthestNodes[i==0 ? 1:0];
                                const found = farthestNode.linkedNodes.find(n => n.id === otherFarthestNode.id);
                                if(found) continue;
                                farthestNode.linkedNodes.push(otherFarthestNode);
                            }
                        }

                        for(const nodeToDelete of nodesToDelete){
                            delete this.nodes[nodeToDelete.id];
                        }
                    }
                }
            }
        }
        if(updateWalls) this.setWalls();

    }

    setWallsPoints() {    
        const wallsJointPoints: {[id:string]: [Position[], Position[]]} = {};

        for(const nodeId in this.nodes){
            const node = this.nodes[nodeId];
            const sortedLinkedNodes = node.getClockwiseSortedLinkedNodes();
            const segments:Wall[] = []
            for(const linkedNode of sortedLinkedNodes){
                segments.push(new Wall([node, linkedNode]));
            }

            for(let i=0; i<segments.length; i++){
                const seg = segments[i];
                const offset = 1;
                const minimumValue = 0;
                const modulus = segments.length;
                const nextSegIndex = (i - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
                const prevSegIndex = i > 0? i - 1 : segments.length - 1;
        
                const nextSeg = segments[nextSegIndex];
                const prevSeg = segments[prevSegIndex];

                let sl:[Position, Position] = seg.sideline2Points;
                const nextSegSl:[Position, Position] = nextSeg.sideline1Points;
        
                let l1p1 = sl[0];
                let l1p2 = sl[1];
        
                let l2p1 = nextSegSl[0];
                let l2p2 = nextSegSl[1];
        
                let m1 = l1p2.x - l1p1.x != 0 ? (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x) : BIG_NUMBER;
                m1 = parseFloat(m1.toPrecision(PRECISION));
                let m2 = l2p2.x - l2p1.x != 0 ? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(PRECISION));

                let b1 = l1p1.y - m1 * l1p1.x;
                let b2 = l2p1.y - m2 * l2p1.x;

                let intersectionPointWithNextSegLine:Position;

                if(m1 - m2 != 0){
                    let x = (b2 - b1) / (m1 - m2);
                    let y = m1 * x + b1;
                    intersectionPointWithNextSegLine = new Position(x, y);
                }
                else{
                    
                    const p = node.position;
                    const slope = m1;
                    let b = b1;
                    const orthogonalSlope = slope != 0 ? -1 / slope : BIG_NUMBER; // Calculate the slope of the orthogonal line
                    const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
                    const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
                    const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection
                    intersectionPointWithNextSegLine = new Position(projectionX, projectionY);
                }

                //prev point intersection
        
                sl = seg.sideline1Points;
                const prevSegSl:[Position, Position] = prevSeg.sideline2Points;
        
                l1p1 = sl[0];
                l1p2 = sl[1];
        
                l2p1 = prevSegSl[0];
                l2p2 = prevSegSl[1];
        

                m1 = l1p2.x - l1p1.x != 0? (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x) : BIG_NUMBER;
                m1 = parseFloat(m1.toPrecision(PRECISION));
                m2 = l2p2.x - l2p1.x != 0? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(PRECISION));
        
                b1 = l1p1.y - m1 * l1p1.x;
                b2 = l2p1.y - m2 * l2p1.x;
        
    
                // x = m1 - m2 != 0 ? (b2 - b1) / (m1 - m2) : BIG_NUMBER;
                // y = m1 * x + b1;
        
                // const intersectionPointWithPreviousSegLine = new Position(x, y);


                let intersectionPointWithPreviousSegLine:Position;

                if(m1 - m2 != 0){
                    let x = (b2 - b1) / (m1 - m2);
                    let y = m2 * x + b2;
                    intersectionPointWithPreviousSegLine = new Position(x, y);
                }
                else{

                    const p = node.position;
                    const slope = m2;
                    let b = b2;
                    const orthogonalSlope = slope != 0 ? -1 / slope : BIG_NUMBER; // Calculate the slope of the orthogonal line
                    const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
                    const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
                    const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection
                    intersectionPointWithPreviousSegLine = new Position(projectionX, projectionY);
                }


                // console.log("\n\n")


                const p1 = seg.sideline1Points[0];
                const p2 = seg.sideline1Points[1];
                const p3 = seg.sideline2Points[1];
                const p4 = seg.sideline2Points[0];
        
        
        
                //check if segment position is valid, if not valid segment appears simply with its 4 points
                //position is valid if the farthest segment intersects prev and next side segments
        
        
                let isValid = true;
                //draw for testing
        
                const prevSegClosestSidePoints = prevSeg.sideline2Points;
                const nextSegClosestSidePoints = nextSeg.sideline1Points;
                const segBase = [p2 , p3];
                const prevSegBase = [prevSeg.sideline1Points[1], prevSeg.sideline2Points[1]];
                const nextSegBase = [nextSeg.sideline1Points[1], nextSeg.sideline2Points[1]];
        
                const segSideClosestToPrevSegSide = [p1 , p2];
                const segSideClosestToNextSegSide = [p3 , p4];
        
        
                const segBaseFormated = {
                    "p1": {"x":segBase[0].x, "y":segBase[0].y}, 
                    "p2": {"x":segBase[1].x, "y":segBase[1].y}, 
                };
                const segSideClosestToPrevSegSideFormated = {
                    "p1": {"x":segSideClosestToPrevSegSide[0].x, "y":segSideClosestToPrevSegSide[0].y}, 
                    "p2": {"x":segSideClosestToPrevSegSide[1].x, "y":segSideClosestToPrevSegSide[1].y}, 
                };
        
                const segSideClosestToNextSegSideFormated = {
                    "p1": {"x":segSideClosestToNextSegSide[0].x, "y":segSideClosestToNextSegSide[0].y}, 
                    "p2": {"x":segSideClosestToNextSegSide[1].x, "y":segSideClosestToNextSegSide[1].y}, 
                };
        
        
                const prevSegBaseFormated = {
                    "p1": {"x":prevSegBase[0].x, "y":prevSegBase[0].y}, 
                    "p2": {"x":prevSegBase[1].x, "y":prevSegBase[1].y}, 
                };
                const prevSegClosestSidePointsFormated = {
                    "p1": {"x":prevSegClosestSidePoints[0].x, "y":prevSegClosestSidePoints[0].y}, 
                    "p2": {"x":prevSegClosestSidePoints[1].x, "y":prevSegClosestSidePoints[1].y}, 
                };
        
                const nextSegBaseFormated = {
                    "p1": {"x":nextSegBase[0].x, "y":nextSegBase[0].y}, 
                    "p2": {"x":nextSegBase[1].x, "y":nextSegBase[1].y}, 
                };
                const nextSegClosestSidePointsFormated = {
                    "p1": {"x":nextSegClosestSidePoints[0].x, "y":nextSegClosestSidePoints[0].y}, 
                    "p2": {"x":nextSegClosestSidePoints[1].x, "y":nextSegClosestSidePoints[1].y}, 
                };
        
        
                if(
                    doSegmentsIntersect(segBaseFormated, prevSegClosestSidePointsFormated) 
                    || doSegmentsIntersect(segBaseFormated, nextSegClosestSidePointsFormated)
                    || doSegmentsIntersect(prevSegBaseFormated, segSideClosestToPrevSegSideFormated)
                    || doSegmentsIntersect(nextSegBaseFormated, segSideClosestToNextSegSideFormated)
        
                    ){
                    isValid = false;
                }
                
 
                const jointPointsNode1: Position[] = [];
                const jointPointsNode2: Position[] = [p2, p3]; //Node2 is linked Node 

                if(isValid){
        
                    const pi1 = intersectionPointWithNextSegLine;
                    const pi2 = intersectionPointWithPreviousSegLine;
                    
                    jointPointsNode1.push(pi1.x === BIG_NUMBER ? p4 : pi1, pi2.x === BIG_NUMBER ? p1 : pi2, node.position);
                }
                else{ //if not valid (superposition with other segments)
                    jointPointsNode1.push(p1, p4);
                }
            
                const wallJointPoints:[Position[], Position[]] = [jointPointsNode1, jointPointsNode2];
                wallsJointPoints[seg.nodes[0].id+"_"+seg.nodes[1].id] = wallJointPoints;
            }
        }


        const memo: {[id:string]: boolean} = {};
        
        for(const wallJointPointsId in wallsJointPoints){
            let points:Position[] = [];

            const wallJointPoints = wallsJointPoints[wallJointPointsId];
            const nodesIds = wallJointPointsId.split('_');

            if(nodesIds.length != 2) continue; //todo : throw error

            const reverseWallJointPointsId = nodesIds[1] + "_" + nodesIds[0];
            if(memo.hasOwnProperty(reverseWallJointPointsId)) continue; //already done

            points = points.concat(wallJointPoints[0]);

            if(wallsJointPoints.hasOwnProperty(reverseWallJointPointsId)){
                points = points.concat(wallsJointPoints[reverseWallJointPointsId][0]);                
            }
            else{
                points = points.concat(wallJointPoints[1]);
            }
            memo[wallJointPointsId] = true;

            sortPointsClockwise(points);

            const sortedNodeIds = [this.nodes[nodesIds[0]].id, this.nodes[nodesIds[1]].id].sort();
            const wallId = sortedNodeIds[0] + sortedNodeIds[1];

            this.walls[wallId].points = points;

        }
    }



    selectWall(wallId:string){
        // if(this.wallIsSelected(nodesIds) != null) return;
        this.selectedWallId = wallId;
    }
    unselectWall(){
        this.selectedWallId = null;
        // const selectedWallIndex = this.wallIsSelected(nodesIds);
        // if(selectedWallIndex === null) return;
        // this.selectedWallNodesIds.splice(selectedWallIndex, 1);
        // console.log("unselectWall selectedWallIndex", selectedWallIndex);

    }
    wallIsSelected(wallId:string):boolean{ //returns the index of wall if selected
        return this.selectedWallId === wallId;
    }

    addWallFromWall(startingWall:Wall, nodesPositions:[Vector2D, Vector2D]):[Wall, WallNode]{
        const startingWallNode1 = startingWall.nodes[0];
        const startingWallNode2 = startingWall.nodes[1];

        //nodesPositions[0] is the point on wallNode1-wallNode2 segment

        const newWallNode1 = new WallNode(v4(), nodesPositions[0], []);
        const newWallNode2 = new WallNode(v4(), nodesPositions[1], []);

        newWallNode1.linkedNodes = newWallNode1.linkedNodes.concat([startingWallNode1, startingWallNode2, newWallNode2]);
        newWallNode2.linkedNodes = newWallNode2.linkedNodes.concat([newWallNode1]);

        const startingWallNode1Node1UpdatedLinkedNodes = startingWallNode1.linkedNodes.filter(node => node.id != startingWallNode2.id);
        const startingWallNode2UpdatedLinkedNodes = startingWallNode2.linkedNodes.filter(node => node.id != startingWallNode1.id);

        startingWallNode1Node1UpdatedLinkedNodes.push(newWallNode1);
        startingWallNode2UpdatedLinkedNodes.push(newWallNode1);

        startingWallNode1.linkedNodes = startingWallNode1Node1UpdatedLinkedNodes;
        startingWallNode2.linkedNodes = startingWallNode2UpdatedLinkedNodes;


        this.nodes[newWallNode1.id] = newWallNode1;
        this.nodes[newWallNode2.id] = newWallNode2;

        this.setWalls();
        
        const sortedNodesIds = [newWallNode1.id, newWallNode2.id].sort();

        return [this.walls[sortedNodesIds[0] + sortedNodesIds[1]], newWallNode2];
    }

    addWallFromNode(startingNode:WallNode, endingNodePosition:Vector2D):[Wall, WallNode]{
        const endingNode = new WallNode(v4(), endingNodePosition, [startingNode]);
        startingNode.linkedNodes.push(endingNode);
        this.nodes[endingNode.id] = endingNode;
        this.setWalls();
        const sortedNodesIds = [startingNode.id, endingNode.id].sort();
        return [this.walls[sortedNodesIds[0] + sortedNodesIds[1]], endingNode];
    }

    addWallFromVoid(startingNodePosition:Vector2D, endingNodePosition:Vector2D):[Wall, WallNode]{
        const startingNode = new WallNode(v4(), startingNodePosition, []);
        const endingNode = new WallNode(v4(), endingNodePosition, [startingNode]);
        startingNode.linkedNodes.push(endingNode);
        this.nodes[startingNode.id] = startingNode;
        this.nodes[endingNode.id] = endingNode;
        this.setWalls();
        const sortedNodesIds = [startingNode.id, endingNode.id].sort();
        return [this.walls[sortedNodesIds[0] + sortedNodesIds[1]], endingNode];
    }
    getNodeOrWallPenetratedByPoint(p:Vector2D, penetratingNode:WallNode):WallNode | Wall | null{

        //must be ignored : linked nodes, linked nodes of linked nodes, and walls joigning these nodes.
        const nodeIdsToIgnore:{[nodeId:string]:boolean;} = {};
        const linkedNodesOfPenetratingNode:{[nodeId:string]:boolean;} = {};

        for(const n1 of penetratingNode.linkedNodes){
            nodeIdsToIgnore[n1.id] = true;
            linkedNodesOfPenetratingNode[n1.id] = true;
            for(const n2 of n1.linkedNodes){
                nodeIdsToIgnore[n2.id] = true;
            }
        }
    
        const visitedNodes: {[nodeId:string]:boolean;} = {};

        for(const wallId in this.walls){
            const wall = this.walls[wallId];

            //check nodes
            const node1 = wall.nodes[0];
            const node2 = wall.nodes[1];

            if(!nodeIdsToIgnore.hasOwnProperty(node1.id) && !visitedNodes.hasOwnProperty(node1.id)){
                if(getDistance(node1.position, p) < node1.radius) return node1;
                visitedNodes[node1.id] = true;
            }
            if(!nodeIdsToIgnore.hasOwnProperty(node2.id) && !visitedNodes.hasOwnProperty(node2.id)){
                if(getDistance(node2.position, p) < node2.radius) return node2;
                visitedNodes[node2.id] = true;
            }
            //check wall
            if(
                (
                    nodeIdsToIgnore.hasOwnProperty(wall.nodes[0].id) 
                    && nodeIdsToIgnore.hasOwnProperty(wall.nodes[1].id)
                ) 
                &&
                (
                    linkedNodesOfPenetratingNode.hasOwnProperty(wall.nodes[0].id) 
                    || linkedNodesOfPenetratingNode.hasOwnProperty(wall.nodes[1].id)
                )
            ) continue;

            if(isPointInPolygon(p, wall.points)){
                return wall;
            }
            
        }
        return null;
    }

    joinNodes(node1:WallNode, node2:WallNode){
        // const wallsFromNode2AndItsLinkedNodes:Wall[] = [];

        for(const linkedNode of node2.linkedNodes){
            node1.linkedNodes.push(linkedNode); //no need to check if already has linkedNode it's theorically impossible
            linkedNode.linkedNodes.push(node1);

            const linkedNodeNode2Idx = linkedNode.linkedNodes.findIndex((node) => node.id === node2.id);
            linkedNode.linkedNodes.splice(linkedNodeNode2Idx, 1);


            //the reaffectation of wall ids is done in setWalls(), but if we don't do this before setWalls(),
            //there will be a problem with data binded to wall like numero
            //because setWalls depends on walls ids, which depends on node ids
            //yet we change nodes and then node ids here so we need to make a temporary fix
            //before the calling of setWalls()

            const sortedNode2LinkedNodeIds = [linkedNode.id, node2.id].sort();
            const concatSortedNode2LinkedNodeIds = sortedNode2LinkedNodeIds[0] + sortedNode2LinkedNodeIds[1];

            const wallFromNode2AndItsLinkedNode = this.walls[concatSortedNode2LinkedNodeIds];

            const sortedNode1LinkedNodeIds = [linkedNode.id, node1.id].sort();
            const concatSortedNode1LinkedNodeIds = sortedNode1LinkedNodeIds[0] + sortedNode1LinkedNodeIds[1];

            wallFromNode2AndItsLinkedNode.id = concatSortedNode1LinkedNodeIds;

            this.walls[concatSortedNode1LinkedNodeIds] = wallFromNode2AndItsLinkedNode;

            delete this.walls[concatSortedNode2LinkedNodeIds];
        }

        delete this.nodes[node2.id];

        this.setWalls();
    }

    joinDraggedNodeAndCreatedNodeOnWall(node:WallNode, wall:Wall){
        const wallNode1 = wall.nodes[0];
        const wallNode2 = wall.nodes[1];

        node.linkedNodes.push(wallNode1); //no need to check if already has wallNode1 it's theorically impossible
        node.linkedNodes.push(wallNode2); //no need to check if already has wallNode2 it's theorically impossible
        wallNode1.linkedNodes.push(node); //no need to check if already has node it's theorically impossible
        wallNode2.linkedNodes.push(node); //no need to check if already has node it's theorically impossible

        const linkedNodeWallNode2Idx = wallNode1.linkedNodes.findIndex((node) => node.id === wallNode2.id);
        wallNode1.linkedNodes.splice(linkedNodeWallNode2Idx, 1);
        const linkedNodeWallNode1Idx = wallNode2.linkedNodes.findIndex((node) => node.id === wallNode1.id);
        wallNode2.linkedNodes.splice(linkedNodeWallNode1Idx, 1);

        this.setWalls();
    }

    override unselect(){
        this.setSelected(false);
        this.unselectWall();
    }


    override clone():JoinedWalls{



        // nodes: {[nodeId: string]: WallNode;};
        // width: number = WALL_WIDTH;
        // color: string = "grey";
        // selectedWallNodesIds:[string, string][] = []; 


        const cloneNodes: {[nodeId: string]: WallNode;} = {};
        for(const nodeId in this.nodes){
            const nodeClone = this.nodes[nodeId].cloneWithoutLinkedNodes();
            cloneNodes[nodeId] = nodeClone;
        }

        //set linkedNodes for cloned nodes
        for(const nodeId in cloneNodes){
            const linkedNodesIds:string[] = this.nodes[nodeId].linkedNodes.map(node => node.id);
            for(const linkedNodeId of linkedNodesIds){
                cloneNodes[nodeId].linkedNodes.push(cloneNodes[linkedNodeId]);
            }
        }

        const cloneWalls: {[nodeId: string]: Wall;} = {};
        for(const wallId in this.walls){
            const wallToClone = this.walls[wallId];
            const wallClone = this.walls[wallId].cloneWithoutNodes();
            wallClone.nodes = [cloneNodes[wallToClone.nodes[0].id], cloneNodes[wallToClone.nodes[1].id]];
            cloneWalls[wallId] = wallClone;
        }

        const jwClone:JoinedWalls = new JoinedWalls(this.id, cloneNodes);
        jwClone.walls = cloneWalls;
        
        // for(const nodeIds of this.selectedWallNodesIds){
        //     jwClone.selectedWallNodesIds.push([nodeIds[0], nodeIds[1]]);
        // }

        jwClone.selectedWallId = this.selectedWallId;
        return jwClone;
    }

    override delete(wallId:string){
        const wall = this.walls[wallId];

        for(let i=0; i<wall.nodes.length; i++){
            const node = wall.nodes[i];
            const secondWallNode = wall.nodes[i == 0? 1 : 0];
            const linkedNodeSecondWallNodeIdx = node.linkedNodes.findIndex((n) => n.id === secondWallNode.id);
            node.linkedNodes.splice(linkedNodeSecondWallNodeIdx, 1);
            if(!node.linkedNodes.length){
                delete this.nodes[node.id];
            }
        }
        
        this.cleanWalls();
    }
  }

export class WallNode {
    id: string;
    position: Position;
    linkedNodes: WallNode[];
    radius: number = WALL_WIDTH / 2;

    constructor(id:string, position:Position, linkedNodes:WallNode[]){
        this.id = id;
        this.position = position;
        this.linkedNodes = linkedNodes;
    }

    getSegmentsJoinedWithNode(){
        const segments: Wall[] = [];
        for(const linkedNode of this.linkedNodes){
            segments.push(new Wall([this, linkedNode]));
        }
        return segments;
    }

    getClockwiseSortedSegment(): Wall[]{
        const segments: Wall[] = this.getSegmentsJoinedWithNode();
        const angles: [Wall, number][] = [];

        for(const seg of segments){
            // console.log("seg.nodes[0].id = "+ seg.nodes[0].id +", seg.nodes[1].id = "+ seg.nodes[1].id)

            const p1: Position = seg.nodes[0].position;
            const p2: Position = seg.nodes[1].position;

            const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            angles.push([seg, p1p2Angle]);
            // console.log("node.id = "+ node.id +", p1p2Angle = "+p1p2Angle+"\n\n\n")

        }

        return angles.sort((v1, v2) => v1[1] - v2[1]).map(v => v[0]);
    }

    getClockwiseSortedLinkedNodes(): WallNode[]{
        const angles: [WallNode, number][] = [];

        for(const linkedNode of this.linkedNodes){
            const p1: Position = this.position;
            const p2: Position = linkedNode.position;

            const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            angles.push([linkedNode, p1p2Angle]);
        }
        return angles.sort((v1, v2) => v1[1] - v2[1]).map(v => v[0]);
    }

    // getReflexAngleLinkedNodes(): [WallNode, WallNode] | null{
    //     const clockwiseSortedSegments: Segment[] = this.getClockwiseSortedSegment();

    //     for(let i=0; i < clockwiseSortedSegments.length; i++){
    //         const offset = 1;
    //         const minimumValue = 0;
    //         const modulus = clockwiseSortedSegments.length;
    //         const nextSegIndex = (i - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
    
    //         // console.log("nextSegIndex = ",nextSegIndex);


    //         //determining adding before or after startingFromPoint
    //         const p0 = this.position;
    //         const p1 = clockwiseSortedSegments[i].nodes[1].position;
    //         const p2 = clockwiseSortedSegments[nextSegIndex].nodes[1].position;
    
    //         // console.log("p1.x = "+p1.x+", p1.y = "+p1.y);
    //         // console.log("p2.x = "+p2.x+", p2.y = "+p2.y);


    //         const p0p1Angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    //         const p0p2Angle = Math.atan2(p2.y - p0.y, p2.x - p0.x);

    //         // console.log("p0p1Angle = "+p0p1Angle+", p0p2Angle = "+p0p2Angle);

    //         let diff = p0p1Angle - p0p2Angle;
    //         // if(Math.abs(diff) === Math.PI){
    //         //     console.log("OOOOOK")

    //         // }
    //         // console.log("p0p1Angle",p0p1Angle)
    //         // console.log("p0p2Angle",p0p2Angle)
    //         // console.log("diff",diff)
    //         // console.log("\n\n")

  
    //         diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;

    //         // console.log("node1 = "+ clockwiseSortedSegments[i].nodes[1].id +", node2 = "+ clockwiseSortedSegments[nextSegIndex].nodes[1].id)
    //         // console.log("diff angle = ",diff);
    //         if (diff>0) {
    //             return [clockwiseSortedSegments[i].nodes[1], clockwiseSortedSegments[nextSegIndex].nodes[1]];
    //         }

    //     }

    //     // console.log("\n\n\n\n\n\n")

    //     return null;

    // }

    // getIntersectionOfTwoConsecutiveSegments(linkedNodes:[WallNode, WallNode]){ //inner intersection, outer intersection
    //     const p0 = this.position;
    //     const p1 = linkedNodes[0].position;
    //     const p2 = linkedNodes[1].position;

    //     const seg1Slope = (p1.y - p0.y) / (p1.x - p0.x);
    //     const seg2Slope = (p2.y - p0.y) / (p2.x - p0.x);

    //     const midSlope = (seg2Slope - seg1Slope) / 2;

    //     // const p0p1Angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    //     // const p0p2Angle = Math.atan2(p2.y - p0.y, p2.x - p0.x);

    //     // let diff = p0p1Angle - p0p2Angle;
    //     // diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;

    //     // console.log("diff", diff)
    //     // const a = diff / 2;


    // }

    // getMidSlope(linkedNodes:[WallNode, WallNode]): number{ //inner intersection, outer intersection
    //     const p0 = this.position;
    //     const p1 = linkedNodes[0].position;
    //     const p2 = linkedNodes[1].position;

    //     const seg1Slope = (p1.y - p0.y) / (p1.x - p0.x);
    //     const seg2Slope = (p2.y - p0.y) / (p2.x - p0.x);

    //     const midSlope = (seg2Slope - seg1Slope) / 2;
    //     return midSlope;
    //     // const p0p1Angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    //     // const p0p2Angle = Math.atan2(p2.y - p0.y, p2.x - p0.x);

    //     // let diff = p0p1Angle - p0p2Angle;
    //     // diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;

    //     // console.log("diff", diff)
    //     // const a = diff / 2;


    // }

    cloneWithoutLinkedNodes():WallNode{
        // id: string;
        // position: Position;
        // linkedNodes: WallNode[];
        // radius: number = 20;
        return new WallNode(this.id, new Position(this.position.x, this.position.y), []);
    }
}

export class Wall {
    id: string;
    numero: string = "";
    nodes: [WallNode, WallNode];
    sideline1Points: [Position, Position] = [new Position(0,0), new Position(0,0)];
    sideline2Points: [Position, Position] = [new Position(0,0), new Position(0,0)];
    points: Vector2D[] = [];

    constructor(nodes:[WallNode, WallNode]){
        // this.nodes = nodes.sort((a, b) => { 
        //     const sortedIds = [a.id, b.id].sort();
        //     const aIdIndex = sortedIds.findIndex(id => id === a.id);
        //     const bIdIndex = sortedIds.findIndex(id => id === b.id);
        //     return aIdIndex - bIdIndex;
        // });
        this.nodes = nodes;
        this.id = this.nodes[0].id + this.nodes[1].id;
        this.setSidelinesPoints();
    }

    sortUUIDs(uuid1: string, uuid2: string): [string, string] {
        const sortedUUIDs = [uuid1, uuid2].sort();
        return [sortedUUIDs[0], sortedUUIDs[1]];
      }

    setSidelinesPoints(){
        const p1 = this.nodes[0].position;
        const p2 = this.nodes[1].position;
        
        
        const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    
    
        const p1p2AngleMinHalfPI = p1p2Angle - Math.PI/2;
        let diff = p1p2AngleMinHalfPI;
        diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;
    
        // console.log("diff = "+diff);
    
        const d = WALL_WIDTH / 2;
        const hyp = d;
        const a = diff;
        const adj = Math.cos(a) * hyp;
        const opp = Math.sin(a) * hyp;
    
        // console.log("adj = "+adj);
        // console.log("opp = "+opp);
    
        const sl1p1X = p1.x + adj; 
        const sl1p1Y = p1.y + opp; 
    
        const sl2p1X = p1.x - adj; 
        const sl2p1Y = p1.y - opp; 
    
        // console.log("node1 = "+this.nodes[0].id, ", node2 = "+this.nodes[1].id)
    
        const sl1p1 = new Position(sl1p1X, sl1p1Y);
        const sl2p1 = new Position(sl2p1X, sl2p1Y);
    
    
        //l1s1p2 and l1s1p2 
    
        const sl1p2X = p2.x + adj; 
        const sl1p2Y = p2.y + opp; 
    
        const sl2p2X = p2.x - adj; 
        const sl2p2Y = p2.y - opp; 
    
    
        const sl1p2 = new Position(sl1p2X, sl1p2Y);
        const sl2p2 = new Position(sl2p2X, sl2p2Y);
        
        this.sideline1Points = [sl1p1, sl1p2];
        this.sideline2Points = [sl2p1, sl2p2];
    }

    cloneWithoutNodes():Wall{
        const segmentClone = new Wall(this.nodes);
        segmentClone.id = this.id;
        segmentClone.numero = this.numero;
        segmentClone.sideline1Points = [
            new Position(this.sideline1Points[0].x, this.sideline1Points[0].y),
            new Position(this.sideline1Points[1].x, this.sideline1Points[1].y),
        ];
        segmentClone.sideline2Points = [
            new Position(this.sideline2Points[0].x, this.sideline2Points[0].y),
            new Position(this.sideline2Points[1].x, this.sideline2Points[1].y),
        ];
        return segmentClone;
    }
}


export class TestPoint{
    id:string;
    x:number;
    y:number;
    color:string;

    constructor(id: string, x:number, y:number, color:string){
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
    } 
}

export enum PlanElementSheetTypeName {Wall, REP};
export interface PlanElementSheetData{
    planElementId: string,
    wallId: string | undefined,
    typeName: PlanElementSheetTypeName,
    numero:string
  }
  

export class AddWallSession{
    joinedWalls:JoinedWalls;
    wall:Wall;
    draggingNode:WallNode;

    constructor(joinedWalls:JoinedWalls, wall:Wall, draggingNode:WallNode){
        this.joinedWalls = joinedWalls;
        this.wall = wall;
        this.draggingNode = draggingNode;
    }
}

export interface linePoints {
    p1: Vector2D,
    p2: Vector2D,
}

export interface MagnetData{
    activeOnAxes: boolean,
    node:WallNode | null,
    wall: Wall | null,
    linePoints: linePoints | null,
}