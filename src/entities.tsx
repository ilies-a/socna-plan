import { v4 } from 'uuid';
import { cloneArray, doSegmentsIntersect, getDistance, isPointInPolygon, sortPointsClockwise } from './utils';
import { BIG_NUMBER, WALL_WIDTH } from './global';

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
        const segments: {[id:string]:Wall;} = {};
        const segmentsDone: {[id: string]: boolean;} = {};
        
        for(const nodeId in this.nodes){
            const node = this.nodes[nodeId];
            for(const linkedNode of node.linkedNodes){
                const sortedNodesById:[WallNode, WallNode] = [node, linkedNode];
                this.sortNodesByIdInAlphabeticOrder(sortedNodesById);
                const sortedConcatenatedIds = sortedNodesById[0].id + sortedNodesById[1].id;
                if(segmentsDone[sortedConcatenatedIds]) continue;
                segments[sortedConcatenatedIds] = (new Wall([sortedNodesById[0], sortedNodesById[1]]));
                segmentsDone[sortedConcatenatedIds] = true;
            }
        }
        // for(const nodeId in this.nodes){
        //     const node = this.nodes[nodeId];
        //     if(node.linkedNodes.length < 3) continue;
        //     const linkedNodes = node.getReflexAngleLinkedNodes();
        //     // console.log("reflexAngle = ", linkedNodes);
        //     if(!linkedNodes) continue;
        //     node.getIntersectionOfTwoConsecutiveSegments(linkedNodes);
        // }
        
        return segments;
    }

    setWalls(){
        const updatedWalls = this.getWalls();

        //walls may have some data binded like a numero we need to copy it:
        for(const wallId in this.walls){
            if(updatedWalls.hasOwnProperty(wallId)){
                updatedWalls[wallId].numero = this.walls[wallId].numero;
            }
        }

        this.walls = updatedWalls;
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
        
                const precision = 4;
                let m1 = l1p2.x - l1p1.x != 0 ? (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x) : BIG_NUMBER;
                m1 = parseFloat(m1.toPrecision(precision));
                let m2 = l2p2.x - l2p1.x != 0 ? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(precision));

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
                m1 = parseFloat(m1.toPrecision(precision));
                m2 = l2p2.x - l2p1.x != 0? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(precision));
        
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

    addWallFromWall(startingWall:Wall, nodesPositions:[Vector2D, Vector2D]):Wall{
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
        // console.log("", this.walls[newWallNode1.id+newWallNode2.id])
        // console.log("", this.walls[newWallNode2.id+newWallNode1.id])


        // const newWall = new Wall([newWallNode1, newWallNode2]);
        
        const sortedNodesIds = [newWallNode1.id, newWallNode2.id].sort();

        // newWall.id = sortedNodesIds[0] + sortedNodesIds[1];

        return this.walls[sortedNodesIds[0] + sortedNodesIds[1]];
    }

    addWallFromNode(startingNode:WallNode, endingNodePosition:Vector2D):Wall{
        const endingNode = new WallNode(v4(), endingNodePosition, [startingNode]);
        startingNode.linkedNodes.push(endingNode);
        this.nodes[endingNode.id] = endingNode;
        this.setWalls();
        console.log("startingNode.id",startingNode.id)
        console.log("endingNode.id",endingNode.id)
        console.log("")
        const sortedNodesIds = [startingNode.id, endingNode.id].sort();
        console.log("sortedNodesIds[0]",sortedNodesIds[0])
        console.log("sortedNodesIds[1]",sortedNodesIds[1])
        console.log("")
        return this.walls[sortedNodesIds[0] + sortedNodesIds[1]];
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
        for(const linkedNode of node2.linkedNodes){
            node1.linkedNodes.push(linkedNode); //no need to check if already has linkedNode it's theorically impossible
            linkedNode.linkedNodes.push(node1);

            const linkedNodeNode2Idx = linkedNode.linkedNodes.findIndex((node) => node.id === node2.id);
            linkedNode.linkedNodes.splice(linkedNodeNode2Idx, 1);
        }

        delete this.nodes[node2.id];

        this.setWalls();
    }

    joinDraggedNodeAndCreatedNode(node:WallNode, wall:Wall){
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
    wallId: string | null,
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


export interface MagnetData{
    activeOnAxes: boolean,
    node:WallNode | null,
    wall: Wall | null,
}