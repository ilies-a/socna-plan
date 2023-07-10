import { Size, Vector2D } from "@/entities";
import { SELECTED_ITEM_COLOR } from "@/global";
import { ReactNode, useCallback, useMemo } from "react";
import { Circle, Group, Rect, RegularPolygon } from "react-konva";

type Props = {
    scale:number
    selected: boolean
};

const AnomalyComponent: React.FC<Props> = ({scale, selected}) => {
    const getRadius: number = useMemo(()=>{
        return 20 * scale
    },[scale]);

    const getTriangles = useCallback(():ReactNode[]=>{
        const triangles = [];
        // const x0 = 0;
        // const y0 = 0;

        for(let i=0; i<4; i++){
            
            let x = 0;
            let y = 0;
            let rotation = 0;

            if(i==0){
                rotation = 180;
            }else if(i==1){
                y = getRadius * 2;
            }else if(i==2){
                x = -getRadius;
                y = getRadius;
                rotation = 90;
            }else{
                x = getRadius;
                y = getRadius;
                rotation = -90;
            }
            // x+=x0;
            // y+=y0;

            triangles.push(
                <RegularPolygon
                    key={i}
                    x = {x}
                    y = {y}
                    sides = {3}
                    radius= {getRadius}
                    rotation={rotation}
                    fill= "red"
                    stroke={selected?SELECTED_ITEM_COLOR:"black"}
                    strokeWidth={1}
                />
            )
        }

        return triangles;
    }, [getRadius, selected]);

    return (
        <Group>
            <Circle
                y = {getRadius}
                radius={getRadius * 2}
            />
            {
                getTriangles().map(triangle => triangle)
            }

        </Group>
    )
};

export default AnomalyComponent;
